import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import OpenAI from 'openai';

// Handle ESM/CJS interop
const traverse = (_traverse as any).default || _traverse;

export interface ScoringResult {
  score: number;
  explanation: string;
  tokensUsed: number;
  cost: number;
  originalIdentifierCount: number;
  unminifiedIdentifierCount: number;
}

/**
 * Extract identifiers from code string
 */
export function extractIdentifiers(code: string): string[] {
  const identifiers = new Set<string>();

  try {
    const ast = parse(code, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });

    traverse(ast, {
      // Get binding identifiers (declarations)
      BindingIdentifier(path: any) {
        const name = path.node.name;
        // Skip single-letter names (likely still minified)
        if (name && name.length > 1) {
          identifiers.add(name);
        }
      },
    });
  } catch (error) {
    console.error('Parse error during identifier extraction:', error);
  }

  return Array.from(identifiers).sort();
}

/**
 * Score the semantic quality of unminified code against the original source
 */
export async function scoreSemantic(
  originalPath: string,
  unminifiedPath: string,
  apiKey?: string
): Promise<ScoringResult> {
  if (!apiKey && !process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is required for semantic scoring');
  }

  const client = new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });

  // Read files
  const originalCode = readFileSync(originalPath, 'utf-8');
  const unminifiedCode = readFileSync(unminifiedPath, 'utf-8');

  // Extract identifiers
  const originalIds = extractIdentifiers(originalCode);
  const unminifiedIds = extractIdentifiers(unminifiedCode);

  // Sample if too large (keep under ~2000 tokens for identifiers)
  const maxIds = 200;
  let sampledOriginal = originalIds;
  let sampledUnminified = unminifiedIds;

  if (originalIds.length > maxIds) {
    // Deterministic sampling: take every Nth identifier
    const step = Math.ceil(originalIds.length / maxIds);
    sampledOriginal = originalIds.filter((_, i) => i % step === 0);
  }

  if (unminifiedIds.length > maxIds) {
    const step = Math.ceil(unminifiedIds.length / maxIds);
    sampledUnminified = unminifiedIds.filter((_, i) => i % step === 0);
  }

  const prompt = `You are evaluating how well an AI deobfuscator renamed JavaScript identifiers.

ORIGINAL IDENTIFIERS (from well-named source code):
${sampledOriginal.join(', ')}

DEOBFUSCATED IDENTIFIERS (AI-generated names for minified code):
${sampledUnminified.join(', ')}

Task: Score 0-100 how well the deobfuscated names capture the SEMANTIC MEANING of the code.

Scoring guidelines:
- 90-100: Most names are semantically equivalent (config=configuration, opts=options, cb=callback)
- 70-89: Good semantic understanding, minor misses
- 50-69: Moderate understanding, some names are generic or wrong
- 30-49: Poor understanding, many generic names (data, value, item)
- 0-29: Mostly meaningless or random names

Consider:
- Synonyms are equivalent (error=err, response=res, callback=cb)
- Abbreviations are equivalent (config=configuration, opts=options)
- CamelCase vs snake_case doesn't matter
- The deobfuscator may find MORE identifiers (expanded from minified single-letters)
- Focus on whether names DESCRIBE what the code does

Respond with JSON only:
{
  "score": <0-100>,
  "explanation": "<brief explanation of score>"
}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0].message.content || '{}';
  let result;
  try {
    result = JSON.parse(content);
  } catch (e) {
    result = { score: 0, explanation: 'Failed to parse LLM response' };
  }
  
  const tokensUsed = response.usage?.total_tokens || 0;
  
  // Calculate cost (GPT-4o pricing: $2.50/1M input, $10/1M output)
  // This is a rough estimate, a more precise one would separate input/output tokens
  const cost = (tokensUsed * 0.000005); 

  return {
    score: result.score || 0,
    explanation: result.explanation || 'No explanation provided',
    tokensUsed,
    cost,
    originalIdentifierCount: sampledOriginal.length,
    unminifiedIdentifierCount: sampledUnminified.length,
  };
}

#!/usr/bin/env npx tsx

/**
 * Semantic scoring using LLM-as-judge.
 *
 * Extracts identifiers from original and unminified files,
 * then asks GPT-4o to score how well the unminified names
 * capture the semantic meaning of the originals.
 *
 * Usage:
 *   OPENAI_API_KEY=... npx tsx scripts/score-semantic.ts <original.js> <unminified.js>
 */

import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import OpenAI from 'openai';

// Handle ESM/CJS interop
const traverse = (_traverse as any).default || _traverse;

interface ScoringResult {
  originalFile: string;
  unminifiedFile: string;
  originalIdentifiers: string[];
  unminifiedIdentifiers: string[];
  score: number;
  explanation: string;
  tokensUsed: number;
  cost: number;
}

function extractIdentifiers(code: string): string[] {
  const identifiers = new Set<string>();

  try {
    const ast = parse(code, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    });

    traverse(ast, {
      // Get binding identifiers (declarations)
      BindingIdentifier(path) {
        const name = path.node.name;
        // Skip single-letter names (likely still minified)
        if (name.length > 1) {
          identifiers.add(name);
        }
      },
    });
  } catch (error) {
    console.error('Parse error:', error);
  }

  return Array.from(identifiers).sort();
}

async function scoreWithLLM(
  originalIds: string[],
  unminifiedIds: string[]
): Promise<{ score: number; explanation: string; tokensUsed: number }> {
  const client = new OpenAI();

  const prompt = `You are evaluating how well an AI deobfuscator renamed JavaScript identifiers.

ORIGINAL IDENTIFIERS (from well-named source code):
${originalIds.join(', ')}

DEOBFUSCATED IDENTIFIERS (AI-generated names for minified code):
${unminifiedIds.join(', ')}

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
  const result = JSON.parse(content);
  const tokensUsed = response.usage?.total_tokens || 0;

  return {
    score: result.score || 0,
    explanation: result.explanation || 'No explanation provided',
    tokensUsed,
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/score-semantic.ts <original.js> <unminified.js>');
    process.exit(1);
  }

  const [originalPath, unminifiedPath] = args;

  console.log('Semantic Scoring');
  console.log('================\n');
  console.log(`Original:   ${originalPath}`);
  console.log(`Unminified: ${unminifiedPath}\n`);

  // Read files
  const originalCode = readFileSync(originalPath, 'utf-8');
  const unminifiedCode = readFileSync(unminifiedPath, 'utf-8');

  // Extract identifiers
  console.log('Extracting identifiers...');
  const originalIds = extractIdentifiers(originalCode);
  const unminifiedIds = extractIdentifiers(unminifiedCode);

  console.log(`  Original: ${originalIds.length} identifiers`);
  console.log(`  Unminified: ${unminifiedIds.length} identifiers\n`);

  // Sample if too large (keep under ~2000 tokens for identifiers)
  const maxIds = 200;
  let sampledOriginal = originalIds;
  let sampledUnminified = unminifiedIds;

  if (originalIds.length > maxIds) {
    // Deterministic sampling: take every Nth identifier
    const step = Math.ceil(originalIds.length / maxIds);
    sampledOriginal = originalIds.filter((_, i) => i % step === 0);
    console.log(`  Sampled original to ${sampledOriginal.length} identifiers`);
  }

  if (unminifiedIds.length > maxIds) {
    const step = Math.ceil(unminifiedIds.length / maxIds);
    sampledUnminified = unminifiedIds.filter((_, i) => i % step === 0);
    console.log(`  Sampled unminified to ${sampledUnminified.length} identifiers`);
  }

  // Score with LLM
  console.log('\nScoring with GPT-4o...');
  const { score, explanation, tokensUsed } = await scoreWithLLM(
    sampledOriginal,
    sampledUnminified
  );

  // Calculate cost (GPT-4o pricing: $2.50/1M input, $10/1M output)
  const cost = (tokensUsed * 0.000005); // Rough estimate

  // Output results
  console.log('\n' + '='.repeat(50));
  console.log('RESULTS');
  console.log('='.repeat(50));
  console.log(`\nSemantic Score: ${score}/100`);
  console.log(`\nExplanation: ${explanation}`);
  console.log(`\nTokens used: ${tokensUsed}`);
  console.log(`Estimated cost: $${cost.toFixed(4)}`);

  // JSON output for programmatic use
  const result: ScoringResult = {
    originalFile: originalPath,
    unminifiedFile: unminifiedPath,
    originalIdentifiers: sampledOriginal,
    unminifiedIdentifiers: sampledUnminified,
    score,
    explanation,
    tokensUsed,
    cost,
  };

  console.log('\nJSON Output:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);

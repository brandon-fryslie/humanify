/**
 * Output validation: Verify renamed output is valid JavaScript
 */

import { parse as parseSync } from "@babel/parser";
import * as babelTraverse from "@babel/traverse";

// Handle babel traverse import quirk
const traverse: typeof babelTraverse.default.default = (
  typeof babelTraverse.default === "function"
    ? babelTraverse.default
    : babelTraverse.default.default
) as any;

export interface ValidationResult {
  syntaxValid: boolean;
  structureMatch: boolean;
  undefinedVariables: string[];
  exportsPreserved: boolean;
  warnings: string[];
  status: "PASS" | "FAIL" | "WARN";
}

export interface CodeStructure {
  functions: number;
  classes: number;
  variables: number;
  exports: number;
}

/**
 * Validate syntax by parsing with Babel
 */
function validateSyntax(code: string): { valid: boolean; error?: string } {
  try {
    parseSync(code, {
      sourceType: "module",
      plugins: ["typescript"]
    });
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Analyze code structure (function/class/variable counts)
 */
function analyzeStructure(code: string): CodeStructure {
  const ast = parseSync(code, {
    sourceType: "module",
    plugins: ["typescript"]
  });

  const structure: CodeStructure = {
    functions: 0,
    classes: 0,
    variables: 0,
    exports: 0
  };

  traverse(ast, {
    FunctionDeclaration() {
      structure.functions++;
    },
    FunctionExpression() {
      structure.functions++;
    },
    ArrowFunctionExpression() {
      structure.functions++;
    },
    ClassDeclaration() {
      structure.classes++;
    },
    VariableDeclarator() {
      structure.variables++;
    },
    ExportNamedDeclaration() {
      structure.exports++;
    },
    ExportDefaultDeclaration() {
      structure.exports++;
    }
  });

  return structure;
}

/**
 * Detect undefined variables in code
 */
function detectUndefinedVariables(code: string): string[] {
  const ast = parseSync(code, {
    sourceType: "module",
    plugins: ["typescript"]
  });

  const undefinedRefs: string[] = [];
  const definedBindings = new Set<string>();

  // First pass: collect all bindings
  traverse(ast, {
    Identifier(path: any) {
      if (path.isBindingIdentifier()) {
        definedBindings.add(path.node.name);
      }
    }
  });

  // Second pass: find undefined references
  traverse(ast, {
    Identifier(path: any) {
      if (
        path.isReferencedIdentifier() &&
        !definedBindings.has(path.node.name) &&
        !path.scope.hasBinding(path.node.name)
      ) {
        if (!undefinedRefs.includes(path.node.name)) {
          undefinedRefs.push(path.node.name);
        }
      }
    }
  });

  return undefinedRefs;
}

/**
 * Validate output against input
 */
export async function validateOutput(
  inputCode: string,
  outputCode: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    syntaxValid: false,
    structureMatch: false,
    undefinedVariables: [],
    exportsPreserved: false,
    warnings: [],
    status: "FAIL"
  };

  // 1. Syntax validation
  const syntaxCheck = validateSyntax(outputCode);
  result.syntaxValid = syntaxCheck.valid;

  if (!syntaxCheck.valid) {
    result.warnings.push(`Syntax error: ${syntaxCheck.error}`);
    return result;
  }

  // 2. Structure comparison
  try {
    const inputStructure = analyzeStructure(inputCode);
    const outputStructure = analyzeStructure(outputCode);

    // Check if structure is preserved (allowing small variations)
    const functionsMatch =
      Math.abs(inputStructure.functions - outputStructure.functions) <= 1;
    const classesMatch =
      Math.abs(inputStructure.classes - outputStructure.classes) <= 1;
    const variablesMatch =
      Math.abs(inputStructure.variables - outputStructure.variables) <= 2;
    const exportsMatch =
      Math.abs(inputStructure.exports - outputStructure.exports) <= 1;

    result.structureMatch = functionsMatch && classesMatch && variablesMatch;
    result.exportsPreserved = exportsMatch;

    if (!functionsMatch) {
      result.warnings.push(
        `Function count mismatch: input=${inputStructure.functions}, output=${outputStructure.functions}`
      );
    }
    if (!classesMatch) {
      result.warnings.push(
        `Class count mismatch: input=${inputStructure.classes}, output=${outputStructure.classes}`
      );
    }
    if (!variablesMatch) {
      result.warnings.push(
        `Variable count mismatch: input=${inputStructure.variables}, output=${outputStructure.variables}`
      );
    }
    if (!exportsMatch) {
      result.warnings.push(
        `Export count mismatch: input=${inputStructure.exports}, output=${outputStructure.exports}`
      );
    }
  } catch (error: any) {
    result.warnings.push(`Structure analysis failed: ${error.message}`);
  }

  // 3. Detect undefined variables
  try {
    result.undefinedVariables = detectUndefinedVariables(outputCode);
    if (result.undefinedVariables.length > 0) {
      result.warnings.push(
        `Undefined variables detected: ${result.undefinedVariables.join(", ")}`
      );
    }
  } catch (error: any) {
    result.warnings.push(`Undefined variable detection failed: ${error.message}`);
  }

  // 4. Determine overall status
  if (result.syntaxValid && result.structureMatch && result.exportsPreserved) {
    result.status = result.warnings.length > 0 ? "WARN" : "PASS";
  } else if (result.syntaxValid) {
    result.status = "WARN";
  } else {
    result.status = "FAIL";
  }

  return result;
}

/**
 * Print validation results to console
 */
export function printValidationResults(result: ValidationResult): void {
  console.log("\n=== Output Validation ===");

  const statusIcon = {
    PASS: "✅",
    WARN: "⚠️",
    FAIL: "❌"
  }[result.status];

  console.log(`\nStatus: ${statusIcon} ${result.status}`);

  console.log("\nChecks:");
  console.log(
    `  Syntax valid:          ${result.syntaxValid ? "✅" : "❌"}`
  );
  console.log(
    `  Structure preserved:   ${result.structureMatch ? "✅" : "⚠️"}`
  );
  console.log(
    `  Exports preserved:     ${result.exportsPreserved ? "✅" : "⚠️"}`
  );
  console.log(
    `  Undefined variables:   ${result.undefinedVariables.length === 0 ? "✅" : "⚠️"} ${result.undefinedVariables.length > 0 ? `(${result.undefinedVariables.length} found)` : ""}`
  );

  if (result.warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of result.warnings) {
      console.log(`  • ${warning}`);
    }
  }

  console.log();
}

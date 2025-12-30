/**
 * CONSISTENCY ENFORCER TESTS
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createConsistencyEnforcer, Identifier, EnforcementResult } from './consistency-enforcer.js';

describe('ConsistencyEnforcer', () => {
  describe('naming conventions', () => {
    it('should enforce camelCase for variables', () => {
      const enforcer = createConsistencyEnforcer({ variableConvention: 'camelCase' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'user_name',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 5,
          context: 'const user_name = "test";',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].newName, 'userName');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('enforce-variable-convention'));
    });

    it('should enforce PascalCase for classes', () => {
      const enforcer = createConsistencyEnforcer({ classConvention: 'PascalCase' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'userManager',
          bindingType: 'class',
          scopeId: 'scope1',
          references: 3,
          context: 'class userManager {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].newName, 'UserManager');
      assert.strictEqual(results[0].changed, true);
    });

    it('should enforce snake_case for variables when configured', () => {
      const enforcer = createConsistencyEnforcer({ variableConvention: 'snake_case' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'userName',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 5,
          context: 'const userName = "test";',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].newName, 'user_name');
      assert.strictEqual(results[0].changed, true);
    });

    it('should handle already-correct naming', () => {
      const enforcer = createConsistencyEnforcer({ variableConvention: 'camelCase' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'userName',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 5,
          context: 'const userName = "test";',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].changed, false);
      assert.strictEqual(results[0].newName, 'userName');
    });
  });

  describe('fix common mistakes', () => {
    it('should fix double prefixes', () => {
      const enforcer = createConsistencyEnforcer({ fixCommonMistakes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'isIsValid',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const isIsValid = true;',
        },
        {
          id: 'id2',
          name: 'hasHasPermission',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const hasHasPermission = false;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'isValid');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('fix-double-prefixes'));

      assert.strictEqual(results[1].newName, 'hasPermission');
      assert.strictEqual(results[1].changed, true);
    });

    it('should fix redundant suffixes (PascalCase)', () => {
      const enforcer = createConsistencyEnforcer({ fixCommonMistakes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'handleDataData',
          bindingType: 'function',
          scopeId: 'scope1',
          references: 3,
          context: 'function handleDataData() {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'handleData');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('fix-redundant-suffixes'));
    });

    it('should NOT fix non-redundant repetition', () => {
      const enforcer = createConsistencyEnforcer({ fixCommonMistakes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'dataProcessor', // Not redundant
          bindingType: 'var',
          scopeId: 'scope1',
          references: 1,
          context: 'const dataProcessor = {};',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should not change non-redundant names
      assert.strictEqual(results[0].newName, 'dataProcessor');
    });
  });

  describe('boolean prefixes', () => {
    it('should add "is" prefix for likely boolean variables', () => {
      const enforcer = createConsistencyEnforcer({ applyBooleanPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'valid',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 3,
          context: 'const valid = true; if (valid) {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'isValid');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('apply-boolean-prefixes'));
    });

    it('should NOT add prefix if already present', () => {
      const enforcer = createConsistencyEnforcer({ applyBooleanPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'isValid',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 3,
          context: 'const isValid = true;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'isValid');
      assert.strictEqual(results[0].changed, false);
    });

    it('should skip non-boolean variables', () => {
      const enforcer = createConsistencyEnforcer({ applyBooleanPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'count',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 3,
          context: 'const count = 42;', // No boolean indicators
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should not add prefix without boolean context
      assert.strictEqual(results[0].newName, 'count');
      assert.strictEqual(results[0].changed, false);
    });

    it('should infer prefix based on context', () => {
      const enforcer = createConsistencyEnforcer({ applyBooleanPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'enabled',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const enabled = true; if (enabled) {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should use "is" prefix for enabled/disabled
      assert.strictEqual(results[0].newName, 'isEnabled');
      assert.strictEqual(results[0].changed, true);
    });
  });

  describe('accessor prefixes', () => {
    it('should add "get" prefix for getter functions', () => {
      const enforcer = createConsistencyEnforcer({ applyAccessorPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'name',
          bindingType: 'function',
          scopeId: 'scope1',
          references: 2,
          context: 'function name() { return this._name; }',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'getName');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('apply-accessor-prefixes'));
    });

    it('should add "set" prefix for setter functions', () => {
      const enforcer = createConsistencyEnforcer({ applyAccessorPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'name',
          bindingType: 'function',
          scopeId: 'scope1',
          references: 2,
          context: 'function name(value) { this._name = value; }',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'setName');
      assert.strictEqual(results[0].changed, true);
    });

    it('should NOT add prefix if already present', () => {
      const enforcer = createConsistencyEnforcer({ applyAccessorPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'getName',
          bindingType: 'function',
          scopeId: 'scope1',
          references: 2,
          context: 'function getName() { return this._name; }',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'getName');
      assert.strictEqual(results[0].changed, false);
    });

    it('should only apply to functions', () => {
      const enforcer = createConsistencyEnforcer({ applyAccessorPrefixes: true });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'value',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const value = getData();',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should not add prefix to variables
      assert.strictEqual(results[0].newName, 'value');
      assert.strictEqual(results[0].changed, false);
    });
  });

  describe('custom rules', () => {
    it('should apply custom rules', () => {
      const enforcer = createConsistencyEnforcer({
        customRules: [
          {
            name: 'test-rule',
            description: 'Test custom rule',
            apply: (name, identifier) => {
              if (name === 'foo') {
                return 'bar';
              }
              return null;
            },
          },
        ],
      });

      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'foo',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 1,
          context: 'const foo = 1;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'bar');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('test-rule'));
    });

    it('should apply rules in sequence', () => {
      const enforcer = createConsistencyEnforcer({
        fixCommonMistakes: false,
        variableConvention: 'camelCase',
        customRules: [
          {
            name: 'add-prefix',
            description: 'Add test prefix',
            apply: (name) => `test${name.charAt(0).toUpperCase()}${name.slice(1)}`,
          },
        ],
      });

      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'value',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 1,
          context: 'const value = 1;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should apply both convention and custom rule
      assert.strictEqual(results[0].newName, 'testValue');
      assert.strictEqual(results[0].changed, true);
      assert.ok(results[0].rulesApplied.includes('add-prefix'));
    });
  });

  describe('getSummary', () => {
    it('should provide accurate statistics', () => {
      const enforcer = createConsistencyEnforcer();
      const results: EnforcementResult[] = [
        {
          id: 'id1',
          originalName: 'foo',
          newName: 'bar',
          rulesApplied: ['rule1'],
          changed: true,
        },
        {
          id: 'id2',
          originalName: 'baz',
          newName: 'baz',
          rulesApplied: [],
          changed: false,
        },
        {
          id: 'id3',
          originalName: 'qux',
          newName: 'quux',
          rulesApplied: ['rule1', 'rule2'],
          changed: true,
        },
      ];

      const summary = enforcer.getSummary(results);

      assert.strictEqual(summary.total, 3);
      assert.strictEqual(summary.changed, 2);
      assert.strictEqual(summary.unchanged, 1);
      assert.strictEqual(summary.byRule['rule1'], 2);
      assert.strictEqual(summary.byRule['rule2'], 1);
    });

    it('should handle empty results', () => {
      const enforcer = createConsistencyEnforcer();
      const summary = enforcer.getSummary([]);

      assert.strictEqual(summary.total, 0);
      assert.strictEqual(summary.changed, 0);
      assert.strictEqual(summary.unchanged, 0);
      assert.deepStrictEqual(summary.byRule, {});
    });
  });

  describe('edge cases', () => {
    it('should handle empty identifier list', () => {
      const enforcer = createConsistencyEnforcer();
      const results = enforcer.enforce([]);

      assert.strictEqual(results.length, 0);
    });

    it('should handle single-letter identifiers', () => {
      const enforcer = createConsistencyEnforcer({ variableConvention: 'camelCase' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'x',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 1,
          context: 'const x = 1;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should handle gracefully
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].newName, 'x');
    });

    it('should handle mixed binding types', () => {
      const enforcer = createConsistencyEnforcer({
        variableConvention: 'camelCase',
        classConvention: 'PascalCase',
      });

      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'user_data',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const user_data = {};',
        },
        {
          id: 'id2',
          name: 'user_manager',
          bindingType: 'class',
          scopeId: 'scope1',
          references: 3,
          context: 'class user_manager {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'userData');
      assert.strictEqual(results[1].newName, 'UserManager');
    });

    it('should handle all-uppercase identifiers', () => {
      const enforcer = createConsistencyEnforcer({ variableConvention: 'camelCase' });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'MAX_VALUE',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 5,
          context: 'const MAX_VALUE = 100;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      assert.strictEqual(results[0].newName, 'maxValue');
      assert.strictEqual(results[0].changed, true);
    });
  });

  describe('configuration', () => {
    it('should respect applyBooleanPrefixes config', () => {
      const enforcer = createConsistencyEnforcer({ applyBooleanPrefixes: false });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'valid',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const valid = true; if (valid) {}',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should NOT add prefix when disabled
      const booleanRules = results[0].rulesApplied.filter((r) => r.includes('boolean'));
      assert.strictEqual(booleanRules.length, 0);
    });

    it('should respect applyAccessorPrefixes config', () => {
      const enforcer = createConsistencyEnforcer({ applyAccessorPrefixes: false });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'name',
          bindingType: 'function',
          scopeId: 'scope1',
          references: 2,
          context: 'function name() { return this._name; }',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should NOT add prefix when disabled
      const accessorRules = results[0].rulesApplied.filter((r) => r.includes('accessor'));
      assert.strictEqual(accessorRules.length, 0);
    });

    it('should respect fixCommonMistakes config', () => {
      const enforcer = createConsistencyEnforcer({ fixCommonMistakes: false });
      const identifiers: Identifier[] = [
        {
          id: 'id1',
          name: 'isIsValid',
          bindingType: 'var',
          scopeId: 'scope1',
          references: 2,
          context: 'const isIsValid = true;',
        },
      ];

      const results = enforcer.enforce(identifiers);

      // Should NOT fix when disabled
      const fixRules = results[0].rulesApplied.filter((r) => r.includes('fix-'));
      assert.strictEqual(fixRules.length, 0);
    });
  });
});

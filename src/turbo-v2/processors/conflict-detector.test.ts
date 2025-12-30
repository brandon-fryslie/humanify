/**
 * CONFLICT DETECTOR TESTS
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createConflictDetector, RenameHistory, Conflict } from './conflict-detector.js';

describe('ConflictDetector', () => {
  describe('detectDuplicateOriginals', () => {
    it('should detect same identifier renamed differently', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'scope1#a', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'scope2#a', originalName: 'a', currentName: 'options', scopeId: 'scope2', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      assert.strictEqual(conflicts.length, 1);
      assert.strictEqual(conflicts[0].type, 'scope-inconsistency');
      assert.strictEqual(conflicts[0].severity, 'warning');
      assert.ok(conflicts[0].message.includes('config'));
      assert.ok(conflicts[0].message.includes('options'));
    });

    it('should NOT flag same identifier with same new name', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'scope1#a', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'scope2#a', originalName: 'a', currentName: 'config', scopeId: 'scope2', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      // Should NOT detect this as conflict - consistent naming
      const duplicateConflicts = conflicts.filter((c) => c.type === 'scope-inconsistency');
      assert.strictEqual(duplicateConflicts.length, 0);
    });

    it('should handle multiple different renames for same original', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'scope1#x', originalName: 'x', currentName: 'data', scopeId: 'scope1', bindingType: 'var' },
        { id: 'scope2#x', originalName: 'x', currentName: 'result', scopeId: 'scope2', bindingType: 'var' },
        { id: 'scope3#x', originalName: 'x', currentName: 'value', scopeId: 'scope3', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      assert.strictEqual(conflicts.length, 1);
      assert.ok(conflicts[0].message.includes('3 different names'));
      assert.strictEqual(conflicts[0].identifiers.length, 3);
    });
  });

  describe('detectSimilarNames', () => {
    it('should detect highly similar names for different identifiers', () => {
      const detector = createConflictDetector({ similarityThreshold: 0.8 });
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'processData', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'procesData', scopeId: 'scope1', bindingType: 'function' }, // Typo
      ];

      const conflicts = detector.detectConflicts(history);

      const similarConflicts = conflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(similarConflicts.length, 1);
      assert.ok(similarConflicts[0].message.includes('processData'));
      assert.ok(similarConflicts[0].message.includes('procesData'));
    });

    it('should NOT flag dissimilar names', () => {
      const detector = createConflictDetector({ similarityThreshold: 0.8 });
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'id2', originalName: 'b', currentName: 'validator', scopeId: 'scope1', bindingType: 'function' },
      ];

      const conflicts = detector.detectConflicts(history);

      const similarConflicts = conflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(similarConflicts.length, 0);
    });

    it('should skip identical names for same identifier', () => {
      const detector = createConflictDetector({ similarityThreshold: 0.8 });
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'id1', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' }, // Duplicate
      ];

      const conflicts = detector.detectConflicts(history);

      const similarConflicts = conflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(similarConflicts.length, 0);
    });

    it('should compute similarity correctly', () => {
      const detector = createConflictDetector({ similarityThreshold: 0.8 });

      const history1: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'userData', scopeId: 'scope1', bindingType: 'var' },
        { id: 'id2', originalName: 'b', currentName: 'userdata', scopeId: 'scope1', bindingType: 'var' },
      ];
      const conflicts1 = detector.detectConflicts(history1);
      // These are 87.5% similar, should be flagged with 0.8 threshold
      const similar1 = conflicts1.filter((c) => c.type === 'similar-names');
      assert.strictEqual(similar1.length, 1);

      const history2: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'handler', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'validator', scopeId: 'scope1', bindingType: 'function' },
      ];
      const conflicts2 = detector.detectConflicts(history2);
      const similar2 = conflicts2.filter((c) => c.type === 'similar-names');
      // These are dissimilar, should NOT be flagged
      assert.strictEqual(similar2.length, 0);
    });
  });

  describe('detectPatternInconsistencies', () => {
    it('should detect mix of camelCase and snake_case', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        // Majority camelCase
        { id: 'id1', originalName: 'a', currentName: 'handleClick', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'processData', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id3', originalName: 'c', currentName: 'validateInput', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id4', originalName: 'd', currentName: 'formatOutput', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id5', originalName: 'e', currentName: 'parseConfig', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id6', originalName: 'f', currentName: 'checkValid', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id7', originalName: 'g', currentName: 'runTests', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id8', originalName: 'h', currentName: 'buildQuery', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id9', originalName: 'i', currentName: 'sendRequest', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id10', originalName: 'j', currentName: 'closeConnection', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id11', originalName: 'k', currentName: 'openStream', scopeId: 'scope1', bindingType: 'function' },
        // Minority snake_case (should trigger warning if > 20%)
        { id: 'id12', originalName: 'l', currentName: 'handle_error', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id13', originalName: 'm', currentName: 'process_input', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id14', originalName: 'n', currentName: 'validate_data', scopeId: 'scope1', bindingType: 'function' },
      ];

      const conflicts = detector.detectConflicts(history);

      const patternConflicts = conflicts.filter((c) => c.type === 'scope-inconsistency' && c.message.includes('convention'));
      assert.strictEqual(patternConflicts.length, 1);
      assert.ok(patternConflicts[0].message.includes('camelCase'));
      assert.ok(patternConflicts[0].message.includes('snake_case'));
    });

    it('should NOT flag consistent naming', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'handleClick', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'processData', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id3', originalName: 'c', currentName: 'validateInput', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id4', originalName: 'd', currentName: 'formatOutput', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id5', originalName: 'e', currentName: 'parseConfig', scopeId: 'scope1', bindingType: 'function' },
      ];

      const conflicts = detector.detectConflicts(history);

      const patternConflicts = conflicts.filter((c) => c.type === 'scope-inconsistency');
      assert.strictEqual(patternConflicts.length, 0);
    });

    it('should handle small datasets without flagging', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'id2', originalName: 'b', currentName: 'data_set', scopeId: 'scope1', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      // Should not flag with only 2 identifiers
      const patternConflicts = conflicts.filter((c) => c.type === 'scope-inconsistency');
      assert.strictEqual(patternConflicts.length, 0);
    });
  });

  describe('getSummary', () => {
    it('should provide accurate statistics', () => {
      const detector = createConflictDetector();
      const conflicts: Conflict[] = [
        {
          type: 'scope-inconsistency',
          severity: 'warning',
          identifiers: [],
          message: 'test1',
        },
        {
          type: 'similar-names',
          severity: 'warning',
          identifiers: [],
          message: 'test2',
        },
        {
          type: 'similar-names',
          severity: 'error',
          identifiers: [],
          message: 'test3',
        },
      ];

      const summary = detector.getSummary(conflicts);

      assert.strictEqual(summary.total, 3);
      assert.strictEqual(summary.errors, 1);
      assert.strictEqual(summary.warnings, 2);
      assert.strictEqual(summary.byType['scope-inconsistency'], 1);
      assert.strictEqual(summary.byType['similar-names'], 2);
    });

    it('should handle empty conflicts', () => {
      const detector = createConflictDetector();
      const summary = detector.getSummary([]);

      assert.strictEqual(summary.total, 0);
      assert.strictEqual(summary.errors, 0);
      assert.strictEqual(summary.warnings, 0);
      assert.deepStrictEqual(summary.byType, {});
    });
  });

  describe('configuration', () => {
    it('should respect checkDuplicateOriginals config', () => {
      const detector = createConflictDetector({ checkDuplicateOriginals: false });
      const history: RenameHistory[] = [
        { id: 'scope1#a', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'scope2#a', originalName: 'a', currentName: 'options', scopeId: 'scope2', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      // Should not detect this with checkDuplicateOriginals disabled
      const dupConflicts = conflicts.filter((c) => c.message.includes('different names'));
      assert.strictEqual(dupConflicts.length, 0);
    });

    it('should respect checkSimilarNames config', () => {
      const detector = createConflictDetector({ checkSimilarNames: false });
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'processData', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'procesData', scopeId: 'scope1', bindingType: 'function' },
      ];

      const conflicts = detector.detectConflicts(history);

      const similarConflicts = conflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(similarConflicts.length, 0);
    });

    it('should respect similarityThreshold config', () => {
      const strictDetector = createConflictDetector({ similarityThreshold: 0.95 });
      const lenientDetector = createConflictDetector({ similarityThreshold: 0.5 });

      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'handler', scopeId: 'scope1', bindingType: 'function' },
        { id: 'id2', originalName: 'b', currentName: 'handlerFn', scopeId: 'scope1', bindingType: 'function' },
      ];

      const strictConflicts = strictDetector.detectConflicts(history);
      const lenientConflicts = lenientDetector.detectConflicts(history);

      // Strict threshold should NOT flag moderately similar names (77% similar)
      const strictSimilar = strictConflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(strictSimilar.length, 0);

      // Lenient threshold SHOULD flag them
      const lenientSimilar = lenientConflicts.filter((c) => c.type === 'similar-names');
      assert.strictEqual(lenientSimilar.length, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty history', () => {
      const detector = createConflictDetector();
      const conflicts = detector.detectConflicts([]);

      assert.strictEqual(conflicts.length, 0);
    });

    it('should handle single identifier', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'a', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      assert.strictEqual(conflicts.length, 0);
    });

    it('should handle identifiers that were not renamed', () => {
      const detector = createConflictDetector();
      const history: RenameHistory[] = [
        { id: 'id1', originalName: 'config', currentName: 'config', scopeId: 'scope1', bindingType: 'var' },
        { id: 'id2', originalName: 'data', currentName: 'data', scopeId: 'scope1', bindingType: 'var' },
      ];

      const conflicts = detector.detectConflicts(history);

      // Unchanged identifiers should not cause conflicts
      assert.strictEqual(conflicts.length, 0);
    });
  });
});

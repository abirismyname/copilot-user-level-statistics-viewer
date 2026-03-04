import { describe, it, expect } from 'vitest';
import { parseMetricsLine, parseMetricsFile } from '../metricsParser';
import { StringPool } from '../../utils/stringPool';

describe('metricsParser', () => {
  describe('parseMetricsLine', () => {
    it('should parse valid new schema with required LOC fields', () => {
      const validLine = JSON.stringify({
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'testuser',
        user_initiated_interaction_count: 10,
        code_generation_activity_count: 5,
        code_acceptance_activity_count: 3,
        loc_added_sum: 100,
        loc_deleted_sum: 20,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 30,
        totals_by_ide: [],
        totals_by_feature: [],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
      });

      const result = parseMetricsLine(validLine);

      expect(result).not.toBeNull();
      expect(result?.user_id).toBe(123);
      expect(result?.user_login).toBe('testuser');
      expect(result?.loc_added_sum).toBe(100);
      expect(result?.loc_deleted_sum).toBe(20);
      expect(result?.loc_suggested_to_add_sum).toBe(150);
      expect(result?.loc_suggested_to_delete_sum).toBe(30);
    });

    it('should reject deprecated schema with old LOC fields at root level', () => {
      const deprecatedLine = JSON.stringify({
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'testuser',
        generated_loc_sum: 150, // deprecated field
        accepted_loc_sum: 100, // deprecated field
        totals_by_ide: [],
        totals_by_feature: [],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
      });

      const result = parseMetricsLine(deprecatedLine);

      expect(result).toBeNull();
    });

    it('should reject deprecated schema with old LOC fields in nested totals_by_feature', () => {
      const deprecatedNestedLine = JSON.stringify({
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'testuser',
        loc_added_sum: 100,
        loc_deleted_sum: 20,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 30,
        totals_by_ide: [],
        totals_by_feature: [
          {
            feature: 'code_completion',
            generated_loc_sum: 50, // deprecated field in nested structure
            accepted_loc_sum: 40,
          },
        ],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
      });

      const result = parseMetricsLine(deprecatedNestedLine);

      expect(result).toBeNull();
    });

    it('should reject lines missing required LOC fields', () => {
      const missingFieldsTests = [
        { field: 'loc_added_sum', value: 'loc_added_sum' },
        { field: 'loc_deleted_sum', value: 'loc_deleted_sum' },
        { field: 'loc_suggested_to_add_sum', value: 'loc_suggested_to_add_sum' },
        { field: 'loc_suggested_to_delete_sum', value: 'loc_suggested_to_delete_sum' },
      ];

      missingFieldsTests.forEach(({ field }) => {
        const baseMetric = {
          report_start_day: '2024-01-01',
          report_end_day: '2024-01-31',
          day: '2024-01-15',
          enterprise_id: 'test-enterprise',
          user_id: 123,
          user_login: 'testuser',
          loc_added_sum: 100,
          loc_deleted_sum: 20,
          loc_suggested_to_add_sum: 150,
          loc_suggested_to_delete_sum: 30,
          totals_by_ide: [],
          totals_by_feature: [],
          totals_by_language_feature: [],
          totals_by_language_model: [],
          totals_by_model_feature: [],
          used_agent: false,
          used_chat: true,
        };

        // Remove the field being tested
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (baseMetric as any)[field];

        const line = JSON.stringify(baseMetric);
        const result = parseMetricsLine(line);

        expect(result).toBeNull();
      });
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedCases = [
        'not json at all',
        '{incomplete json',
        '{"key": "value"', // truncated
        '[]', // array instead of object
        '"just a string"', // primitive
        '123', // number
        'null',
      ];

      malformedCases.forEach((malformed) => {
        const result = parseMetricsLine(malformed);
        expect(result).toBeNull();
      });
    });

    it('should default used_cli to false when missing', () => {
      const lineWithoutCli = JSON.stringify({
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'testuser',
        user_initiated_interaction_count: 10,
        code_generation_activity_count: 5,
        code_acceptance_activity_count: 3,
        loc_added_sum: 100,
        loc_deleted_sum: 20,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 30,
        totals_by_ide: [],
        totals_by_feature: [],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
        // used_cli is missing
      });

      const result = parseMetricsLine(lineWithoutCli);

      expect(result).not.toBeNull();
      expect(result?.used_cli).toBe(false);
    });

    it('should apply string interning when pool is provided', () => {
      const pool = new StringPool();
      const line = JSON.stringify({
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'testuser',
        user_initiated_interaction_count: 10,
        code_generation_activity_count: 5,
        code_acceptance_activity_count: 3,
        loc_added_sum: 100,
        loc_deleted_sum: 20,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 30,
        totals_by_ide: [
          { ide: 'vscode', user_initiated_interaction_count: 5 },
        ],
        totals_by_feature: [
          { feature: 'code_completion', user_initiated_interaction_count: 3 },
        ],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
      });

      const result = parseMetricsLine(line, pool);

      expect(result).not.toBeNull();
      // After interning, pool should have these strings
      expect(pool.size).toBeGreaterThan(0);
    });
  });

  describe('parseMetricsFile', () => {
    it('should parse multiple valid lines and filter invalid ones', () => {
      const validLine1 = {
        report_start_day: '2024-01-01',
        report_end_day: '2024-01-31',
        day: '2024-01-15',
        enterprise_id: 'test-enterprise',
        user_id: 123,
        user_login: 'user1',
        user_initiated_interaction_count: 10,
        code_generation_activity_count: 5,
        code_acceptance_activity_count: 3,
        loc_added_sum: 100,
        loc_deleted_sum: 20,
        loc_suggested_to_add_sum: 150,
        loc_suggested_to_delete_sum: 30,
        totals_by_ide: [],
        totals_by_feature: [],
        totals_by_language_feature: [],
        totals_by_language_model: [],
        totals_by_model_feature: [],
        used_agent: false,
        used_chat: true,
      };

      const validLine2 = { ...validLine1, user_id: 456, user_login: 'user2' };
      const deprecatedLine = { ...validLine1, generated_loc_sum: 100 };

      const fileContent = [
        JSON.stringify(validLine1),
        '', // empty line
        JSON.stringify(validLine2),
        'invalid json',
        JSON.stringify(deprecatedLine),
      ].join('\n');

      const results = parseMetricsFile(fileContent);

      expect(results).toHaveLength(2);
      expect(results[0].user_id).toBe(123);
      expect(results[1].user_id).toBe(456);
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  createReportSchema,
  updateReportStatusSchema,
  addInternalNoteSchema,
} from '@/lib/validations/report';

describe('Report Validation Schemas', () => {
  describe('createReportSchema', () => {
    it('accepts valid report submission input', () => {
      const validData = {
        title: 'Water leaking in floor 2 bathroom',
        category: 'plumbing',
        building: 'Science Center',
        location_details: 'Room 214, second sink from door',
        description: 'Persistent water stream coming from underneath the cabinet.',
        photo_url: null,
      };

      const result = createReportSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects too short title', () => {
      const invalidData = {
        title: 'Fix',
        category: 'electrical',
        building: 'Library',
        location_details: '1st floor',
        description: 'Light is broken in the hallway.',
      };

      const result = createReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/at least 5 characters/i);
      }
    });

    it('rejects invalid category', () => {
      const invalidData = {
        title: 'Broken chair in lecture hall',
        category: 'spaceship',
        building: 'Engineering Hall',
        location_details: 'Hall 101',
        description: 'One of the seats has a snapped wooden backrest.',
      };

      const result = createReportSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateReportStatusSchema', () => {
    it('validates resolution note required when status is resolved', () => {
      const invalidResolve = {
        to_status: 'resolved',
        comment: '',
      };
      const result = updateReportStatusSchema.safeParse(invalidResolve);
      expect(result.success).toBe(false);

      const validResolve = {
        to_status: 'resolved',
        comment: 'Replaced faulty valve and cleaned floor surface.',
      };
      const validResult = updateReportStatusSchema.safeParse(validResolve);
      expect(validResult.success).toBe(true);
    });

    it('validates reason required when status is duplicate or rejected', () => {
      const missingReason = {
        to_status: 'duplicate',
        comment: '',
      };
      const result = updateReportStatusSchema.safeParse(missingReason);
      expect(result.success).toBe(false);

      const withReason = {
        to_status: 'duplicate',
        comment: 'Identical to report CF-2026-1002.',
      };
      const resultValid = updateReportStatusSchema.safeParse(withReason);
      expect(resultValid.success).toBe(true);
    });
  });

  describe('addInternalNoteSchema', () => {
    it('accepts valid internal note', () => {
      const valid = { note: 'Spare parts ordered from vendor warehouse.' };
      expect(addInternalNoteSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects empty or very short note', () => {
      const invalid = { note: 'no' };
      expect(addInternalNoteSchema.safeParse(invalid).success).toBe(false);
    });
  });
});

import { z } from 'zod';

export const reportCategories = [
  'electrical',
  'plumbing',
  'classroom_equipment',
  'cleanliness',
  'other',
] as const;

export const reportPriorities = ['low', 'medium', 'high', 'urgent'] as const;

export const reportStatuses = [
  'submitted',
  'acknowledged',
  'in_progress',
  'resolved',
  'duplicate',
  'rejected',
  'withdrawn',
] as const;

export const createReportSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters long')
    .max(100, 'Title cannot exceed 100 characters'),
  category: z.enum(reportCategories, {
    message: 'Please select a valid maintenance category',
  }),
  building: z
    .string()
    .trim()
    .min(2, 'Building name must be at least 2 characters')
    .max(80, 'Building name cannot exceed 80 characters'),
  location_details: z
    .string()
    .trim()
    .min(2, 'Location details must be at least 2 characters (e.g. Room 204, Floor 3)')
    .max(120, 'Location details cannot exceed 120 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Please provide at least 10 characters describing the issue')
    .max(1500, 'Description cannot exceed 1500 characters'),
  photo_url: z.string().optional().nullable(),
});

export const updateReportSchema = createReportSchema;

export const updateReportStatusSchema = z
  .object({
    to_status: z.enum(reportStatuses, {
      message: 'Invalid report status target',
    }),
    comment: z.string().trim().optional().nullable(),
    priority: z.enum(reportPriorities).optional(),
    assigned_to: z.string().uuid('Invalid staff UUID').optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.to_status === 'resolved' && (!data.comment || data.comment.trim().length < 5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comment'],
        message: 'A resolution note of at least 5 characters is required to resolve a ticket.',
      });
    }
    if (
      (data.to_status === 'duplicate' || data.to_status === 'rejected') &&
      (!data.comment || data.comment.trim().length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['comment'],
        message: `A reason of at least 5 characters must be provided when marking as ${data.to_status}.`,
      });
    }
  });

export const addInternalNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(3, 'Internal note must be at least 3 characters')
    .max(1500, 'Internal note cannot exceed 1500 characters'),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type AddInternalNoteInput = z.infer<typeof addInternalNoteSchema>;

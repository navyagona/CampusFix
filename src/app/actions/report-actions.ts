'use server';

import { revalidatePath } from 'next/cache';
import {
  createReportAction,
  updateReportAction,
  withdrawReportAction,
  updateReportStatusAction,
  addInternalNoteAction,
} from '@/lib/data/repository';
import {
  CreateReportInput,
  UpdateReportInput,
  UpdateReportStatusInput,
} from '@/lib/validations/report';

export async function createReport(data: CreateReportInput) {
  const result = await createReportAction(data);
  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath('/staff/reports');
  }
  return result;
}

export async function updateReport(id: string, data: UpdateReportInput) {
  const result = await updateReportAction(id, data);
  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath(`/reports/${id}`);
    revalidatePath('/staff/reports');
  }
  return result;
}

export async function withdrawReport(id: string) {
  const result = await withdrawReportAction(id);
  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath(`/reports/${id}`);
    revalidatePath('/staff/reports');
  }
  return result;
}

export async function updateReportStatus(id: string, input: UpdateReportStatusInput) {
  const result = await updateReportStatusAction(id, input);
  if (result.success) {
    revalidatePath('/dashboard');
    revalidatePath(`/reports/${id}`);
    revalidatePath('/staff/reports');
  }
  return result;
}

export async function addInternalNote(reportId: string, noteText: string) {
  const result = await addInternalNoteAction(reportId, noteText);
  if (result.success) {
    revalidatePath(`/reports/${reportId}`);
    revalidatePath('/staff/reports');
  }
  return result;
}

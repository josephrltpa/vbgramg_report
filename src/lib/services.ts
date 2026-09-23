import { supabase } from './supabase';
import { JobCardRecord, FinancialRecord, RequestType, ApprovalStatus, OfficeAction, ProcessingStage, CreditStatus } from '../types';

// ============================================================================
// VILLAGES
// ============================================================================
export async function fetchVillages() {
  const { data, error } = await supabase
    .from('villages')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching villages:', error);
    return [];
  }
  return data || [];
}

// ============================================================================
// JOB CARDS
// ============================================================================
export async function fetchJobCards(): Promise<JobCardRecord[]> {
  const { data, error } = await supabase
    .from('job_cards')
    .select(`
      *,
      villages:village_id (name)
    `)
    .order('sl_no', { ascending: true });

  if (error) {
    console.error('Error fetching job cards:', error);
    return [];
  }

  // Transform Supabase data to match our app's format
  return (data || []).map((row: any) => ({
    id: row.id,
    slNo: row.sl_no,
    jobCardNumber: row.job_card_number,
    headName: row.head_name,
    remarks: row.remarks as RequestType,
    requestDate: row.request_date,
    approvalStatus: row.approval_status as ApprovalStatus,
    officeAction: row.office_action as OfficeAction,
    village: row.villages?.name || '',
    createdAt: row.created_at,
  }));
}

export async function addJobCard(record: Omit<JobCardRecord, 'id' | 'createdAt'>) {
  // First, find the village_id
  const { data: village } = await supabase
    .from('villages')
    .select('id')
    .eq('name', record.village)
    .single();

  if (!village) {
    console.error('Village not found:', record.village);
    return null;
  }

  const { data, error } = await supabase
    .from('job_cards')
    .insert({
      sl_no: record.slNo,
      job_card_number: record.jobCardNumber,
      head_name: record.headName,
      remarks: record.remarks,
      request_date: record.requestDate,
      approval_status: record.approvalStatus,
      office_action: record.officeAction,
      village_id: village.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding job card:', error);
    return null;
  }
  return data;
}

export async function updateJobCardStatus(
  id: string,
  field: 'approvalStatus' | 'officeAction',
  value: string
) {
  const dbField = field === 'approvalStatus' ? 'approval_status' : 'office_action';

  const { error } = await supabase
    .from('job_cards')
    .update({ [dbField]: value })
    .eq('id', id);

  if (error) {
    console.error('Error updating job card:', error);
  }
}

// ============================================================================
// FINANCIAL RECORDS
// ============================================================================
export async function fetchFinancialRecords(): Promise<FinancialRecord[]> {
  const { data, error } = await supabase
    .from('financial_records')
    .select(`
      *,
      villages:village_id (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching financial records:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    demandId: row.demand_id,
    workName: row.work_name,
    amountCredited: row.amount_credited,
    creditStatus: row.credit_status as CreditStatus,
    creditDate: row.credit_date || '',
    attachmentLink: row.attachment_link || '',
    processingStage: row.processing_stage as ProcessingStage,
    month: row.fy_month,
    village: row.villages?.name || '',
    createdAt: row.created_at,
  }));
}

export async function addFinancialRecord(record: Omit<FinancialRecord, 'id' | 'createdAt'>) {
  const { data: village } = await supabase
    .from('villages')
    .select('id')
    .eq('name', record.village)
    .single();

  if (!village) {
    console.error('Village not found:', record.village);
    return null;
  }

  const { data, error } = await supabase
    .from('financial_records')
    .insert({
      demand_id: record.demandId,
      work_name: record.workName,
      amount_credited: record.amountCredited,
      credit_status: record.creditStatus,
      credit_date: record.creditDate || null,
      attachment_link: record.attachmentLink,
      processing_stage: record.processingStage,
      fy_month: record.month,
      village_id: village.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding financial record:', error);
    return null;
  }
  return data;
}

export async function updateFinancialRecordStatus(
  id: string,
  field: 'creditStatus' | 'processingStage',
  value: string
) {
  const dbField = field === 'creditStatus' ? 'credit_status' : 'processing_stage';

  const { error } = await supabase
    .from('financial_records')
    .update({ [dbField]: value })
    .eq('id', id);

  if (error) {
    console.error('Error updating financial record:', error);
  }
}

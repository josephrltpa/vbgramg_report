import { supabase } from './supabase';
import { JobCard, JCRequest, MonthlyDemand, RequestStatus, CreditStatus } from '../types';

// ============================================================================
// JOB CARDS (Fixed list)
// ============================================================================
export async function fetchJobCards(village?: string): Promise<JobCard[]> {
  console.log('[Supabase] Fetching job cards for village:', village);
  console.log('[Supabase] Client URL:', (supabase as any).supabaseUrl);
  
  // Test: fetch ALL records without any filter
  const { data: testAll, error: testError } = await supabase.from('job_cards').select('id, village, head_name').limit(5);
  console.log('[Supabase] TEST - All records:', testAll?.length || 0, 'Error:', testError);
  console.log('[Supabase] TEST - Raw data:', JSON.stringify(testAll));
  
  let query = supabase.from('job_cards').select('*');
  
  // Only filter by village if it's a specific village (not 'all')
  if (village && village !== 'all') {
    query = query.eq('village', village);
  }
  
  // Show all cards (both active and inactive)
  query = query.order('job_card_number');

  const { data, error } = await query;
  
  if (error) {
    console.error('[Supabase] Error fetching job cards:', error);
    console.error('[Supabase] Error details:', JSON.stringify(error));
    return [];
  }
  
  console.log('[Supabase] Job cards fetched:', data?.length || 0, 'records');
  console.log('[Supabase] Sample data:', data?.slice(0, 2));
  
  return (data || []).map((row: any) => ({
    id: row.id,
    jobCardNumber: row.job_card_number,
    headName: row.head_name,
    village: row.village,
    createdAt: row.created_at,
    isActive: row.is_active,
  }));
}

export async function addJobCard(jc: Omit<JobCard, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('job_cards').insert({
    job_card_number: jc.jobCardNumber,
    head_name: jc.headName,
    village: jc.village,
    is_active: jc.isActive,
  }).select().single();
  if (error) { console.error('Error adding job card:', error); return null; }
  return data;
}

export async function updateJobCardStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from('job_cards')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) console.error('Error updating JC status:', error);
  return !error;
}

export async function deleteJobCard(id: string) {
  const { error } = await supabase
    .from('job_cards')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deleting job card:', error);
  return !error;
}

// ============================================================================
// JC REQUESTS (VEC requests + CA feedback)
// ============================================================================
export async function fetchJCRequests(village?: string): Promise<JCRequest[]> {
  let query = supabase.from('jc_requests').select('*');
  if (village && village !== 'all') {
    query = query.eq('village', village);
  }
  const { data, error } = await query.order('request_date', { ascending: false });
  if (error) { console.error('Error fetching requests:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    jobCardNumber: row.job_card_number,
    headName: row.head_name,
    village: row.village,
    requestType: row.request_type,
    remarks: row.remarks || '',
    requestDate: row.request_date,
    status: row.status,
    feedback: row.feedback || '',
    actionDate: row.action_date || '',
    requestedBy: row.requested_by || '',
    processedBy: row.processed_by || '',
  }));
}

export async function addJCRequest(req: Omit<JCRequest, 'id' | 'status' | 'feedback' | 'actionDate' | 'processedBy'>) {
  const { data, error } = await supabase.from('jc_requests').insert({
    job_card_number: req.jobCardNumber,
    head_name: req.headName,
    village: req.village,
    request_type: req.requestType,
    remarks: req.remarks,
    request_date: req.requestDate,
    requested_by: req.requestedBy,
    status: 'Submitted',
  }).select().single();
  if (error) { console.error('Error adding request:', error); return null; }
  return data;
}

export async function updateJCRequest(id: string, updates: {
  status?: RequestStatus;
  feedback?: string;
  actionDate?: string;
  processedBy?: string;
}) {
  const dbUpdates: any = {};
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
  if (updates.actionDate) dbUpdates.action_date = updates.actionDate;
  if (updates.processedBy) dbUpdates.processed_by = updates.processedBy;

  const { error } = await supabase.from('jc_requests').update(dbUpdates).eq('id', id);
  if (error) console.error('Error updating request:', error);
}

// ============================================================================
// MONTHLY DEMANDS
// ============================================================================
export async function fetchMonthlyDemands(village: string, month: number, year: number): Promise<MonthlyDemand[]> {
  let query = supabase
    .from('monthly_demands')
    .select('*')
    .eq('month', month)
    .eq('year', year);
  
  // Only filter by village if it's a specific village (not 'all')
  if (village && village !== 'all') {
    query = query.eq('village', village);
  }
  
  query = query.order('head_name');
  const { data, error } = await query;
  if (error) { console.error('Error fetching demands:', error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    jobCardId: row.job_card_id,
    jobCardNumber: row.job_card_number,
    headName: row.head_name,
    village: row.village,
    month: row.month,
    year: row.year,
    daysWorked: row.days_worked || 0,
    wageAmount: row.wage_amount || 0,
    creditStatus: row.credit_status,
    creditDate: row.credit_date || '',
    wagelistLink: row.wagelist_link || '',
    createdAt: row.created_at,
  }));
}

export async function addMonthlyDemand(demand: Omit<MonthlyDemand, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('monthly_demands').insert({
    job_card_id: demand.jobCardId,
    job_card_number: demand.jobCardNumber,
    head_name: demand.headName,
    village: demand.village,
    month: demand.month,
    year: demand.year,
    days_worked: demand.daysWorked,
    wage_amount: demand.wageAmount,
    credit_status: demand.creditStatus,
    credit_date: demand.creditDate || null,
    wagelist_link: demand.wagelistLink,
  }).select().single();
  if (error) { console.error('Error adding demand:', error); return null; }
  return data;
}

export async function updateDemandCreditStatus(id: string, status: CreditStatus, creditDate?: string) {
  const { error } = await supabase.from('monthly_demands').update({
    credit_status: status,
    credit_date: creditDate || null,
  }).eq('id', id);
  if (error) console.error('Error updating demand:', error);
}

export async function updateDemandWagelistLink(id: string, link: string) {
  const { error } = await supabase.from('monthly_demands').update({
    wagelist_link: link,
  }).eq('id', id);
  if (error) console.error('Error updating wagelist link:', error);
}

export async function deleteMonthlyDemand(id: string) {
  const { error } = await supabase.from('monthly_demands').delete().eq('id', id);
  if (error) console.error('Error deleting demand:', error);
}

// ============================================================================
// REQUEST COMMENTS (Threaded discussions)
// ============================================================================
export interface RequestComment {
  id: string;
  requestId: string;
  commentText: string;
  commentBy: string;
  commentRole: string;
  createdAt: string;
}

export async function fetchRequestComments(requestId: string): Promise<RequestComment[]> {
  const { data, error } = await supabase
    .from('request_comments')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  return (data || []).map((row: any) => ({
    id: row.id,
    requestId: row.request_id,
    commentText: row.comment_text,
    commentBy: row.comment_by,
    commentRole: row.comment_role,
    createdAt: row.created_at,
  }));
}

export async function addRequestComment(
  requestId: string,
  commentText: string,
  commentBy: string,
  commentRole: string
) {
  const { data, error } = await supabase
    .from('request_comments')
    .insert({
      request_id: requestId,
      comment_text: commentText,
      comment_by: commentBy,
      comment_role: commentRole,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding comment:', error);
    return null;
  }
  
  return data;
}

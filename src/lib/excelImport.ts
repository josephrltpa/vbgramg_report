import * as XLSX from 'xlsx';
import { supabase } from './supabase';

export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

// Parse Excel file and return data
export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

// Import Job Cards from Excel with smart filtering
export async function importJobCards(data: any[], village: string): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, skipped: 0, errors: [] };
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // Excel row number (1-indexed, +1 for header)
    
    // Map Excel columns to database fields
    // Expected columns: "Job Card Number" or "JC Number", "Head Name" or "Name", "Status"
    const jobCardNumberRaw = row['Job Card Number'] || row['JC Number'] || row['job_card_number'];
    const headName = row['Head Name'] || row['Name'] || row['head_name'];
    const status = row['Status'] || row['status'] || '';
    
    if (!jobCardNumberRaw || !headName) {
      result.failed++;
      result.errors.push(`Row ${rowNum}: Missing required fields (Job Card Number or Head Name)`);
      continue;
    }
    
    const jobCardNumber = jobCardNumberRaw.toString().trim();
    
    // Smart filtering logic:
    // 1. Skip JCs with * at the end
    if (jobCardNumber.endsWith('*')) {
      result.skipped++;
      continue;
    }
    
    // 2. Determine active status based on Status column
    // If status is "ACTIVE" (case-insensitive) → active
    // If status is empty or anything else → inactive
    const isActive = status.toString().trim().toUpperCase() === 'ACTIVE';
    
    try {
      const { error } = await supabase
        .from('job_cards')
        .insert({
          job_card_number: jobCardNumber,
          head_name: headName.toString().trim(),
          village: village,
          is_active: isActive,
        });
      
      if (error) {
        result.failed++;
        result.errors.push(`Row ${rowNum}: ${error.message}`);
      } else {
        result.success++;
      }
    } catch (error: any) {
      result.failed++;
      result.errors.push(`Row ${rowNum}: ${error.message}`);
    }
  }
  
  return result;
}

// Import Monthly Demands from Excel
export async function importMonthlyDemands(
  data: any[], 
  village: string, 
  month: number, 
  year: number
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, skipped: 0, errors: [] };
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // Excel row number
    
    // Map Excel columns to database fields
    // Expected columns: "Job Card Number", "Head Name", "Days Worked", "Amount"
    const jobCardNumber = row['Job Card Number'] || row['JC Number'] || row['job_card_number'];
    const headName = row['Head Name'] || row['Name'] || row['head_name'];
    const daysWorked = row['Days Worked'] || row['Days'] || row['days_worked'] || 0;
    const wageAmount = row['Amount'] || row['Wage Amount'] || row['wage_amount'] || 0;
    
    if (!jobCardNumber || !headName) {
      result.failed++;
      result.errors.push(`Row ${rowNum}: Missing required fields (Job Card Number or Head Name)`);
      continue;
    }
    
    try {
      // First, try to find the job card ID
      const { data: jcData, error: jcError } = await supabase
        .from('job_cards')
        .select('id')
        .eq('job_card_number', jobCardNumber.toString().trim())
        .eq('village', village)
        .single();
      
      const jobCardId = jcError ? null : jcData?.id;
      
      const { error } = await supabase
        .from('monthly_demands')
        .insert({
          job_card_id: jobCardId,
          job_card_number: jobCardNumber.toString().trim(),
          head_name: headName.toString().trim(),
          village: village,
          month: month,
          year: year,
          days_worked: Number(daysWorked) || 0,
          wage_amount: Number(wageAmount) || 0,
          credit_status: 'Pending',
        });
      
      if (error) {
        result.failed++;
        result.errors.push(`Row ${rowNum}: ${error.message}`);
      } else {
        result.success++;
      }
    } catch (error: any) {
      result.failed++;
      result.errors.push(`Row ${rowNum}: ${error.message}`);
    }
  }
  
  return result;
}

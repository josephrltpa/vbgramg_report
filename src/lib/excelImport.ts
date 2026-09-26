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
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with date handling
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          raw: false, 
          dateNF: 'yyyy-mm-dd' 
        });
        
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

// Helper function to extract Job Card number from cell that may contain panchayat name
function extractJobCardNo(raw: any): string {
  if (!raw) return '';
  const str = raw.toString().trim();
  
  // Handle cases like: "MZ-01-003-020-001/10\n(buhban)" or "MZ-01-003-020-001/10 (buhban)"
  // Split on newline, parenthesis, or multiple spaces
  const parts = str.split(/[\n\r]+|\s*\(|\s{2,}/);
  return parts[0].trim();
}

// Helper to find column value by trying multiple possible header names
function findColumnValue(row: any, possibleNames: string[]): any {
  // First try exact matches
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return row[name];
    }
  }
  
  // Then try partial matches (case-insensitive)
  const rowKeys = Object.keys(row);
  for (const name of possibleNames) {
    const lowerName = name.toLowerCase();
    const found = rowKeys.find(key => key.toLowerCase().includes(lowerName));
    if (found && row[found] !== undefined && row[found] !== null && row[found] !== '') {
      return row[found];
    }
  }
  
  return null;
}

// Import FTO Reports from Excel
export async function importFTOReports(
  data: any[], 
  village: string,
  month: number,
  year: number,
  sourceFile: string
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: 0, skipped: 0, errors: [] };
  
  // Debug: log first row to see actual column names
  if (data.length > 0) {
    console.log('[FTO Import] Column names found:', Object.keys(data[0]));
    console.log('[FTO Import] First row sample:', data[0]);
  }
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 2; // Excel row number
    
    // Map Excel columns to database fields with flexible matching
    const rawJobCardNo = findColumnValue(row, [
      'Job Card No.', 'Job Card No', 'Job Card Number', 'JC Number', 
      'job_card_no', 'job_card_number', 'Job Card'
    ]);
    const applicantName = findColumnValue(row, [
      'Applicant Name', 'Name', 'applicant_name', 'head_name'
    ]);
    const amountToBeCredited = findColumnValue(row, [
      'Amount to be credited (In Rs.)', 'Amount to be credited', 
      'Amount', 'amount_to_be_credited', 'amount'
    ]) || 0;
    const status = findColumnValue(row, ['Status', 'status']) || '';
    const processedDate = findColumnValue(row, [
      'Processed Date', 'processed_date', 'Date'
    ]) || '';
    const bankName = findColumnValue(row, [
      'Paid in account of', 'Paid in Bank', 'Bank Name', 'bank_name'
    ]) || '';
    
    // Extract just the JC number (remove panchayat name if present)
    const jobCardNo = extractJobCardNo(rawJobCardNo);
    
    if (!jobCardNo || !applicantName) {
      result.failed++;
      result.errors.push(`Row ${rowNum}: Missing required fields (Job Card No or Applicant Name)`);
      continue;
    }
    
    try {
      // Parse date if it exists - handle DD/MM/YYYY format from Excel
      let parsedDate = '';
      if (processedDate) {
        if (typeof processedDate === 'string') {
          // Try DD/MM/YYYY format first (common in Indian Excel)
          const ddmmyyyy = processedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (ddmmyyyy) {
            const [, day, month, year] = ddmmyyyy;
            parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            // Try MM/DD/YYYY format
            const mmddyyyy = processedDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
            if (mmddyyyy) {
              const [, month, day, year] = mmddyyyy;
              parsedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else {
              // Try YYYY-MM-DD format (already correct)
              const yyyymmdd = processedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
              if (yyyymmdd) {
                parsedDate = processedDate;
              } else {
                // Try to parse as date object
                const dateObj = new Date(processedDate);
                if (!isNaN(dateObj.getTime())) {
                  parsedDate = dateObj.toISOString().split('T')[0];
                }
              }
            }
          }
        } else if (processedDate instanceof Date) {
          parsedDate = processedDate.toISOString().split('T')[0];
        } else if (typeof processedDate === 'number') {
          // Excel stores dates as numbers (days since 1900)
          const dateObj = new Date((processedDate - 25569) * 86400 * 1000);
          if (!isNaN(dateObj.getTime())) {
            parsedDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      const { error } = await supabase
        .from('fto_reports')
        .insert({
          job_card_no: jobCardNo.toString().trim(),
          applicant_name: applicantName.toString().trim(),
          amount_to_be_credited: Number(amountToBeCredited) || 0,
          status: status.toString().trim(),
          processed_date: parsedDate || null,
          bank_name: bankName.toString().trim(),
          village: village,
          month: month,
          year: year,
          source_file: sourceFile,
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

export type ApprovalStatus = 'Approved' | 'Not Approved' | 'Pending';
export type OfficeAction = 'Added to Portal' | 'Pending' | 'Rejected';
export type RequestType = 'Add New' | 'Delete' | 'Correction';
export type ProcessingStage = 'Generated' | 'FTO Signed' | 'Processed' | 'Credited';
export type CreditStatus = 'Credited' | 'Pending';

export interface JobCardRecord {
  id: string;
  slNo: number;
  jobCardNumber: string;
  headName: string;
  remarks: RequestType;
  requestDate: string;
  approvalStatus: ApprovalStatus;
  officeAction: OfficeAction;
  village: string;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  demandId: string;
  workName: string;
  amountCredited: number;
  creditStatus: CreditStatus;
  creditDate: string;
  attachmentLink: string;
  processingStage: ProcessingStage;
  month: number; // 1-12 representing April(4) to March(3)
  village: string;
  createdAt: string;
}

export interface Village {
  id: string;
  name: string;
  block: string;
}

export const MONTHS = [
  { label: 'Apr', fullLabel: 'April', index: 4 },
  { label: 'May', fullLabel: 'May', index: 5 },
  { label: 'Jun', fullLabel: 'June', index: 6 },
  { label: 'Jul', fullLabel: 'July', index: 7 },
  { label: 'Aug', fullLabel: 'August', index: 8 },
  { label: 'Sep', fullLabel: 'September', index: 9 },
  { label: 'Oct', fullLabel: 'October', index: 10 },
  { label: 'Nov', fullLabel: 'November', index: 11 },
  { label: 'Dec', fullLabel: 'December', index: 12 },
  { label: 'Jan', fullLabel: 'January', index: 1 },
  { label: 'Feb', fullLabel: 'February', index: 2 },
  { label: 'Mar', fullLabel: 'March', index: 3 },
];

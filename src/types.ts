export type RequestType = 'Add New JC' | 'Delete JC' | 'Correction';
export type RequestStatus = 'Submitted' | 'In Progress' | 'Completed' | 'Rejected';
export type CreditStatus = 'Credited' | 'Pending';

export interface User {
  username: string;
  village: string;
  role: 'secretary' | 'computer_assistant';
}

export interface JobCard {
  id: string;
  jobCardNumber: string;
  headName: string;
  village: string;
  createdAt: string;
  isActive: boolean;
}

export interface JCRequest {
  id: string;
  jobCardNumber: string;
  headName: string;
  village: string;
  requestType: RequestType;
  remarks: string;
  requestDate: string;
  status: RequestStatus;
  feedback: string;
  actionDate: string;
  requestedBy: string;
  processedBy: string;
}

export interface MonthlyDemand {
  id: string;
  jobCardId: string;
  jobCardNumber: string;
  headName: string;
  village: string;
  month: number; // 1-12
  year: number;
  daysWorked: number;
  wageAmount: number;
  creditStatus: CreditStatus;
  creditDate: string;
  wagelistLink: string;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  state: string;
}

export interface Block {
  id: string;
  name: string;
  district_id: string;
  district_name?: string;
}

export interface Village {
  id: string;
  name: string;
  block_id: string;
  block_name?: string;
  district_name?: string;
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

export const VILLAGES = ['Rampur', 'Sundarpur', 'Kishangarh', 'Devgarh', 'Chandpur'];

import { v4 as uuidv4 } from 'uuid';
import { JobCardRecord, FinancialRecord, Village, ApprovalStatus, OfficeAction, RequestType, ProcessingStage, CreditStatus } from '../types';

export const VILLAGES: Village[] = [
  { id: 'v1', name: 'Rampur', block: 'Sadar' },
  { id: 'v2', name: 'Sundarpur', block: 'Sadar' },
  { id: 'v3', name: 'Kishangarh', block: 'North' },
  { id: 'v4', name: 'Devgarh', block: 'North' },
  { id: 'v5', name: 'Chandpur', block: 'South' },
];

const names = [
  'Ramesh Kumar', 'Sita Devi', 'Mohan Lal', 'Geeta Bai', 'Raju Sharma',
  'Kamla Devi', 'Bharat Singh', 'Phoolo Devi', 'Dinesh Yadav', 'Meena Kumari',
  'Ravi Patel', 'Sunita Devi', 'Jagdish Prasad', 'Lakshmi Bai', 'Suresh Gupta',
  'Radha Devi', 'Manoj Tiwari', 'Savitri Devi', 'Arun Kumar', 'Chanda Bai',
];

const requestTypes: RequestType[] = ['Add New', 'Delete', 'Correction'];
const approvalStatuses: ApprovalStatus[] = ['Approved', 'Not Approved', 'Pending'];
const officeActions: OfficeAction[] = ['Added to Portal', 'Pending', 'Rejected'];
const processingStages: ProcessingStage[] = ['Generated', 'FTO Signed', 'Processed', 'Credited'];
const creditStatuses: CreditStatus[] = ['Credited', 'Pending'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateJCNumber(village: string, index: number): string {
  const prefix = village.substring(0, 3).toUpperCase();
  return `${prefix}/${2024}/${String(index).padStart(4, '0')}`;
}

function generateDemandId(village: string, month: number): string {
  const prefix = village.substring(0, 3).toUpperCase();
  return `DM-${prefix}-FY24-${String(month).padStart(2, '0')}-${String(Math.floor(Math.random() * 99) + 1).padStart(3, '0')}`;
}

const workNames = [
  'Road Construction - Village Link', 'Pond Deepening Work', 'Canal Repair',
  'Land Leveling - Farm Area', 'Well Construction', 'Check Dam Building',
  'Afforestation Drive', 'Drainage Construction', 'School Boundary Wall',
  'Anganwadi Renovation', 'Water Harvesting Structure', 'Rural Pathway',
];

export function generateMockJobCards(): JobCardRecord[] {
  const records: JobCardRecord[] = [];
  let slNo = 1;

  VILLAGES.forEach((village) => {
    const count = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < count; i++) {
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      records.push({
        id: uuidv4(),
        slNo: slNo++,
        jobCardNumber: generateJCNumber(village.name, i + 1),
        headName: randomFrom(names),
        remarks: randomFrom(requestTypes),
        requestDate: `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        approvalStatus: randomFrom(approvalStatuses),
        officeAction: randomFrom(officeActions),
        village: village.name,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return records;
}

export function generateMockFinancialRecords(): FinancialRecord[] {
  const records: FinancialRecord[] = [];

  VILLAGES.forEach((village) => {
    for (let month = 1; month <= 12; month++) {
      const count = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < count; i++) {
        const creditStatus = randomFrom(creditStatuses);
        const stage = creditStatus === 'Credited' ? 'Credited' : randomFrom(processingStages);
        const day = Math.floor(Math.random() * 28) + 1;
        records.push({
          id: uuidv4(),
          demandId: generateDemandId(village.name, month),
          workName: randomFrom(workNames),
          amountCredited: Math.floor(Math.random() * 500000) + 50000,
          creditStatus,
          creditDate: creditStatus === 'Credited'
            ? `2024-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : '',
          attachmentLink: Math.random() > 0.5 ? `https://drive.google.com/file/d/${uuidv4()}` : '',
          processingStage: stage as ProcessingStage,
          month,
          village: village.name,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  return records;
}

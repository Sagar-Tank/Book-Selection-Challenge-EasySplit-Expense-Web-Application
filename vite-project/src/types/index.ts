export interface Participant {
  id: string;
  name: string;
}

export interface ExpenseSplit {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  totalAmount: number;
  payeeId: string;
  splitType: 'equal' | 'unequal' | 'proportional';
  splits: ExpenseSplit[];
  shares?: Record<string, number>; // For proportional split
}

export interface SummaryItem {
  fromId: string;
  toId: string;
  amount: number;
}


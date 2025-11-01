export interface Participant {
  id: string;
  name: string;
  email?: string; // Email of the user/participant
  userId?: string; // Firebase userId if participant is a registered user
  createdBy?: string; // User who created this participant (if manually created)
  isUser?: boolean; // Flag to identify if this participant is a registered platform user
  createdAt?: number; // Timestamp when participant was created
}

export interface ExpenseSplit {
  participantId: string;
  participantName: string; // Store participant name for history
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  totalAmount: number;
  payeeId: string;
  payeeName: string; // Store payee name for history
  splitType: 'equal' | 'unequal' | 'proportional';
  splits: ExpenseSplit[];
  shares?: Record<string, number>; // For proportional split
  participantIds?: string[]; // Array of participant IDs for easier querying
  userId?: string; // User ID who created the expense (stored in Firestore)
  createdAt?: number; // Timestamp for ordering
}

export interface SummaryItem {
  fromId: string;
  fromName?: string; // Store name for display
  toId: string;
  toName?: string; // Store name for display
  amount: number;
}

export type NotificationType = 'owe' | 'paid_and_owe' | 'created' | 'payment_received';

export interface Notification {
  id: string;
  userId: string; // User to notify
  expenseId: string;
  expenseDescription: string;
  participantId: string; // Participant being notified
  participantName: string;
  amount: number; // Amount they owe or paid
  notificationType: NotificationType; // Type of notification
  payeeId?: string; // Payee ID for reference
  payeeName?: string; // Payee name for reference
  totalAmount?: number; // Total expense amount
  createdBy: string; // User who created the expense
  createdByName: string;
  createdAt: number;
  read: boolean;
}


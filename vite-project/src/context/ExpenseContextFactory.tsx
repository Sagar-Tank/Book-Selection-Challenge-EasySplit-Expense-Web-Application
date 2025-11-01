import { createContext } from 'react';
import type { Participant, Expense, SummaryItem } from '../types';

export interface ExpenseContextType {
    participants: Participant[];
    expenses: Expense[];
    addParticipant: (name: string) => Promise<void>;
    removeParticipant: (id: string) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    removeExpense: (id: string) => Promise<void>;
    getSummary: () => SummaryItem[];
}

export const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);


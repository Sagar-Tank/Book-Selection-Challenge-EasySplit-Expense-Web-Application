import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Participant, Expense, SummaryItem } from '../types';
import { ExpenseContext, type ExpenseContextType } from './ExpenseContextFactory';

interface ExpenseProviderProps {
    children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Load data from Firestore on mount
    useEffect(() => {
        loadParticipants();
        loadExpenses();
    }, []);


    const loadParticipants = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'participants'));
            const loadedParticipants = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Participant));
            setParticipants(loadedParticipants);
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    };

    const loadExpenses = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'expenses'));
            const loadedExpenses = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Expense));
            setExpenses(loadedExpenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    };

    const addParticipant = async (name: string) => {
        try {
            const docRef = await addDoc(collection(db, 'participants'), { name });
            setParticipants(prev => [...prev, { id: docRef.id, name }]);
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    };

    const removeParticipant = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'participants', id));
            setParticipants(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    };

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        try {
            // Remove undefined fields before saving to Firestore
            const expenseToSave = { ...expense };
            if (!expenseToSave.shares) {
                delete expenseToSave.shares;
            }
            const docRef = await addDoc(collection(db, 'expenses'), expenseToSave);
            setExpenses(prev => [...prev, { ...expense, id: docRef.id }]);
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    };

    const removeExpense = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'expenses', id));
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error removing expense:', error);
            throw error;
        }
    };

    const getSummary = (): SummaryItem[] => {
        // Calculate net amounts for each participant
        const netAmounts: Record<string, number> = {};

        participants.forEach(p => {
            netAmounts[p.id] = 0;
        });

        expenses.forEach(expense => {
            const payeeId = expense.payeeId;

            // Add the expense amount to the payee
            netAmounts[payeeId] = (netAmounts[payeeId] || 0) + expense.totalAmount;

            // Subtract each split amount from the participants who owe
            expense.splits.forEach(split => {
                netAmounts[split.participantId] = (netAmounts[split.participantId] || 0) - split.amount;
            });
        });

        // Generate settlement summary
        const summary: SummaryItem[] = [];
        const participantsList = participants.slice();

        // Separate debtors and creditors
        const debtors: Array<{ id: string; amount: number }> = [];
        const creditors: Array<{ id: string; amount: number }> = [];

        participantsList.forEach(p => {
            const amount = netAmounts[p.id];
            if (amount < 0) {
                debtors.push({ id: p.id, amount: Math.abs(amount) });
            } else if (amount > 0) {
                creditors.push({ id: p.id, amount });
            }
        });

        // Match creditors with debtors
        debtors.forEach(debtor => {
            let remainingDebt = debtor.amount;

            creditors.forEach(creditor => {
                if (remainingDebt > 0 && creditor.amount > 0) {
                    const transferAmount = Math.min(remainingDebt, creditor.amount);
                    summary.push({
                        fromId: debtor.id,
                        toId: creditor.id,
                        amount: transferAmount
                    });
                    remainingDebt -= transferAmount;
                    creditor.amount -= transferAmount;
                }
            });
        });
        return summary.filter(item => item.amount > 0);
    };

    const value: ExpenseContextType = {
        participants,
        expenses,
        addParticipant,
        removeParticipant,
        addExpense,
        removeExpense,
        getSummary
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};


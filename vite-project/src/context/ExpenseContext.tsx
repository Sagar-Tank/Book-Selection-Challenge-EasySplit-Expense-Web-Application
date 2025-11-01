import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Participant, Expense, SummaryItem } from '../types';
import { ExpenseContext, type ExpenseContextType } from './ExpenseContextFactory';
import { useAuth } from './AuthContext';

interface ExpenseProviderProps {
    children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
    const { currentUser } = useAuth();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const loadParticipants = useCallback(async () => {
        // Load all participants globally - no user filter
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
    }, []);

    const loadExpenses = useCallback(async () => {
        if (!currentUser) return;

        try {
            // Find current user's participant record
            const userParticipant = participants.find(p => p.userId === currentUser.uid);

            // Query 1: Expenses created by current user
            const q1 = query(
                collection(db, 'expenses'),
                where('userId', '==', currentUser.uid)
            );
            const snapshot1 = await getDocs(q1);
            const userCreatedExpenses = snapshot1.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Expense));

            // Query 2: Expenses where user is a participant
            let userParticipantExpenses: Expense[] = [];
            if (userParticipant) {
                try {
                    const q2 = query(
                        collection(db, 'expenses'),
                        where('participantIds', 'array-contains', userParticipant.id)
                    );
                    const snapshot2 = await getDocs(q2);
                    userParticipantExpenses = snapshot2.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Expense));
                } catch (error) {
                    console.error('Error loading participant expenses:', error);
                }
            }

            // Merge and deduplicate expenses
            const allExpenses = [...userCreatedExpenses, ...userParticipantExpenses];
            const uniqueExpenses = Array.from(
                new Map(allExpenses.map(exp => [exp.id, exp])).values()
            );

            // Sort by creation date (newest first)
            uniqueExpenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            setExpenses(uniqueExpenses);
        } catch (error) {
            console.error('Error loading expenses:', error);
        }
    }, [currentUser, participants]);

    // Load participants globally (once on mount)
    useEffect(() => {
        loadParticipants();
    }, [loadParticipants]);

    // Load expenses for current user when user or participants change
    useEffect(() => {
        if (currentUser && participants.length > 0) {
            loadExpenses();
        } else if (!currentUser) {
            setExpenses([]);
        }
    }, [currentUser, participants, loadExpenses]);

    useEffect(() => {
        console.log('Participants:', participants);
        console.log('Expenses:', expenses);
    }, [participants, expenses]);

    const addParticipant = async (name: string, email?: string) => {
        if (!currentUser) throw new Error('User not authenticated');

        try {
            interface ParticipantData {
                name: string;
                createdBy: string;
                createdAt: number;
                email?: string;
            }
            const participantData: ParticipantData = {
                name,
                createdBy: currentUser.uid,
                createdAt: Date.now()
            };
            if (email) {
                participantData.email = email;
            }
            const docRef = await addDoc(collection(db, 'participants'), participantData);
            setParticipants(prev => [...prev, { id: docRef.id, name, email, createdBy: currentUser.uid }]);
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
        if (!currentUser) throw new Error('User not authenticated');

        try {
            // Extract participant IDs from splits for easier querying
            const participantIds = expense.splits.map(split => split.participantId);
            // Also include payee if not already in the list
            if (!participantIds.includes(expense.payeeId)) {
                participantIds.push(expense.payeeId);
            }

            // Remove undefined fields before saving to Firestore
            const expenseToSave: Omit<Expense, 'id'> & { userId: string; createdAt: number; participantIds: string[] } = {
                ...expense,
                userId: currentUser.uid,
                participantIds: participantIds,
                createdAt: Date.now()
            };
            if (!expenseToSave.shares) {
                delete expenseToSave.shares;
            }
            const docRef = await addDoc(collection(db, 'expenses'), expenseToSave);
            const newExpense = { ...expense, id: docRef.id, participantIds };
            setExpenses(prev => [...prev, newExpense]);

            // Create notifications for all participants involved (except the payee)
            // Pass participants array to the function
            createNotificationsForExpense(newExpense, currentUser.uid, currentUser.email || 'Unknown');
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    };

    const createNotificationsForExpense = async (
        expense: Expense,
        creatorId: string,
        creatorEmail: string
    ) => {
        try {
            // Get all participant IDs involved in splits
            const involvedParticipantIds = new Set<string>();
            expense.splits.forEach(split => {
                involvedParticipantIds.add(split.participantId);
            });

            // Get payee info
            const payeeParticipant = participants.find(p => p.id === expense.payeeId);

            // Create notifications for each participant
            const notificationPromises = [];
            for (const participantId of involvedParticipantIds) {
                const participant = participants.find(p => p.id === participantId);
                if (!participant) continue;

                const split = expense.splits.find(s => s.participantId === participantId);
                if (!split) continue;

                // For registered users, use their userId, otherwise use email or participantId
                const targetUserId = participant.userId || participant.email || participantId;

                // Determine notification type
                let notificationType: 'owe' | 'paid_and_owe' | 'created' | 'payment_received';
                const amount = split.amount;

                if (participantId === expense.payeeId) {
                    // Payee is also in splits (they paid and are part of the split)
                    notificationType = 'paid_and_owe';
                } else if (participantId === creatorId || participant.userId === creatorId) {
                    // Creator is in the splits (they created the expense and owe money)
                    notificationType = 'created';
                } else {
                    // Regular participant who owes money
                    notificationType = 'owe';
                }

                // Don't send notification to creator if they're the only one involved
                // (unless they're not the payee and someone else paid)
                if (participantId === creatorId && participantId === expense.payeeId && involvedParticipantIds.size === 1) {
                    continue; // Skip notification for creator if they're the only participant
                }

                const notificationData = {
                    userId: targetUserId,
                    expenseId: expense.id,
                    expenseDescription: expense.description,
                    participantId: participantId,
                    participantName: participant.name,
                    amount: amount,
                    notificationType: notificationType,
                    payeeId: expense.payeeId,
                    payeeName: expense.payeeName || payeeParticipant?.name,
                    totalAmount: expense.totalAmount,
                    createdBy: creatorId,
                    createdByName: currentUser?.displayName || creatorEmail,
                    createdAt: Date.now(),
                    read: false
                };

                notificationPromises.push(
                    addDoc(collection(db, 'notifications'), notificationData)
                );
            }

            await Promise.all(notificationPromises);
        } catch (error) {
            console.error('Error creating notifications:', error);
            // Don't throw - expense creation should still succeed
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

        // Initialize net amounts for all current participants
        participants.forEach(p => {
            netAmounts[p.id] = 0;
        });

        console.log('=== Calculating Summary ===');
        console.log('Current participants:', participants.map(p => ({ id: p.id, name: p.name })));

        // Process all expenses and track all participants mentioned in them
        expenses.forEach(expense => {
            const payeeId = expense.payeeId;
            console.log(`Processing expense: ${expense.description} - Payee: ${payeeId}, Amount: ${expense.totalAmount}`);

            // Add the expense amount to the payee
            netAmounts[payeeId] = (netAmounts[payeeId] || 0) + expense.totalAmount;
            console.log(`After adding to payee, netAmounts[${payeeId}] = ${netAmounts[payeeId]}`);

            // Subtract each split amount from the participants who owe
            expense.splits.forEach(split => {
                console.log(`  Split: ${split.participantId} owes ${split.amount}`);
                netAmounts[split.participantId] = (netAmounts[split.participantId] || 0) - split.amount;
                console.log(`  After split, netAmounts[${split.participantId}] = ${netAmounts[split.participantId]}`);
            });
        });

        console.log('Net amounts before filter:', netAmounts);

        // Now filter to only include current participants in the summary
        const currentParticipantIds = new Set(participants.map(p => p.id));
        Object.keys(netAmounts).forEach(participantId => {
            if (!currentParticipantIds.has(participantId)) {
                console.log(`Removing non-current participant: ${participantId} with balance: ${netAmounts[participantId]}`);
                delete netAmounts[participantId];
            }
        });

        console.log('Net amounts after filter:', netAmounts);

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

        console.log('Debtors:', debtors);
        console.log('Creditors:', creditors);

        // Match creditors with debtors
        debtors.forEach(debtor => {
            let remainingDebt = debtor.amount;
            const debtorParticipant = participants.find(p => p.id === debtor.id);

            creditors.forEach(creditor => {
                if (remainingDebt > 0 && creditor.amount > 0) {
                    const transferAmount = Math.min(remainingDebt, creditor.amount);
                    const creditorParticipant = participants.find(p => p.id === creditor.id);
                    summary.push({
                        fromId: debtor.id,
                        fromName: debtorParticipant?.name,
                        toId: creditor.id,
                        toName: creditorParticipant?.name,
                        amount: transferAmount
                    });
                    remainingDebt -= transferAmount;
                    creditor.amount -= transferAmount;
                }
            });
        });

        console.log('Final summary:', summary);
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


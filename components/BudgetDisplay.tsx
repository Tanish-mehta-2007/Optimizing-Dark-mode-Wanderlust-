
import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { TripContext } from '../contexts/TripContext';
import { AuthContext } from '../contexts/AuthContext';
import { Expense, ExpenseCategory, TripParticipant, Trip } from '../types';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import { getSavedTrips } from '../services/storageService'; // To fetch all trips for selection

const EXPENSE_CATEGORIES: ExpenseCategory[] = ["Food & Drinks", "Accommodation", "Transportation", "Activities", "Shopping", "Miscellaneous"];

// --- Icons ---
const BudgetIconHeader = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>;
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.096m-3.22-.096L3.75 5.79m0 0c0-.02.017-.038.037-.056L5.03 4.232a1.875 1.875 0 011.64-.781c.535 0 1.024.21 1.39.557l8.063 8.063q.256 .255 .577 .478l.558 .417c.16.12.296.256.413.403M4.772 5.79L3.75 5.79" /></svg>;
const UsersIcon = ({className = "w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const CalendarIcon = ({ className = "w-5 h-5 text-slate-400 dark:text-slate-500" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c0-.414.336-.75.75-.75h10.5a.75.75 0 010 1.5H5.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const handleDateInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
  const inputElement = event.currentTarget;
  if (inputElement && typeof inputElement.showPicker === 'function') {
    try { inputElement.showPicker(); } catch (e) { console.warn("Could not programmatically open date picker:", e); }
  }
};

interface ExpenseFormProps {
  initialData?: Partial<Omit<Expense, 'id'>>;
  participants: TripParticipant[];
  currentUserParticipantId?: string;
  onSave: (data: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, participants, currentUserParticipantId, onSave, onCancel, isSaving }) => {
  const defaultPayerId = initialData?.paidById || currentUserParticipantId || participants[0]?.id || '';
  const defaultSplitWith = initialData?.splitWithIds && initialData.splitWithIds.length > 0 ? initialData.splitWithIds : participants.map(p => p.id);

  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    category: initialData?.category || EXPENSE_CATEGORIES[0],
    date: initialData?.date || new Date().toISOString().split('T')[0],
    paidById: defaultPayerId,
    splitWithIds: defaultSplitWith,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value }));
  };

  const handleSplitWithChange = (participantId: string) => {
    setFormData(prev => {
      const newSplitWithIds = prev.splitWithIds.includes(participantId)
        ? prev.splitWithIds.filter(id => id !== participantId)
        : [...prev.splitWithIds, participantId];
      return { ...prev, splitWithIds: newSplitWithIds };
    });
  };

  const handleSelectAllSplit = (select: boolean) => {
    setFormData(prev => ({
      ...prev,
      splitWithIds: select ? participants.map(p => p.id) : [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) { alert("Description and a positive amount are required."); return; }
    if (formData.splitWithIds.length === 0) { alert("Expense must be split with at least one participant."); return; }
    if (!formData.paidById) { alert("Please select who paid for this expense."); return; }
    onSave(formData);
  };
  
  const allSelected = participants.length > 0 && formData.splitWithIds.length === participants.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description*</label>
        <input type="text" name="description" id="description" value={formData.description} onChange={handleChange} required className="mt-1 block w-full p-2 sm:p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (USD)*</label>
        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required min="0.01" step="0.01" className="mt-1 block w-full p-2 sm:p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
            <label htmlFor="paidById" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Paid by</label>
            <select name="paidById" id="paidById" value={formData.paidById} onChange={handleChange} className="mt-1 block w-full p-2.5 sm:p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
            {participants.map(p => <option key={p.id} value={p.id}>{p.name}{p.isCurrentUser ? ' (You)' : ''}</option>)}
            </select>
        </div>
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full p-2.5 sm:p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm">
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
        <div className="relative mt-1">
            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} onClick={handleDateInputClick} className="appearance-none w-full p-2 sm:p-2.5 pr-10 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-700 dark:text-slate-200 cursor-pointer text-sm" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><CalendarIcon /></div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Split with (equally)</label>
        <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">Select participants to share this expense.</p>
            <button type="button" onClick={() => handleSelectAllSplit(!allSelected)} className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {allSelected ? "Deselect All" : "Select All"}
            </button>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1 sm:space-y-1.5 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700/30 custom-scrollbar">
          {participants.map(p => (
            <div key={p.id} className="flex items-center">
              <input type="checkbox" id={`split-${p.id}`} checked={formData.splitWithIds.includes(p.id)} onChange={() => handleSplitWithChange(p.id)} className="h-4 w-4 text-blue-600 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 mr-2 accent-blue-600"/>
              <label htmlFor={`split-${p.id}`} className="text-sm text-slate-700 dark:text-slate-300">{p.name}{p.isCurrentUser ? ' (You)' : ''}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md transition">Cancel</button>
        <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition disabled:opacity-70">
          {isSaving ? <LoadingSpinner size="small" message="" /> : (initialData?.description ? 'Save Changes' : 'Add Expense')}
        </button>
      </div>
    </form>
  );
};

interface ParticipantManagementModalProps {
    isOpen: boolean; onClose: () => void; participants: TripParticipant[];
    onAddParticipant: (name: string) => void; onRemoveParticipant: (participantId: string) => void;
}
  
const ParticipantManagementModal: React.FC<ParticipantManagementModalProps> = ({ isOpen, onClose, participants, onAddParticipant, onRemoveParticipant }) => {
    const [newParticipantName, setNewParticipantName] = useState('');
    const handleAdd = () => { if (newParticipantName.trim()) { onAddParticipant(newParticipantName.trim()); setNewParticipantName(''); } };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Trip Participants" size="md">
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-slate-700 dark:text-slate-200 mb-2">Current Participants:</h3>
            {participants.length === 0 ? (<p className="text-sm text-slate-500 dark:text-slate-400 italic">No participants yet.</p>) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {participants.map(p => (<li key={p.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{p.name}{p.isCurrentUser ? ' (You)' : ''}</span>
                    {!p.isCurrentUser && (<button onClick={() => onRemoveParticipant(p.id)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Remove participant"><DeleteIcon /></button>)}
                </li>))}
              </ul>)}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
            <label htmlFor="newParticipantName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Add New Participant:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" id="newParticipantName" value={newParticipantName} onChange={(e) => setNewParticipantName(e.target.value)} placeholder="Participant's name" className="flex-grow p-2 sm:p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"/>
              <button onClick={handleAdd} className="w-full sm:w-auto px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-md shadow-sm">Add</button>
            </div>
          </div>
        </div>
      </Modal>
    );
};

interface BudgetDisplayProps { onNext: () => void; onBack: () => void; }

const BudgetDisplay: React.FC<BudgetDisplayProps> = ({ onNext, onBack }) => {
  const { currentUser } = useContext(AuthContext);
  const { currentTrip, setCurrentTrip, setBudget, addExpense, deleteExpense, addParticipant, removeParticipant } = useContext(TripContext);
  
  const [allUserTrips, setAllUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [newBudgetInput, setNewBudgetInput] = useState<string>('');
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      const userTrips = getSavedTrips(currentUser.id);
      setAllUserTrips(userTrips);
      if (currentTrip?.id && userTrips.some(t => t.id === currentTrip.id)) {
        setSelectedTripId(currentTrip.id);
      } else if (userTrips.length > 0) {
        setSelectedTripId(userTrips[0].id);
        setCurrentTrip(userTrips[0]); 
      } else {
        setSelectedTripId(null);
        setCurrentTrip(null);
      }
    } else {
      setAllUserTrips([]);
      setSelectedTripId(null);
      setCurrentTrip(null);
    }
  }, [currentUser, currentTrip?.id, setCurrentTrip]);

  useEffect(() => {
    const tripToDisplay = allUserTrips.find(t => t.id === selectedTripId);
    if (tripToDisplay) {
      setNewBudgetInput(tripToDisplay.budget?.toString() || '');
      if (currentTrip?.id !== tripToDisplay.id) { 
        setCurrentTrip(tripToDisplay);
      }
    } else if (selectedTripId === null && allUserTrips.length === 0) {
        setNewBudgetInput(''); 
    }
  }, [selectedTripId, allUserTrips, currentTrip?.id, setCurrentTrip]);


  const handleTripSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedTripId = e.target.value;
    setSelectedTripId(newSelectedTripId);
    const newSelectedTrip = allUserTrips.find(t => t.id === newSelectedTripId);
    if (newSelectedTrip) {
      setCurrentTrip(newSelectedTrip); 
    }
  };

  const currentUserParticipantId = useMemo(() => currentTrip?.participants?.find(p => p.isCurrentUser)?.id, [currentTrip?.participants]);
  const totalExpenses = useMemo(() => currentTrip?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0, [currentTrip?.expenses]);
  const remainingBudget = useMemo(() => (currentTrip?.budget || 0) - totalExpenses, [currentTrip?.budget, totalExpenses]);

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip) { setError("No trip selected to set budget."); return; }
    const budgetValue = parseFloat(newBudgetInput);
    if (!isNaN(budgetValue) && budgetValue >= 0) { setBudget(budgetValue); setError(null); } 
    else { setError("Please enter a valid non-negative number for the budget."); setNewBudgetInput(currentTrip.budget?.toString() || ''); }
  };

  const handleOpenAddExpenseModal = () => { if(currentTrip) setIsExpenseModalOpen(true); else setError("Please select a trip first."); };
  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>) => {
    setIsSavingExpense(true); setError(null);
    try { addExpense(expenseData); setIsExpenseModalOpen(false); } 
    catch (err) { setError(err instanceof Error ? err.message : "Failed to save expense."); } 
    finally { setIsSavingExpense(false); }
  };
  const handleDeleteExpense = (expenseId: string) => { if (window.confirm("Delete this expense?")) deleteExpense(expenseId); };
  
  const sortedExpenses = useMemo(() => [...(currentTrip?.expenses || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [currentTrip?.expenses]);
  const getParticipantName = (id: string) => currentTrip?.participants?.find(par => par.id === id)?.name || 'Unknown';

  const expenseSplitSummary = useMemo(() => {
    if (!currentTrip?.expenses || !currentTrip?.participants) return [];
    return currentTrip.participants.map(participant => {
      const paidByParticipant = currentTrip.expenses!.filter(e => e.paidById === participant.id).reduce((sum, e) => sum + e.amount, 0);
      const shareOfExpenses = currentTrip.expenses!.filter(e => e.splitWithIds.includes(participant.id)).reduce((sum, e) => sum + (e.amount / e.splitWithIds.length), 0);
      return { participantName: participant.name, isCurrentUser: participant.isCurrentUser, paid: paidByParticipant, share: shareOfExpenses, balance: paidByParticipant - shareOfExpenses };
    });
  }, [currentTrip?.expenses, currentTrip?.participants]);

  const tripDisplayTitle = currentTrip?.itinerary?.title || (currentTrip?.destinations && currentTrip.destinations.length > 0 ? `your trip to ${currentTrip.destinations.join(' & ')}` : 'your trip');

  if (!currentUser) { return <div className="text-center p-6 sm:p-8">Please log in to manage budgets.</div>; }
  if (allUserTrips.length === 0 && !currentTrip) { return <div className="text-center p-6 sm:p-8">No trips found. Plan a trip to manage its budget.</div>; }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <header className="text-left mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <BudgetIconHeader /> Budget
        </h1>
        {allUserTrips.length > 1 && (
            <div className="mt-4">
                <label htmlFor="tripSelect" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Trip:</label>
                <select id="tripSelect" value={selectedTripId || ''} onChange={handleTripSelectionChange} className="w-full max-w-md p-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                    {allUserTrips.map(trip => (<option key={trip.id} value={trip.id}>{trip.itinerary?.title || trip.destinations.join(' & ')}</option>))}
                </select>
            </div>
        )}
        <p className="text-slate-600 dark:text-slate-400 text-md mt-2">Manage your trip budget and expenses for {tripDisplayTitle}.</p>
      </header>

      {!currentTrip && selectedTripId ? (<div className="flex justify-center items-center h-64"><LoadingSpinner message="Loading trip budget..."/></div>) : !currentTrip ? (<div className="text-center p-6 sm:p-8">Please select a trip to view its budget.</div>) : (
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        <div className="lg:w-2/3 space-y-6 sm:space-y-8">
          <section className="bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Total budget</h2>
            <form onSubmit={handleSetBudget} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-grow"><span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 dark:text-slate-400 text-sm sm:text-base">$</span><input type="number" value={newBudgetInput} onChange={(e) => setNewBudgetInput(e.target.value)} placeholder="0.00" className="w-full p-2.5 sm:p-3 pl-7 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base" aria-label="Total budget amount" min="0" step="0.01"/></div>
                <button type="submit" className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm shadow-sm transition-colors">Set Budget</button>
            </form>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </section>
          <section className="bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Participants</h2>
              <button onClick={() => setIsParticipantModalOpen(true)} className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"><UsersIcon/> Manage</button>
            </div>
            {currentTrip.participants && currentTrip.participants.length > 0 ? (<div className="flex flex-wrap gap-2 sm:gap-3">
                {currentTrip.participants.map(p => (<div key={p.id} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-sm"><span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${p.isCurrentUser ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-500'}`}></span><span>{p.name}{p.isCurrentUser ? ' (You)' : ''}</span></div>))}
            </div>) : (<p className="text-slate-500 dark:text-slate-400 italic text-center py-3 text-sm">Only you are participating.</p>)}
          </section>
          <section className="bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2"><h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Expenses</h2><button onClick={handleOpenAddExpenseModal} className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md shadow-sm transition-colors">Add Expense</button></div>
            {sortedExpenses.length === 0 ? (<p className="text-slate-500 dark:text-slate-400 italic text-center py-4 text-sm">No expenses logged yet.</p>) : (
              <div className="overflow-x-auto max-h-[400px] custom-scrollbar pr-1">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm"><thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10"><tr>
                      <th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item</th><th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Paid By</th><th scope="col" className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th><th scope="col" className="px-1 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr></thead>
                <tbody className="bg-white dark:bg-slate-850 divide-y divide-slate-200 dark:divide-slate-700">
                    {sortedExpenses.map(expense => (<tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap"><div className="text-sm text-slate-700 dark:text-slate-200">{expense.description}</div><div className="text-xs text-slate-500 dark:text-slate-400">{expense.category} - {new Date(expense.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div><div className="sm:hidden text-xs text-slate-500 dark:text-slate-400 mt-0.5">Paid by: {getParticipantName(expense.paidById)}</div></td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{getParticipantName(expense.paidById)}</td>
                        <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-red-500 dark:text-red-400 font-medium">${expense.amount.toFixed(2)}</td>
                        <td className="px-1 py-3 whitespace-nowrap text-center text-sm"><button onClick={() => handleDeleteExpense(expense.id)} className="p-1 sm:p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Delete Expense"><DeleteIcon /></button></td>
                    </tr>))}
                </tbody></table>
              </div>)}
          </section>
        </div>
        <aside className="lg:w-1/3 space-y-4 sm:space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Total Budget</h3><p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">${(currentTrip.budget || 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Total Spent</h3><p className="text-2xl sm:text-3xl font-bold text-red-500 dark:text-red-400">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-600">
            <h3 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-1">Remaining</h3><p className={`text-2xl sm:text-3xl font-bold ${remainingBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>${remainingBudget.toFixed(2)}</p>
          </div>
          <section className="bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Expense Split Summary</h2>
            {expenseSplitSummary.length === 0 ? (<p className="text-slate-500 dark:text-slate-400 italic text-center py-3 text-sm">No participants to summarize expenses for.</p>) : (
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {expenseSplitSummary.map(summary => (<div key={summary.participantName} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{summary.participantName}{summary.isCurrentUser ? ' (You)' : ''}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Paid: <span className="text-emerald-600 dark:text-emerald-400">${summary.paid.toFixed(2)}</span> | Share: <span className="text-red-500 dark:text-red-400">${summary.share.toFixed(2)}</span></p>
                    <p className={`text-sm font-medium mt-1 ${summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {summary.balance >= 0 ? `Is owed: $${summary.balance.toFixed(2)}` : `Owes: $${Math.abs(summary.balance).toFixed(2)}`}
                    </p>
                </div>))}
              </div>)}
          </section>
        </aside>
      </div>
      )}
      
      {isExpenseModalOpen && currentTrip && (
        <Modal isOpen={isExpenseModalOpen} onClose={() => { setIsExpenseModalOpen(false); }} title="Add New Expense" size="md">
          <ExpenseForm participants={currentTrip.participants || []} currentUserParticipantId={currentUserParticipantId} onSave={handleSaveExpense} onCancel={() => { setIsExpenseModalOpen(false); }} isSaving={isSavingExpense} />
        </Modal>
      )}
      {isParticipantModalOpen && currentTrip && (
        <ParticipantManagementModal isOpen={isParticipantModalOpen} onClose={() => setIsParticipantModalOpen(false)} participants={currentTrip.participants || []} onAddParticipant={addParticipant} onRemoveParticipant={removeParticipant}/>
      )}

      <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <button onClick={onBack} className="w-full sm:w-auto bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-sm transition-colors">Back to Packing List</button>
        <button onClick={onNext} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md transition-colors transform hover:scale-105">View All My Trips</button>
      </div>
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; } .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }`}</style>
    </div>
  );
};

export default BudgetDisplay;

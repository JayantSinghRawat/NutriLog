import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { DailySummary } from './components/DailySummary.js';
import { QuickAddBar } from './components/QuickAddBar.js';
import { FoodTable } from './components/FoodTable.js';
import { GoalsModal } from './components/GoalsModal.js';
import { PastDaysModal } from './components/PastDaysModal.js';
import { AuthModal } from './components/AuthModal.js';
import { LoginPage } from './components/LoginPage.js';
import { useAuth } from './context/AuthContext.js';
import { FoodEntry, NutrientTotals } from './types/nutrition.js';
import { fetchDailyLog, saveDailyLogToDb } from './services/api.js';
import { formatDateKey } from './utils/storage.js';

export function App() {
  const { user } = useAuth();

  // If not logged in, render the dedicated Login / Sign-up page
  if (!user) {
    return <LoginPage />;
  }
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState<NutrientTotals>({
    weight: 0,
    kcal: 0,
    carbs: 0,
    fat: 0,
    fibre: 0,
    protein: 0,
  });

  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const dateKey = formatDateKey(currentDate);

  // Load daily log from MongoDB / storage when date or user changes
  useEffect(() => {
    if (!user?.id) return;
    let isCancelled = false;

    fetchDailyLog(user.id, dateKey).then(({ entries: loadedEntries, totals: loadedTotals }) => {
      if (!isCancelled) {
        setEntries(loadedEntries);
        setTotals(loadedTotals);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [user?.id, dateKey]);

  // Persist entries to MongoDB and recompute totals
  const persistEntries = useCallback(
    async (newEntries: FoodEntry[]) => {
      setEntries(newEntries);
      if (!user?.id) return;
      const updatedTotals = await saveDailyLogToDb(user.id, dateKey, newEntries);
      setTotals(updatedTotals);
    },
    [user?.id, dateKey]
  );

  const handleAddEntries = (newEntries: FoodEntry[]) => {
    const next = [...entries, ...newEntries];
    persistEntries(next);
  };

  const handleUpdateEntry = (updated: FoodEntry) => {
    const next = entries.map((item) => (item.id === updated.id ? updated : item));
    persistEntries(next);
  };

  const handleDeleteEntry = (id: string) => {
    const next = entries.filter((item) => item.id !== id);
    persistEntries(next);
  };

  const handleDuplicateEntry = (entry: FoodEntry) => {
    const dup: FoodEntry = {
      ...entry,
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    };
    const next = [...entries, dup];
    persistEntries(next);
  };

  const handleSelectPastDate = (selectedDateKey: string) => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, d));
  };

  return (
    <div className="app-container">
      {/* Header with date navigation and monochrome theme toggle */}
      <Header
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onOpenGoals={() => setIsGoalsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Smart Natural Language Quick Add Bar (Gemini AI Powered) */}
      <QuickAddBar onAddEntries={handleAddEntries} />

      {/* Real-time Interactive Nutrient Table with Totals row at end */}
      <FoodTable
        entries={entries}
        totals={totals}
        onUpdateEntry={handleUpdateEntry}
        onDeleteEntry={handleDeleteEntry}
        onDuplicateEntry={handleDuplicateEntry}
      />

      {/* Today's Nutrient Summary / Progress Goals (below table) */}
      <DailySummary totals={totals} onOpenGoals={() => setIsGoalsOpen(true)} />

      {/* Modals */}
      <GoalsModal isOpen={isGoalsOpen} onClose={() => setIsGoalsOpen(false)} />

      <PastDaysModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDate={handleSelectPastDate}
        currentDateKey={dateKey}
      />

      <AuthModal />
    </div>
  );
}

export default App;

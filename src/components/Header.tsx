import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Calendar,
  User,
  LogOut,
  Target,
  History,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { formatDisplayDate, formatDateKey } from '../utils/storage.js';

interface HeaderProps {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  onOpenGoals: () => void;
  onOpenHistory: () => void;
}

export function Header({
  currentDate,
  setCurrentDate,
  onOpenGoals,
  onOpenHistory,
}: HeaderProps) {
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      setCurrentDate(new Date(y, m - 1, d));
    }
  };

  const currentDateKey = formatDateKey(currentDate);
  const isToday = currentDateKey === formatDateKey(new Date());

  return (
    <header className="header-wrapper">
      {/* Row 1: Brand on left, compact actions on right */}
      <div className="header-top-row">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div className="brand-title">
            NutriLog
            <span className="brand-tag">Tracker</span>
          </div>
        </div>

        <div className="header-actions-group">
          <button
            className="icon-action-btn compact-header-btn"
            onClick={onOpenHistory}
            title="Past Days History"
            aria-label="Past Days History"
          >
            <History size={16} />
            <span className="header-btn-text">Past Days</span>
          </button>

          <button
            className="icon-action-btn compact-header-btn"
            onClick={onOpenGoals}
            title="Macro Targets"
            aria-label="Macro Targets"
          >
            <Target size={16} />
            <span className="header-btn-text">Goals</span>
          </button>

          <button
            className="theme-toggle-btn compact-header-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'black' ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'black' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user ? (
            <button
              className="icon-action-btn compact-header-btn user-btn"
              onClick={logout}
              title={`Logged in as ${user.name}. Tap to log out.`}
            >
              <User size={15} />
              <span className="user-name-text">
                {user.name}
              </span>
              <LogOut size={12} style={{ opacity: 0.6 }} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => setIsAuthModalOpen(true)}
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', minHeight: 34 }}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Date Navigator */}
      <div className="date-navigator">
        <button
          className="nav-arrow-btn"
          onClick={handlePrevDay}
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft size={17} />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            className="date-display-btn"
            onClick={() => dateInputRef.current && (dateInputRef.current as any).showPicker?.()}
            title="Click to select date"
          >
            <Calendar size={14} />
            <span>{formatDisplayDate(currentDateKey)}</span>
            {isToday && <span className="today-chip">Today</span>}
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={currentDateKey}
            onChange={handleDateChange}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              left: 0,
              bottom: 0,
              width: 1,
              height: 1,
            }}
          />
        </div>

        <button
          className="nav-arrow-btn"
          onClick={handleNextDay}
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </header>
  );
}

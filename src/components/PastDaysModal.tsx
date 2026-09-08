import React, { useEffect, useState } from 'react';
import { X, Calendar, ChevronRight, Loader2, Utensils } from 'lucide-react';
import { HistorySummaryItem } from '../types/nutrition.js';
import { fetchHistorySummary } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { formatDisplayDate, formatDateKey } from '../utils/storage.js';

interface PastDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
  currentDateKey: string;
}

export function PastDaysModal({
  isOpen,
  onClose,
  onSelectDate,
  currentDateKey,
}: PastDaysModalProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistorySummaryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoading(true);
      fetchHistorySummary(user.id)
        .then((data) => setHistory(data))
        .catch((err) => console.error('Failed to fetch history:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            <h3 className="modal-title">Past Days History (MongoDB)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <Utensils size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
              <p>No past days saved yet.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                As you log meals, past days are automatically saved and displayed here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => {
                const isActive = item.date === currentDateKey;
                return (
                  <div
                    key={item.date}
                    className={`history-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectDate(item.date);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="history-date">
                        {formatDisplayDate(item.date)}
                        {item.date === formatDateKey(new Date()) && (
                          <span className="today-chip" style={{ marginLeft: 8 }}>Today</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'} logged
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="history-macros">
                        <span>{Math.round(item.totals.kcal)} kcal</span>
                        <span>P: {Math.round(item.totals.protein)}g</span>
                        <span>C: {Math.round(item.totals.carbs)}g</span>
                        <span>F: {Math.round(item.totals.fat)}g</span>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

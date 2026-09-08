import React, { useState, useMemo } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { FoodEntry } from '../types/nutrition.js';
import { parseFoodQueryApi } from '../services/api.js';
import { parseFoodQuery } from '../utils/nutritionParser.js';
import { useAuth } from '../context/AuthContext.js';

interface QuickAddBarProps {
  onAddEntry: (entry: FoodEntry) => void;
}

const QUICK_CHIPS = [
  '10h soya chunks dry',
  '100g chicken breast',
  '2 eggs',
  '1 scoop whey',
  '2 rotis',
  '100g paneer',
  '150g rice',
  '1 banana',
];

export function QuickAddBar({ onAddEntry }: QuickAddBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const livePreview = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return null;
    return parseFoodQuery(query);
  }, [query]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = query.trim();
    if (!clean || loading) return;

    setLoading(true);
    try {
      const result = await parseFoodQueryApi(clean, user?.id, user?.geminiApiKey);
      if (result) {
        onAddEntry(result);
        setQuery('');
      }
    } catch (err) {
      console.error('Failed to add food entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = async (chipText: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await parseFoodQueryApi(chipText, user?.id, user?.geminiApiKey);
      if (result) {
        onAddEntry(result);
      }
    } catch (err) {
      console.error('Failed to add chip entry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-add-wrapper">
      <form className="quick-add-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <Search size={18} className="input-search-icon" />
          <input
            type="text"
            className="quick-add-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Type food & quantity e.g. "10h soya chunks dry", "100g chicken breast", "2 eggs"...'
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="submit-food-btn"
          disabled={!query.trim() || loading}
          title="Add to daily table"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Plus size={16} strokeWidth={2.5} />
              <span>Add to Table</span>
            </>
          )}
        </button>
      </form>

      {/* Live Preview (Monochrome) */}
      {livePreview && (
        <div className="live-preview-box">
          <div className="preview-pill-group">
            <span className="preview-food-name">{livePreview.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>({livePreview.weight}g)</span>
          </div>

          <div className="preview-pill-group">
            <span className="preview-badge">{livePreview.kcal} kcal</span>
            <span className="preview-badge">P: {livePreview.protein}g</span>
            <span className="preview-badge">C: {livePreview.carbs}g</span>
            <span className="preview-badge">F: {livePreview.fat}g</span>
            <span className="preview-badge">Fib: {livePreview.fibre}g</span>
          </div>
        </div>
      )}

      {/* Quick Suggestion Chips (Monochrome) */}
      <div className="chips-scroll-container">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 4 }}>
          Quick Add:
        </span>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            className="suggestion-chip"
            onClick={() => handleChipClick(chip)}
            disabled={loading}
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

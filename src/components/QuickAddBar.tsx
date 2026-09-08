import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { FoodEntry } from '../types/nutrition.js';
import { parseFoodQueryApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface QuickAddBarProps {
  onAddEntry: (entry: FoodEntry) => void;
}

export function QuickAddBar({ onAddEntry }: QuickAddBarProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = query.trim();
    if (!clean || loading) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      // Direct call to Gemini AI backend
      const result = await parseFoodQueryApi(clean, user?.id, user?.geminiApiKey);
      if (result) {
        onAddEntry(result);
        setQuery('');
      }
    } catch (err: any) {
      console.error('Failed to parse with Gemini API:', err);
      setErrorMessage(err.message || 'Error communicating with Gemini API.');
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="What did you eat?"
            enterKeyHint="go"
            autoCapitalize="sentences"
            autoCorrect="on"
          />
        </div>

        <button
          type="submit"
          className="submit-food-btn"
          disabled={!query.trim() || loading}
          title="Send to Gemini AI to calculate nutrition"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span className="desktop-btn-text">Calculate & Add</span>
              <span className="mobile-btn-text">Add</span>
            </>
          )}
        </button>
      </form>

      {/* Error / Alert notice */}
      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--surface-input)',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Trash2, Copy, Plus, Utensils, Loader2 } from 'lucide-react';
import { FoodEntry, NutrientTotals } from '../types/nutrition.js';
import { calculateNutrientsFromWeight } from '../utils/nutritionParser.js';
import { parseFoodQueryApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface FoodTableProps {
  entries: FoodEntry[];
  totals: NutrientTotals;
  onUpdateEntry: (updated: FoodEntry) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (entry: FoodEntry) => void;
  onAddEntry: (entry: FoodEntry) => void;
}

export function FoodTable({
  entries,
  totals,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
  onAddEntry,
}: FoodTableProps) {
  const [inlineInput, setInlineInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const { user } = useAuth();

  // Handle direct inline weight change with immediate recalculation
  const handleWeightChange = (entry: FoodEntry, newWeightStr: string) => {
    const newWeight = parseFloat(newWeightStr) || 0;
    let updated: FoodEntry;

    if (entry.per100g) {
      const recalculated = calculateNutrientsFromWeight(newWeight, entry.per100g);
      updated = {
        ...entry,
        weight: newWeight,
        kcal: recalculated.kcal,
        carbs: recalculated.carbs,
        fat: recalculated.fat,
        fibre: recalculated.fibre,
        protein: recalculated.protein,
      };
    } else {
      const ratio = entry.weight > 0 ? newWeight / entry.weight : 1;
      updated = {
        ...entry,
        weight: newWeight,
        kcal: Math.round((entry.kcal || 0) * ratio),
        carbs: Math.round((entry.carbs || 0) * ratio * 10) / 10,
        fat: Math.round((entry.fat || 0) * ratio * 10) / 10,
        fibre: Math.round((entry.fibre || 0) * ratio * 10) / 10,
        protein: Math.round((entry.protein || 0) * ratio * 10) / 10,
      };
    }

    onUpdateEntry(updated);
  };

  const handleFieldChange = (entry: FoodEntry, field: keyof FoodEntry, val: string) => {
    if (field === 'name') {
      onUpdateEntry({ ...entry, name: val });
    } else {
      const num = parseFloat(val) || 0;
      onUpdateEntry({ ...entry, [field]: num });
    }
  };

  const handleInlineAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inlineInput.trim() && !isParsing) {
      e.preventDefault();
      setIsParsing(true);
      try {
        const parsed = await parseFoodQueryApi(inlineInput.trim(), user?.id, user?.geminiApiKey);
        if (parsed) {
          onAddEntry(parsed);
          setInlineInput('');
        }
      } catch (err) {
        console.error('Error adding inline item:', err);
      } finally {
        setIsParsing(false);
      }
    }
  };

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-title-group">
          <Utensils size={18} />
          <h2 className="table-title">Daily Food Log</h2>
          <span className="item-count-badge">
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click cell to edit • Edit weight to recalculate
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="nutrient-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Food Name</th>
              <th className="num-col">Weight (g)</th>
              <th className="num-col">Kcal</th>
              <th className="num-col">Carbs (g)</th>
              <th className="num-col">Fat (g)</th>
              <th className="num-col">Fibre (g)</th>
              <th className="num-col">Protein (g)</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="table-empty-state">
                    <div className="empty-icon-circle">
                      <Utensils size={22} />
                    </div>
                    <div className="empty-state-title">No foods logged for this day yet</div>
                    <div className="empty-state-desc">
                      Type what you eat (e.g. <code>10h soya chunks dry</code> or <code>100g chicken breast</code>) to automatically calculate nutrition!
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => (
                <tr key={entry.id || idx}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="text"
                        className="editable-input name-input"
                        value={entry.name}
                        onChange={(e) => handleFieldChange(entry, 'name', e.target.value)}
                        title="Edit food name"
                      />
                      {entry.source === 'gemini' && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '3px',
                            border: '1px solid var(--border-medium)',
                            background: 'var(--surface-input)',
                            color: 'var(--text-primary)',
                            flexShrink: 0,
                          }}
                          title="Calculated via Google Gemini AI"
                        >
                          Gemini
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input weight-input"
                      value={entry.weight}
                      onChange={(e) => handleWeightChange(entry, e.target.value)}
                      title="Change weight to recalculate nutrition"
                    />
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input num-input"
                      value={entry.kcal}
                      onChange={(e) => handleFieldChange(entry, 'kcal', e.target.value)}
                    />
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input num-input"
                      value={entry.carbs}
                      onChange={(e) => handleFieldChange(entry, 'carbs', e.target.value)}
                    />
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input num-input"
                      value={entry.fat}
                      onChange={(e) => handleFieldChange(entry, 'fat', e.target.value)}
                    />
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input num-input"
                      value={entry.fibre}
                      onChange={(e) => handleFieldChange(entry, 'fibre', e.target.value)}
                    />
                  </td>
                  <td className="num-col">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="editable-input num-input"
                      value={entry.protein}
                      onChange={(e) => handleFieldChange(entry, 'protein', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="action-icon-btn"
                        onClick={() => onDuplicateEntry(entry)}
                        title="Duplicate row"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="action-icon-btn"
                        onClick={() => onDeleteEntry(entry.id)}
                        title="Delete row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}

            {/* In-table Quick Entry Row */}
            <tr style={{ background: 'var(--surface-input)' }}>
              <td style={{ textAlign: 'center' }}>
                {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </td>
              <td colSpan={8} style={{ padding: '0.4rem 0.75rem' }}>
                <input
                  type="text"
                  placeholder='Quick table add: type "10h soya chunks dry" and press Enter...'
                  value={inlineInput}
                  disabled={isParsing}
                  onChange={(e) => setInlineInput(e.target.value)}
                  onKeyDown={handleInlineAdd}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                  }}
                />
              </td>
            </tr>
          </tbody>

          {/* Table Totals Row At End */}
          {entries.length > 0 && (
            <tfoot>
              <tr className="table-totals-row">
                <td colSpan={2} className="total-label">
                  Daily Total
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.weight * 10) / 10}g
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.kcal)}
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.carbs * 10) / 10}g
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.fat * 10) / 10}g
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.fibre * 10) / 10}g
                </td>
                <td className="num-col total-val">
                  {Math.round(totals.protein * 10) / 10}g
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

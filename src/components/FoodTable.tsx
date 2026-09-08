import React, { useState } from 'react';
import { Trash2, Copy, Utensils, LayoutGrid, List } from 'lucide-react';
import { FoodEntry, NutrientTotals } from '../types/nutrition.js';
import { calculateNutrientsFromWeight } from '../utils/nutritionParser.js';

interface FoodTableProps {
  entries: FoodEntry[];
  totals: NutrientTotals;
  onUpdateEntry: (updated: FoodEntry) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (entry: FoodEntry) => void;
}

export function FoodTable({
  entries,
  totals,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
}: FoodTableProps) {
  // Toggle between mobile cards and traditional table view (cards default on mobile)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 'cards';
    }
    return 'table';
  });

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* View toggle button (especially handy on mobile) */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Card View (best for mobile)"
            >
              <LayoutGrid size={15} />
              <span className="toggle-label">Cards</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Spreadsheet Table View"
            >
              <List size={15} />
              <span className="toggle-label">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {entries.length === 0 ? (
        <div className="table-empty-state">
          <div className="empty-icon-circle">
            <Utensils size={20} />
          </div>
          <div className="empty-state-title">No foods logged for this day yet</div>
        </div>
      ) : viewMode === 'cards' ? (
        /* MOBILE CARDS VIEW */
        <div className="mobile-cards-list">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className="mobile-food-card">
              <div className="mobile-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                  <span className="mobile-card-index">#{idx + 1}</span>
                  <input
                    type="text"
                    className="mobile-card-name-input"
                    value={entry.name}
                    onChange={(e) => handleFieldChange(entry, 'name', e.target.value)}
                    title="Edit food name"
                  />
                  {entry.source === 'gemini' && (
                    <span className="gemini-badge">Gemini</span>
                  )}
                </div>

                <div className="row-actions">
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => onDuplicateEntry(entry)}
                    title="Duplicate item"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn delete-btn"
                    onClick={() => onDeleteEntry(entry.id)}
                    title="Delete item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Weight Editor */}
              <div className="mobile-card-weight-row">
                <label className="mobile-field-label">Weight</label>
                <div className="mobile-weight-input-box">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-weight-input"
                    value={entry.weight}
                    onChange={(e) => handleWeightChange(entry, e.target.value)}
                  />
                  <span className="mobile-unit-tag">g</span>
                </div>
              </div>

              {/* Macro Grid for this item */}
              <div className="mobile-macros-grid">
                <div className="mobile-macro-cell">
                  <span className="mobile-macro-label">Kcal</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-macro-input"
                    value={entry.kcal}
                    onChange={(e) => handleFieldChange(entry, 'kcal', e.target.value)}
                  />
                </div>

                <div className="mobile-macro-cell">
                  <span className="mobile-macro-label">Carbs</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-macro-input"
                    value={entry.carbs}
                    onChange={(e) => handleFieldChange(entry, 'carbs', e.target.value)}
                  />
                </div>

                <div className="mobile-macro-cell">
                  <span className="mobile-macro-label">Fat</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-macro-input"
                    value={entry.fat}
                    onChange={(e) => handleFieldChange(entry, 'fat', e.target.value)}
                  />
                </div>

                <div className="mobile-macro-cell">
                  <span className="mobile-macro-label">Fibre</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-macro-input"
                    value={entry.fibre}
                    onChange={(e) => handleFieldChange(entry, 'fibre', e.target.value)}
                  />
                </div>

                <div className="mobile-macro-cell">
                  <span className="mobile-macro-label">Protein</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    inputMode="decimal"
                    className="mobile-macro-input"
                    value={entry.protein}
                    onChange={(e) => handleFieldChange(entry, 'protein', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Totals Footer Card */}
          <div className="mobile-totals-card">
            <div className="mobile-totals-title">Daily Total</div>
            <div className="mobile-totals-grid">
              <div className="mobile-total-item">
                <span className="mobile-total-label">Weight</span>
                <span className="mobile-total-value">{Math.round(totals.weight * 10) / 10}g</span>
              </div>
              <div className="mobile-total-item">
                <span className="mobile-total-label">Calories</span>
                <span className="mobile-total-value">{Math.round(totals.kcal)} kcal</span>
              </div>
              <div className="mobile-total-item">
                <span className="mobile-total-label">Protein</span>
                <span className="mobile-total-value">{Math.round(totals.protein * 10) / 10}g</span>
              </div>
              <div className="mobile-total-item">
                <span className="mobile-total-label">Carbs</span>
                <span className="mobile-total-value">{Math.round(totals.carbs * 10) / 10}g</span>
              </div>
              <div className="mobile-total-item">
                <span className="mobile-total-label">Fat</span>
                <span className="mobile-total-value">{Math.round(totals.fat * 10) / 10}g</span>
              </div>
              <div className="mobile-total-item">
                <span className="mobile-total-label">Fibre</span>
                <span className="mobile-total-value">{Math.round(totals.fibre * 10) / 10}g</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TRADITIONAL SPREADSHEET TABLE VIEW */
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
              {entries.map((entry, idx) => (
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
                        <span className="gemini-badge" title="Calculated via Google Gemini AI">
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
                      inputMode="decimal"
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
                      inputMode="decimal"
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
                      inputMode="decimal"
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
                      inputMode="decimal"
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
                      inputMode="decimal"
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
                      inputMode="decimal"
                      className="editable-input num-input"
                      value={entry.protein}
                      onChange={(e) => handleFieldChange(entry, 'protein', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="action-icon-btn"
                        onClick={() => onDuplicateEntry(entry)}
                        title="Duplicate row"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn delete-btn"
                        onClick={() => onDeleteEntry(entry.id)}
                        title="Delete row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Totals Row At End */}
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
          </table>
        </div>
      )}
    </div>
  );
}

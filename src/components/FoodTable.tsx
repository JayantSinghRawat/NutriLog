import React from 'react';
import { Trash2, Copy, Utensils } from 'lucide-react';
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
          <Utensils size={16} />
          <h2 className="table-title">Daily Food Log</h2>
          <span className="item-count-badge">
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* EMPTY STATE */}
      {entries.length === 0 ? (
        <div className="table-empty-state">
          <div className="empty-icon-circle">
            <Utensils size={18} />
          </div>
          <div className="empty-state-title">No foods logged for this day yet</div>
        </div>
      ) : (
        /* SCREEN-FITTED RESPONSIVE TABLE */
        <div className="table-container-screen">
          <table className="fitted-nutrient-table">
            <thead>
              <tr>
                <th className="th-food">Food</th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Weight</span>
                    <span className="th-metric">(g)</span>
                  </div>
                </th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Calories</span>
                    <span className="th-metric">(Kcal)</span>
                  </div>
                </th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Protein</span>
                    <span className="th-metric">(g)</span>
                  </div>
                </th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Carbs</span>
                    <span className="th-metric">(g)</span>
                  </div>
                </th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Fat</span>
                    <span className="th-metric">(g)</span>
                  </div>
                </th>
                <th className="th-num">
                  <div className="th-cell-wrapper">
                    <span className="th-name">Fibre</span>
                    <span className="th-metric">(g)</span>
                  </div>
                </th>
                <th className="th-act"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.id || idx}>
                  <td className="td-food">
                    <textarea
                      rows={Math.max(1, Math.min(3, Math.ceil((entry.name || '').length / 11)))}
                      className="fitted-name-textarea"
                      value={entry.name}
                      onChange={(e) => handleFieldChange(entry, 'name', e.target.value)}
                      title={entry.name}
                    />
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.weight}
                      onChange={(e) => handleWeightChange(entry, e.target.value)}
                      title={`Weight: ${entry.weight}g`}
                    />
                    <span className="cell-metric-tag">g</span>
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.kcal}
                      onChange={(e) => handleFieldChange(entry, 'kcal', e.target.value)}
                      title={`Calories: ${entry.kcal} Kcal`}
                    />
                    <span className="cell-metric-tag">Kcal</span>
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.protein}
                      onChange={(e) => handleFieldChange(entry, 'protein', e.target.value)}
                      title={`Protein: ${entry.protein}g`}
                    />
                    <span className="cell-metric-tag">g</span>
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.carbs}
                      onChange={(e) => handleFieldChange(entry, 'carbs', e.target.value)}
                      title={`Carbs: ${entry.carbs}g`}
                    />
                    <span className="cell-metric-tag">g</span>
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.fat}
                      onChange={(e) => handleFieldChange(entry, 'fat', e.target.value)}
                      title={`Fat: ${entry.fat}g`}
                    />
                    <span className="cell-metric-tag">g</span>
                  </td>
                  <td className="td-num">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      inputMode="decimal"
                      className="fitted-num-input"
                      value={entry.fibre}
                      onChange={(e) => handleFieldChange(entry, 'fibre', e.target.value)}
                      title={`Fibre: ${entry.fibre}g`}
                    />
                    <span className="cell-metric-tag">g</span>
                  </td>
                  <td className="td-act">
                    <div className="fitted-row-actions">
                      <button
                        type="button"
                        className="fitted-icon-btn delete-btn"
                        onClick={() => onDeleteEntry(entry.id)}
                        title="Delete food item"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Totals Row At End */}
            <tfoot>
              <tr className="fitted-totals-row">
                <td className="td-food total-label">Total</td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.weight * 10) / 10}</div>
                  <span className="cell-metric-tag">g</span>
                </td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.kcal)}</div>
                  <span className="cell-metric-tag">Kcal</span>
                </td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.protein * 10) / 10}</div>
                  <span className="cell-metric-tag">g</span>
                </td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.carbs * 10) / 10}</div>
                  <span className="cell-metric-tag">g</span>
                </td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.fat * 10) / 10}</div>
                  <span className="cell-metric-tag">g</span>
                </td>
                <td className="td-num total-val">
                  <div>{Math.round(totals.fibre * 10) / 10}</div>
                  <span className="cell-metric-tag">g</span>
                </td>
                <td className="td-act"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

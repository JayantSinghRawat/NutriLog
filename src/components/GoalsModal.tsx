import React, { useState } from 'react';
import { X, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DailyGoals } from '../types/nutrition.js';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalsModal({ isOpen, onClose }: GoalsModalProps) {
  const { user, updateGoals } = useAuth();
  const currentGoals = user?.dailyGoals || {
    kcal: 2200,
    protein: 150,
    carbs: 220,
    fat: 65,
    fibre: 32,
  };

  const [formData, setFormData] = useState<DailyGoals>(currentGoals);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGoals({
      kcal: parseFloat(String(formData.kcal)) || 2000,
      protein: parseFloat(String(formData.protein)) || 120,
      carbs: parseFloat(String(formData.carbs)) || 200,
      fat: parseFloat(String(formData.fat)) || 60,
      fibre: parseFloat(String(formData.fibre)) || 30,
    });
    onClose();
  };

  const applyPreset = (preset: 'cut' | 'bulk' | 'maintenance') => {
    if (preset === 'cut') {
      setFormData({ kcal: 1800, protein: 160, carbs: 160, fat: 50, fibre: 30 });
    } else if (preset === 'bulk') {
      setFormData({ kcal: 2600, protein: 170, carbs: 320, fat: 75, fibre: 35 });
    } else if (preset === 'maintenance') {
      setFormData({ kcal: 2200, protein: 140, carbs: 240, fat: 65, fibre: 32 });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} />
            <h3 className="modal-title">Daily Nutrition Targets</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => applyPreset('cut')}
              >
                <Zap size={12} style={{ marginRight: 4 }} /> Cut / Fat Loss
              </button>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => applyPreset('maintenance')}
              >
                Maintenance
              </button>
              <button
                type="button"
                className="suggestion-chip"
                onClick={() => applyPreset('bulk')}
              >
                Muscle Gain / Bulk
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                Target Calories (Kcal)
              </label>
              <input
                type="number"
                className="form-input"
                value={formData.kcal}
                onChange={(e) => setFormData({ ...formData, kcal: Number(e.target.value) })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">
                  Protein (g)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fat (g)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fibre (g)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.fibre}
                  onChange={(e) => setFormData({ ...formData, fibre: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Targets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

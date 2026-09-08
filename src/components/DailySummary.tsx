import React from 'react';
import { Flame, Dumbbell, Wheat, Droplets, Leaf, Target, Edit3 } from 'lucide-react';
import { NutrientTotals } from '../types/nutrition.js';
import { useAuth } from '../context/AuthContext.js';

interface DailySummaryProps {
  totals: NutrientTotals;
  onOpenGoals?: () => void;
}

export function DailySummary({ totals, onOpenGoals }: DailySummaryProps) {
  const { user } = useAuth();
  const goals = user?.dailyGoals || {
    kcal: 2200,
    protein: 150,
    carbs: 220,
    fat: 65,
    fibre: 32,
  };

  const getPercent = (curr: number, target: number) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((curr / target) * 100), 100);
  };

  const stats = [
    {
      key: 'kcal',
      name: 'Calories',
      shortName: 'Calories',
      curr: Math.round(totals.kcal),
      target: goals.kcal,
      unit: 'kcal',
      icon: Flame,
      percent: getPercent(totals.kcal, goals.kcal),
    },
    {
      key: 'protein',
      name: 'Protein',
      shortName: 'Protein',
      curr: Math.round(totals.protein * 10) / 10,
      target: goals.protein,
      unit: 'g',
      icon: Dumbbell,
      percent: getPercent(totals.protein, goals.protein),
    },
    {
      key: 'carbs',
      name: 'Carbs',
      shortName: 'Carbs',
      curr: Math.round(totals.carbs * 10) / 10,
      target: goals.carbs,
      unit: 'g',
      icon: Wheat,
      percent: getPercent(totals.carbs, goals.carbs),
    },
    {
      key: 'fat',
      name: 'Fat',
      shortName: 'Fat',
      curr: Math.round(totals.fat * 10) / 10,
      target: goals.fat,
      unit: 'g',
      icon: Droplets,
      percent: getPercent(totals.fat, goals.fat),
    },
    {
      key: 'fibre',
      name: 'Fibre',
      shortName: 'Fibre',
      curr: Math.round(totals.fibre * 10) / 10,
      target: goals.fibre,
      unit: 'g',
      icon: Leaf,
      percent: getPercent(totals.fibre, goals.fibre),
    },
  ];

  return (
    <div className="summary-wrapper">
      {/* DESKTOP VIEW: Traditional Macro Cards Grid */}
      <div className="desktop-summary-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="macro-card">
              <div className="macro-header">
                <div className="macro-title-group">
                  <div className="macro-icon">
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <span className="macro-name">{stat.name}</span>
                </div>
                <span className="macro-percentage">{stat.percent}%</span>
              </div>

              <div className="macro-values">
                <span className="macro-current">{stat.curr}</span>
                <span className="macro-target">/ {stat.target}</span>
                <span className="macro-unit">{stat.unit}</span>
              </div>

              <div className="macro-bar-track">
                <div className="macro-bar-fill" style={{ width: `${stat.percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE VIEW: Ultra-compact, short minimal size bar below table */}
      <div
        className="mobile-compact-goals"
        onClick={onOpenGoals}
        role="button"
        tabIndex={0}
        title="Tap to edit daily macro targets"
      >
        <div className="compact-goals-strip">
          {stats.map((stat) => (
            <div key={stat.key} className="compact-goal-item">
              <div className="compact-goal-top">
                <span className="compact-goal-label">
                  {stat.shortName}
                  <span className="compact-metric-sub">({stat.unit === 'kcal' ? 'Kcal' : stat.unit})</span>
                </span>
                <span className="compact-goal-pct">{stat.percent}%</span>
              </div>
              <div className="compact-goal-values">
                <span className="compact-curr">{stat.curr}</span>
                <span className="compact-slash">/</span>
                <span className="compact-target">{stat.target}</span>
              </div>
              <div className="compact-bar-track">
                <div className="compact-bar-fill" style={{ width: `${stat.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

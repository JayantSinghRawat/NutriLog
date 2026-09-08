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

      {/* MOBILE VIEW: Clean, uncluttered 2-section layout with no overlapping text */}
      <div
        className="mobile-compact-goals"
        onClick={onOpenGoals}
        role="button"
        tabIndex={0}
        title="Tap to edit daily macro targets"
      >
        <div className="mobile-goals-card">
          {/* Row 1: Calories Hero */}
          <div className="mobile-cal-row">
            <div className="mobile-cal-info">
              <span className="mobile-cal-label">Calories</span>
              <div className="mobile-cal-numbers">
                <span className="mobile-cal-curr">{stats[0].curr}</span>
                <span className="mobile-cal-target">/ {stats[0].target} kcal</span>
                <span className="mobile-cal-pct">({stats[0].percent}%)</span>
              </div>
            </div>
            <div className="mobile-bar-track">
              <div className="mobile-bar-fill" style={{ width: `${stats[0].percent}%` }} />
            </div>
          </div>

          {/* Row 2: 4 Core Macros (Protein, Carbs, Fat, Fibre) */}
          <div className="mobile-macros-grid">
            {stats.slice(1).map((stat) => (
              <div key={stat.key} className="mobile-macro-item">
                <div className="mobile-macro-header">
                  <span className="mobile-macro-name">{stat.shortName}</span>
                  <span className="mobile-macro-pct">{stat.percent}%</span>
                </div>
                <div className="mobile-macro-vals">
                  <span className="mobile-macro-curr">{stat.curr}</span>
                  <span className="mobile-macro-target">/{stat.target}g</span>
                </div>
                <div className="mobile-bar-track">
                  <div className="mobile-bar-fill" style={{ width: `${stat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Flame, Dumbbell, Wheat, Droplets, Leaf } from 'lucide-react';
import { NutrientTotals } from '../types/nutrition.js';
import { useAuth } from '../context/AuthContext.js';

interface DailySummaryProps {
  totals: NutrientTotals;
}

export function DailySummary({ totals }: DailySummaryProps) {
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
      curr: Math.round(totals.kcal),
      target: goals.kcal,
      unit: 'kcal',
      icon: Flame,
      percent: getPercent(totals.kcal, goals.kcal),
    },
    {
      key: 'protein',
      name: 'Protein',
      curr: Math.round(totals.protein * 10) / 10,
      target: goals.protein,
      unit: 'g',
      icon: Dumbbell,
      percent: getPercent(totals.protein, goals.protein),
    },
    {
      key: 'carbs',
      name: 'Carbs',
      curr: Math.round(totals.carbs * 10) / 10,
      target: goals.carbs,
      unit: 'g',
      icon: Wheat,
      percent: getPercent(totals.carbs, goals.carbs),
    },
    {
      key: 'fat',
      name: 'Fat',
      curr: Math.round(totals.fat * 10) / 10,
      target: goals.fat,
      unit: 'g',
      icon: Droplets,
      percent: getPercent(totals.fat, goals.fat),
    },
    {
      key: 'fibre',
      name: 'Fibre',
      curr: Math.round(totals.fibre * 10) / 10,
      target: goals.fibre,
      unit: 'g',
      icon: Leaf,
      percent: getPercent(totals.fibre, goals.fibre),
    },
  ];

  return (
    <div className="summary-container">
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
              <span className="macro-percentage">
                {stat.percent}%
              </span>
            </div>

            <div className="macro-values">
              <span className="macro-current">{stat.curr}</span>
              <span className="macro-target">/ {stat.target}</span>
              <span className="macro-unit">{stat.unit}</span>
            </div>

            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{ width: `${stat.percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: number; isPositive: boolean };
  subtitle?: string;
  bg?: string;
};

export function StatCard({ title, value, icon, trend, subtitle, bg = "bg-blue-50" }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 card-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${bg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

import dayjs from 'dayjs';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

export function formatDateRange(startDate?: Date | null, endDate?: Date | null): string {
  if (!startDate || !endDate) return '';

  const start = dayjs(startDate);
  const end = dayjs(endDate);

  // Check if it's a valid full month range
  if (
    start.isSame(start.startOf('month'), 'day') &&
    end.isSame(end.endOf('month'), 'day') &&
    start.isSame(end, 'month')
  ) {
    return `${start.format('MMM')} ${start.year()}`;
  }

  // Same year, same month: "1 - 15"
  if (start.isSame(end, 'month') && start.isSame(end, 'year')) {
    return `${start.format('D')} - ${end.format('D')}`;
  }

  // Same year, different months: "1/1 - 30/2"
  if (start.isSame(end, 'year')) {
    return `${start.format('D/M')} - ${end.format('D/M')}`;
  }

  // Different years: "1/1/2025 - 30/2/2026"
  return `${start.format('D/M/YYYY')} - ${end.format('D/M/YYYY')}`;
}

type ChangeType = 'income' | 'expense' | 'balance';

export function resolveChangeUI(change: number, type: ChangeType) {
  if (!change || change === 0) {
    return {
      text: '—',
      Icon: Wallet,
      color: 'text-base-content/50',
      bgColor: 'bg-base-200',
    };
  }

  const isIncrease = change > 0;

  const isPositive = type === 'expense' ? !isIncrease : isIncrease;

  return {
    text: `${Math.abs(change * 100).toFixed(1)}%`,
    Icon: isIncrease ? TrendingUp : TrendingDown,
    color: isPositive ? 'text-success' : 'text-error',
    bgColor: isPositive ? 'bg-success/10' : 'bg-error/10',
  };
}

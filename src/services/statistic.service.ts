import dayjs from 'dayjs';

import { StatisticOverview, StatisticOverviewQuery, StatisticTimeUnitEnum } from '@/common/types/statistic.type';
import { db } from '@/database';
import { ExpenseTypeEnum } from '@/database/types/tables/expenses';

export const statisticService = new (class StatisticService {
  async overview(query?: StatisticOverviewQuery): Promise<StatisticOverview> {
    const { timeUnit, startDate, endDate, categoryIds } = query || {};

    const data = await this.getExpenses(startDate, endDate, categoryIds);

    const expenses = data.filter((item) => item.type === ExpenseTypeEnum.Expense);
    const incomes = data.filter((item) => item.type === ExpenseTypeEnum.Income);

    const expenseStats = this.calcStat(expenses);
    const incomeStats = this.calcStat(incomes);

    const categoryDistribution = this.getCategoryDistribution(expenses, expenseStats.total);
    const cashFlow = this.getCashFlow(timeUnit, data);

    const {
      income: prevIncome,
      expense: prevExpense,
      balance: prevBalance,
    } = (await this.getPrevSummary(query)) || {};

    return {
      summary: {
        balance: {
          total: incomeStats.total - expenseStats.total,
          change: this.calcChange(incomeStats.total - expenseStats.total, prevBalance ? prevBalance.total : 0),
        },
        expense: {
          ...expenseStats,
          change: prevExpense ? this.calcChange(expenseStats.total, prevExpense.total) : 0,
        },
        income: {
          ...incomeStats,
          change: prevIncome ? this.calcChange(incomeStats.total, prevIncome.total) : 0,
        },
      },
      categoryDistribution,
      cashFlow,
      period: { startDate, endDate, timeUnit },
    };
  }

  private async getExpenses(startDate?: string, endDate?: string, categoryIds?: number[]) {
    let builder = db
      .selectFrom('expenses')
      .innerJoin('categories', 'categories.id', 'expenses.categoryId')
      .selectAll('expenses')
      .select('categories.name as categoryName');
    if (startDate) builder = builder.where('expenses.date', '>=', startDate);
    if (endDate) builder = builder.where('expenses.date', '<=', endDate);
    if (categoryIds && categoryIds.length > 0) {
      builder = builder.where('expenses.categoryId', 'in', categoryIds);
    }
    return await builder.execute();
  }

  private calcStat(items: { amount: number }[]) {
    if (items.length === 0) {
      return { count: 0, total: 0, average: 0, max: 0, min: 0 };
    }

    const amounts = items.map((i) => i.amount);
    const total = amounts.reduce((a, b) => a + b, 0);

    return {
      count: items.length,
      total,
      average: total / amounts.length,
      max: Math.max(...amounts),
      min: Math.min(...amounts),
    };
  }

  private calcChange(current: number, previous: number) {
    if (!previous || previous === 0) return 0;
    return (current - previous) / previous;
  }

  private getCategoryDistribution(
    expenses: { categoryId: number; categoryName: string; amount: number }[],
    totalAmount: number,
  ) {
    const distributionMap = new Map<number, { name: string; amount: number }>();

    for (const item of expenses) {
      const prev = distributionMap.get(item.categoryId) ?? { name: item.categoryName, amount: 0 };
      prev.amount += item.amount;
      distributionMap.set(item.categoryId, prev);
    }

    const result = Array.from(distributionMap.entries()).map(([id, { name, amount }]) => ({
      id,
      name,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
    }));

    return result;
  }

  private getCashFlow(timeUnit?: string, data: { date: string; type: ExpenseTypeEnum; amount: number }[] = []) {
    if (data.length === 0 || !timeUnit) {
      return [];
    }

    const groupedData = new Map<string, { income: number; expense: number }>();

    // Group data by time unit
    for (const item of data) {
      const date = dayjs(item.date);
      let key: string;

      switch (timeUnit.toLowerCase()) {
        case StatisticTimeUnitEnum.Day:
          key = date.format('YYYY-MM-DD');
          break;
        case StatisticTimeUnitEnum.Week:
          key = date.format('YYYY-[W]WW');
          break;
        case StatisticTimeUnitEnum.Month:
          key = date.format('YYYY-MM');
          break;
        case StatisticTimeUnitEnum.Year:
          key = date.format('YYYY');
          break;
        default:
          key = date.format('YYYY-MM-DD');
      }

      const existing = groupedData.get(key) ?? { income: 0, expense: 0 };

      if (item.type === ExpenseTypeEnum.Income) {
        existing.income += item.amount;
      } else if (item.type === ExpenseTypeEnum.Expense) {
        existing.expense += item.amount;
      }

      groupedData.set(key, existing);
    }

    // Convert to array and sort by key
    const result = Array.from(groupedData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, { income, expense }]) => {
        let label: string;
        const date = dayjs(key.includes('-W') ? key.replace('-W', '-') : key);

        switch (timeUnit.toLowerCase()) {
          case StatisticTimeUnitEnum.Day:
            label = date.format('DD/MM/YYYY');
            break;
          case StatisticTimeUnitEnum.Week: {
            const weekStart = date.startOf('week');
            const weekEnd = date.endOf('week');
            label = `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;
            break;
          }
          case StatisticTimeUnitEnum.Month:
            label = date.format('MM/YYYY');
            break;
          case StatisticTimeUnitEnum.Year:
            label = date.format('YYYY');
            break;
          default:
            label = date.format('DD/MM/YYYY');
        }

        return {
          date: label,
          income: Math.round(income * 100) / 100,
          expense: Math.round(expense * 100) / 100,
          balance: Math.round((income - expense) * 100) / 100,
        };
      });

    return result;
  }

  private async getPrevSummary(query?: StatisticOverviewQuery) {
    const { startDate, endDate, categoryIds } = query || {};

    if (!startDate || !endDate) return null;

    const diffDays = endDate && startDate ? dayjs(endDate).diff(dayjs(startDate), 'day') + 1 : 0;
    const prevStartDate = dayjs(startDate).subtract(diffDays, 'day').format('YYYY-MM-DD');
    const prevEndDate = dayjs(endDate).subtract(diffDays, 'day').format('YYYY-MM-DD');

    const data = await this.getExpenses(prevStartDate, prevEndDate, categoryIds);

    const expenses = data.filter((item) => item.type === ExpenseTypeEnum.Expense);
    const incomes = data.filter((item) => item.type === ExpenseTypeEnum.Income);

    const expenseStats = this.calcStat(expenses);
    const incomeStats = this.calcStat(incomes);

    return {
      expense: { total: expenseStats.total },
      income: { total: incomeStats.total },
      balance: { total: incomeStats.total - expenseStats.total },
    };
  }
})();

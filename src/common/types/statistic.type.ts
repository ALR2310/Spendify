type TransactionStats = {
  count: number;
  total: number;
  change: number;
  average: number;
  max: number;
  min: number;
};

type CategoryDistribution = {
  id: number;
  name: string;
  amount: number;
  percentage: number;
};

export enum StatisticTimeUnitEnum {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export type StatisticOverviewQuery = {
  timeUnit?: StatisticTimeUnitEnum;
  startDate?: string;
  endDate?: string;
  categoryIds?: number[];
};

export type StatisticOverview = {
  summary: {
    balance: {
      total: number;
      change: number;
    };
    expense: TransactionStats;
    income: TransactionStats;
  };
  categoryDistribution: CategoryDistribution[];
  cashFlow: {
    date: string;
    income: number;
    expense: number;
    balance: number;
  }[];
  period: {
    startDate?: string;
    endDate?: string;
    timeUnit?: StatisticTimeUnitEnum;
  };
};

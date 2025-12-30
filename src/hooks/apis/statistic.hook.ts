import { useQuery } from 'react-query';

import { StatisticOverviewQuery } from '@/common/types/statistic.type';
import { statisticService } from '@/services/statistic.service';

export function useStatisticOverview(query?: StatisticOverviewQuery) {
  return useQuery({
    queryKey: ['statistic', 'overview', query],
    queryFn: () => statisticService.overview(query),
  });
}

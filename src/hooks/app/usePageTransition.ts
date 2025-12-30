import { ROUTES } from '@/common/constants/routes.const';

const routeOrder: Record<string, number> = {
  [ROUTES.EXPENSES]: 0,
  [ROUTES.STATISTICS]: 1,
  [ROUTES.NOTES]: 2,
  [ROUTES.SETTINGS]: 3,
};

let prevPath: string | null = null;

export const getPageDirection = (currentPath: string): number => {
  if (prevPath === null) {
    prevPath = currentPath;
    return 1;
  }

  const prevIndex = routeOrder[prevPath] ?? 0;
  const currentIndex = routeOrder[currentPath] ?? 0;

  prevPath = currentPath;

  if (currentIndex > prevIndex) return 1;
  else if (currentIndex < prevIndex) return -1;
  return 1;
};

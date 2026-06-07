export const HOME_BLOCK_LABELS = {
  top: "Сверху",
  best: "Лучшие",
  all: "Все проекты",
} as const;

export const BEST_BLOCK_LIMIT = 4;
export const ALL_PARTNERS_INITIAL = 4;

export type LayoutPartnerFlags = {
  id: string;
  sortOrder: number;
  inTopStrip: boolean;
  inBestBlock: boolean;
  topSortOrder: number;
  bestSortOrder: number;
};

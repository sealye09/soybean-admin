import colorJson from './color.json';

interface TraditionColorDetail {
  label: string;
  color: string;
}
interface TraditionColor {
  label: string;
  data: TraditionColorDetail[];
}

/** 中国传统颜色 */
export const traditionColors = colorJson as TraditionColor[];

export function isInTraditionColors(color: string) {
  return traditionColors.some((item) => {
    const flag = item.data.some(v => v.color === color);
    return flag;
  });
}

export const colors = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#0ea5e9',
  '#06b6d4',
  '#f43f5e',
  '#ef4444',
  '#ec4899',
  '#d946ef',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
];

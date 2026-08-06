import type { MealPlanEntry, MealSlot } from '@/types';

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function startOfWeek(key: string): string {
  const date = fromDateKey(key);
  const weekday = date.getDay();
  date.setDate(date.getDate() + (weekday === 0 ? -6 : 1 - weekday));
  return toDateKey(date);
}

export function weekDateKeys(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function formatWeekRange(weekStart: string): string {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(addDays(weekStart, 6));
  const startText = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(start);
  const endText = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(end);
  return `${startText} - ${endText}`;
}

export function formatDayLabel(key: string): { weekday: string; day: string; isToday: boolean } {
  const date = fromDateKey(key);
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
    day: String(date.getDate()),
    isToday: key === todayKey(),
  };
}

export function entryMatchesDateRange(entry: MealPlanEntry, startDate: string, endDate: string): boolean {
  return Boolean(entry.date && entry.date >= startDate && entry.date <= endDate);
}

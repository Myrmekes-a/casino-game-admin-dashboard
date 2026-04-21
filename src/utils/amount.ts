/** Platform stores amounts as value × 1000. Use this for display only. */
const STORED_MULTIPLIER = 1000;

export function displayAmount(value: number | undefined | null): number {
  const n = value ?? 0;
  return n / STORED_MULTIPLIER;
}

/** Display value with locale formatting (e.g. 1000.5) */
export function formatAmount(value: number | undefined | null): string {
  return displayAmount(value).toLocaleString();
}

/** Convert displayed value back to stored value (e.g. when saving balance) */
export function toStoredAmount(displayValue: number): number {
  return Math.round(displayValue * STORED_MULTIPLIER);
}

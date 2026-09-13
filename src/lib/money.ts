/**
 * Money handling for ONETRAVEL.
 *
 * Per architecture.md: money is stored as an integer number of centavos
 * (the smallest PHP unit) to avoid floating-point errors. ₱100.50 -> 10050.
 * Display formatting happens only at the edge, via Intl.NumberFormat.
 */

const phpFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const phpFormatterPrecise = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format centavos as ₱ with no decimals (default for large display numbers). */
export function formatPeso(centavos: number): string {
  return phpFormatter.format(centavos / 100);
}

/** Format centavos as ₱ with two decimals (for precise ledger values). */
export function formatPesoPrecise(centavos: number): string {
  return phpFormatterPrecise.format(centavos / 100);
}

/** Split a total into n equal shares in centavos, distributing the remainder. */
export function equalSplit(totalCentavos: number, members: number): number[] {
  if (members <= 0) return [];
  const base = Math.floor(totalCentavos / members);
  const remainder = totalCentavos - base * members;
  return Array.from({ length: members }, (_, i) =>
    i < remainder ? base + 1 : base,
  );
}

/** Percentage of target funded, clamped 0–100, rounded to a whole number. */
export function fundingPercent(raised: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((raised / target) * 100)));
}


export type CostType = "fixed" | "per_person" | "quantity";

/**
 * Compute an estimated amount (centavos) from a cost type.
 * - fixed: a single group amount entered directly
 * - per_person / quantity: unit price times a count (participants or units)
 */
export function computeEstimatedCentavos(
  costType: CostType,
  input: { amount?: number; unitPriceCentavos?: number; quantity?: number },
): number {
  if (costType === "fixed") {
    return Math.max(0, Math.round(input.amount ?? 0));
  }
  const unit = Math.max(0, Math.round(input.unitPriceCentavos ?? 0));
  const qty = Math.max(0, Math.round(input.quantity ?? 0));
  return unit * qty;
}

import { differenceInDays, addDays } from 'date-fns';

export interface CycleSample {
  period_start_date: string; // yyyy-MM-dd
  cycle_length_days?: number | null;
}

export interface PredictionResult {
  nextPeriodStart: Date;
  nextPeriodEnd: Date; // window end
  fertileStart?: Date;
  fertileEnd?: Date;
  averageCycleLength: number;
  stdDevDays: number;
  confidence: 'low' | 'medium' | 'high';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeStats(lengths: number[]) {
  const n = lengths.length;
  const avg = lengths.reduce((s, v) => s + v, 0) / n;
  const variance = lengths.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / n;
  const sd = Math.sqrt(variance);
  return { average: Math.round(avg), sd };
}

export function weightedAverage(lengths: number[]) {
  // heavier weight on recent cycles
  const weights = lengths.map((_, i) => i + 1); // 1..n
  const denom = weights.reduce((s, w) => s + w, 0);
  const num = lengths.reduce((s, v, i) => s + v * weights[i], 0);
  return Math.round(num / denom);
}

export function predictNextPeriod(
  cycles: CycleSample[],
  options?: { lutealDays?: number | null; useWeighted?: boolean }
): PredictionResult | null {
  if (!cycles || cycles.length < 1) return null;
  const valid = cycles
    .filter((c) => typeof c.cycle_length_days === 'number' && (c.cycle_length_days as number) > 0)
    .map((c) => c.cycle_length_days as number);

  if (valid.length === 0) return null;

  // Compute variability and choose average
  const { sd } = computeStats(valid);
  const avg = options?.useWeighted ? weightedAverage(valid.slice().reverse()) : Math.round(valid.reduce((s, v) => s + v, 0) / valid.length);

  // Base window width grows with variability (min 2, max 6 days)
  const halfWindow = clamp(Math.round(Math.max(2, Math.min(6, sd))), 2, 6);

  const lastStart = new Date(cycles[0].period_start_date);
  const nominal = addDays(lastStart, avg);
  const windowStart = addDays(nominal, -halfWindow);
  const windowEnd = addDays(nominal, halfWindow);

  // Fertile window if luteal length provided: ovulation ~ next period - luteal
  let fertileStart: Date | undefined;
  let fertileEnd: Date | undefined;
  if (options?.lutealDays && options.lutealDays > 0) {
    const ovulation = addDays(nominal, -(options.lutealDays));
    fertileStart = addDays(ovulation, -2);
    fertileEnd = addDays(ovulation, 2);
  }

  // Confidence bands by SD and sample size
  const sampleSize = valid.length;
  let confidence: PredictionResult['confidence'] = 'medium';
  if (sd <= 2 && sampleSize >= 6) confidence = 'high';
  if (sd >= 6 || sampleSize < 3) confidence = 'low';

  return {
    nextPeriodStart: windowStart,
    nextPeriodEnd: windowEnd,
    fertileStart,
    fertileEnd,
    averageCycleLength: avg,
    stdDevDays: Math.round(sd),
    confidence,
  };
}



/**
 * BMI Calculator Utility
 * Formula: BMI = weight (kg) / height (m)²
 */

export interface BMIResult {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
  color: string;
  description: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const roundedBMI = Math.round(bmi * 10) / 10;

  if (roundedBMI < 18.5) {
    return {
      value: roundedBMI,
      category: 'underweight',
      label: 'Underweight',
      color: '#82aaff', // Blue
      description: 'Below healthy weight range',
    };
  } else if (roundedBMI < 25) {
    return {
      value: roundedBMI,
      category: 'normal',
      label: 'Normal',
      color: '#addb67', // Green
      description: 'Healthy weight range',
    };
  } else if (roundedBMI < 30) {
    return {
      value: roundedBMI,
      category: 'overweight',
      label: 'Overweight',
      color: '#ffcb6b', // Yellow/Orange
      description: 'Above healthy weight range',
    };
  } else {
    return {
      value: roundedBMI,
      category: 'obese',
      label: 'Obese',
      color: '#ff5874', // Red
      description: 'Significantly above healthy range',
    };
  }
}

export function getBMIRangePosition(bmi: number): number {
  // Returns percentage position on a scale from 15 to 40
  const min = 15;
  const max = 40;
  const clamped = Math.max(min, Math.min(max, bmi));
  return ((clamped - min) / (max - min)) * 100;
}

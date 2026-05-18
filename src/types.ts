/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PropertyData {
  sqft: number;
  beds: number;
  baths: number;
  age: number;
  neighborhood: string;
  zoningType: string;
}

export interface ValueDriver {
  feature: string;
  impact: number; // Percentage or absolute value impact
  type: 'positive' | 'negative';
  description: string;
}

export interface ValuationResult {
  estimatedValue: number;
  confidenceScore: number;
  isHeuristic: boolean;
  drivers: ValueDriver[];
  neighborhoodAnalysis: string;
  marketTrendData: { month: string; value: number }[];
}

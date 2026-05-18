/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PropertyData, ValuationResult } from "../types";

export async function getValuation(data: PropertyData): Promise<ValuationResult> {
  try {
    const response = await fetch("/api/valuation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate valuation");
    }

    return await response.json();
  } catch (error) {
    console.error("Valuation Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate valuation. Please try again.");
  }
}

export async function generatePropertyImage(data: PropertyData): Promise<string | null> {
  try {
    const response = await fetch("/api/property-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.image;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Predefined neighborhood data for Bangalore
// Price per SqFt, Market demand (0-1), and Growth Rate
const NEIGHBORHOOD_DATA: Record<string, { baseRate: number; demand: number; growth: number }> = {
  'Indiranagar': { baseRate: 18500, demand: 0.95, growth: 0.08 },
  'Whitefield': { baseRate: 8800, demand: 0.90, growth: 0.12 },
  'Koramangala': { baseRate: 15500, demand: 0.92, growth: 0.07 },
  'HSR Layout': { baseRate: 10500, demand: 0.88, growth: 0.10 },
  'Jayanagar': { baseRate: 16500, demand: 0.85, growth: 0.05 },
  'Electronic City': { baseRate: 6200, demand: 0.75, growth: 0.09 },
  'Sarjapur Road': { baseRate: 7800, demand: 0.82, growth: 0.15 },
  'Hebbal': { baseRate: 9500, demand: 0.78, growth: 0.11 },
  'JP Nagar': { baseRate: 11500, demand: 0.80, growth: 0.06 },
  'Bannerghatta Road': { baseRate: 8200, demand: 0.70, growth: 0.08 },
  'Frazer Town': { baseRate: 14000, demand: 0.80, growth: 0.04 },
  'Malleshwaram': { baseRate: 17000, demand: 0.85, growth: 0.03 },
  'Yelahanka': { baseRate: 7000, demand: 0.65, growth: 0.14 },
};

function calculateHeuristicValuation(data: any) {
  const areaData = NEIGHBORHOOD_DATA[data.neighborhood] || { baseRate: 8000, demand: 0.7, growth: 0.08 };
  
  // Base Price Calculation
  let baseValue = data.sqft * areaData.baseRate;

  // Feature Engineering (Simulated weights)
  const bedPremium = 650000; // 6.5L per bedroom
  const bathPremium = 250000; // 2.5L per bathroom
  const zoningMultiplier = data.zoningType === 'Commercial' ? 1.4 : 1.0;

  let estimatedValue = (baseValue + (data.beds * bedPremium) + (data.baths * bathPremium)) * zoningMultiplier;
  
  // Age Depreciation (Strict Linear Decay with floor)
  const ageImpact = Math.max(0.65, 1 - (data.age * 0.015)); 
  estimatedValue *= ageImpact;

  // Final Rounding for market realism
  estimatedValue = Math.round(estimatedValue / 5000) * 5000;

  return {
    estimatedValue: estimatedValue,
    confidenceScore: 72,
    isHeuristic: true,
    neighborhoodAnalysis: `Fallback Core engaged. This high-speed valuation uses pre-computed indices for ${data.neighborhood}. The area shows a ${areaData.growth * 100}% annual appreciation rate with a demand index of ${areaData.demand}.`,
    drivers: [
      { 
        feature: "Location Index", 
        impact: Math.round(areaData.demand * 100), 
        type: "positive", 
        description: `High proximity value for ${data.neighborhood} tech/lifestyle corridor.` 
      },
      { 
        feature: "Configuration", 
        impact: 12, 
        type: "positive", 
        description: `Utility value for ${data.beds}BHK / ${data.baths} Bath layout.` 
      },
      { 
        feature: "Structure Age", 
        impact: Math.round((1 - ageImpact) * 100), 
        type: data.age > 10 ? "negative" : "positive", 
        description: data.age > 10 ? `Depreciation for ${data.age} year old construction.` : "Modern construction premium applied."
      }
    ],
    marketTrendData: Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      value: Math.round(estimatedValue * (0.94 + (i * 0.012)))
    }))
  };
}

// API Routes
app.post("/api/valuation", async (req, res) => {
  const data = req.body;
  
  const prompt = `
    Act as a professional real estate valuation engine specifically for Bangalore, India.
    Analyze the following property and provide a detailed valuation report in JSON format.

    Bangalore Context Guidelines:
    - Values MUST be in Indian Rupees (INR).
    - Consider proximity to tech parks (Electronic City, Manyata, Whitefield).
    - Account for Bangalore's specific traffic and transit impacts.
    - Neighborhood specific analysis for Bangalore sub-localities.

    Property Details:
    - Square Footage: ${data.sqft}
    - Bedrooms: ${data.beds}
    - Bathrooms: ${data.baths}
    - Property Age: ${data.age} years
    - Neighborhood: ${data.neighborhood}
    - Zoning Type: ${data.zoningType}

    Your response must be a single JSON object.
    "estimatedValue" and "marketTrendData" must be in INR.
    "drivers" should reflect how each feature influenced the price specifically in the Bangalore context.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["estimatedValue", "confidenceScore", "drivers", "neighborhoodAnalysis", "marketTrendData"],
          properties: {
            estimatedValue: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            neighborhoodAnalysis: { type: Type.STRING },
            drivers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["feature", "impact", "type", "description"],
                properties: {
                  feature: { type: Type.STRING },
                  impact: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["positive", "negative"] },
                  description: { type: Type.STRING }
                }
              }
            },
            marketTrendData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["month", "value"],
                properties: {
                  month: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ ...result, isHeuristic: false });
  } catch (error) {
    console.error("Valuation AI Error, triggering fallback:", error);
    res.json(calculateHeuristicValuation(data));
  }
});

app.post("/api/property-image", async (req, res) => {
  const data = req.body;
  const prompt = `A realistic, high-quality photograph of a home exterior in Bangalore India. 
    Style: ${data.zoningType === 'Residential' ? 'Modern Suburban' : 'Urban Loft'}. 
    Neighborhood: ${data.neighborhood}. 
    Details: ${data.beds} bedrooms, ${data.sqft} sqft, ${data.age > 20 ? 'Classic Traditional' : 'Contemporary'} architecture, beautiful landscaping, bright daylight.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    let imageData = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    res.json({ image: imageData });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    
    // Fallback to a high-quality placeholder image if quota is exceeded
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
      const fallbackImages = [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1000&auto=format&fit=crop"
      ];
      const randomIndex = Math.floor(Math.random() * fallbackImages.length);
      return res.json({ image: fallbackImages[randomIndex] });
    }
    
    res.status(500).json({ error: "Failed to generate image" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

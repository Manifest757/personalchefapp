/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, PantryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRecipesFromPantry(pantry: PantryItem[]): Promise<Partial<Recipe>[]> {
  const pantryList = pantry.map(item => `${item.amount} ${item.unit} of ${item.name}`).join(", ");
  
  const prompt = `You are a professional chef. Given the following pantry ingredients, suggest 3 creative healthy recipes that can be made primarily with these ingredients. 
  Pantry: ${pantryList}
  
  Return the recipes in JSON format matching the schema provided.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            desc: { type: Type.STRING },
            emoji: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  pricePerUnit: { type: Type.NUMBER }
                },
                required: ["name", "amount", "unit"]
              }
            },
            assembly: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            day: { type: Type.STRING, description: "Suggested day of the week, e.g. Mon" },
            slot: { type: Type.STRING, description: "Meal slot, e.g. Lunch or Dinner" }
          },
          required: ["name", "desc", "emoji", "ingredients", "assembly", "day", "slot"]
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}

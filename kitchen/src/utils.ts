/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient, Recipe, Prices } from './types';
import { PRESET_RECIPES } from './constants';

export function ingredientKey(ing: { name: string; unit: string }): string {
  return `${ing.name}|${ing.unit}`;
}

export function bestPriceForIngredient(ing: Ingredient, prices: Prices) {
  const key = ingredientKey(ing);
  const storePrices = prices[key] || {};
  const entries = Object.entries(storePrices).filter(([, v]) => v && v.price > 0);
  
  if (!entries.length) {
    return { price: ing.pricePerUnit, source: 'default', storeId: null };
  }
  
  let best = entries[0];
  for (const e of entries) {
    if (e[1].price < best[1].price) {
      best = e;
    }
  }
  
  return { price: best[1].price, source: 'store', storeId: best[0] };
}

export function calcRecipeCost(r: Recipe | undefined, prices: Prices): number {
  if (!r || !r.ingredients) return 0;
  return r.ingredients.reduce((s, ing) => {
    const best = bestPriceForIngredient(ing, prices);
    return s + (ing.amount || 0) * best.price;
  }, 0);
}

export function allRecipes(customRecipes: Recipe[]): Recipe[] {
  return [...PRESET_RECIPES, ...customRecipes];
}

export function findRecipe(id: string, customRecipes: Recipe[]): Recipe | undefined {
  return allRecipes(customRecipes).find((r) => r.id === id);
}

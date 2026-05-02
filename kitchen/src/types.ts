/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  pricePerUnit: number;
}

export interface Recipe {
  id: string;
  preset?: boolean;
  day: string;
  slot: string;
  name: string;
  desc: string;
  emoji: string;
  components?: string[];
  ingredients: Ingredient[];
  assembly?: string[];
  steps?: string[];
  utensils?: string[];
  batchSize?: number;
}

export interface Component {
  name: string;
  emoji: string;
  category: 'protein' | 'base' | 'side' | 'sauce' | 'pantry';
  yield: string;
  yieldCount?: number;
  ingredients: { name: string; amount: number; unit: string }[];
  steps: string[];
  storage?: string;
  utensils?: string[];
}

export interface PantryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  weeklyRate: number;
  colorIdx: number;
  meals: string[];
  notes: string;
}

export interface ChefInfo {
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

export interface Store {
  id: string;
  name: string;
  distance: string;
}

export interface PriceRecord {
  price: number;
  unit: string;
  updatedAt?: number;
}

export interface Prices {
  [ingredientKey: string]: {
    [storeId: string]: PriceRecord;
  };
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Client, Recipe, Prices, Store } from '../types';
import { ingredientKey, bestPriceForIngredient, findRecipe } from '../utils';

interface ShoppingProps {
  clients: Client[];
  customRecipes: Recipe[];
  prices: Prices;
  stores: Store[];
  shoppingDone: Record<string, boolean>;
  onToggleShop: (key: string) => void;
  onResetShopping: () => void;
  onOpenPriceEditor: (key: string) => void;
}

export const Shopping: React.FC<ShoppingProps> = ({ 
  clients, 
  customRecipes, 
  prices, 
  stores, 
  shoppingDone, 
  onToggleShop, 
  onResetShopping,
  onOpenPriceEditor
}) => {
  if (clients.length === 0) {
    return (
      <div className="card text-center py-9 px-5">
        <div className="text-4xl mb-2.5">🛒</div>
        <p className="text-sm text-[#777] mb-4 leading-relaxed">Add clients to generate a shopping list.</p>
      </div>
    );
  }

  const agg: Record<string, { name: string; unit: string; amount: number; defaultPrice: number }> = {};
  clients.forEach((c) => (c.meals || []).forEach((mid) => {
    const r = findRecipe(mid, customRecipes);
    if (!r) return;
    (r.ingredients || []).forEach((ing) => {
      if (ing.name === 'Overhead') return;
      const key = ingredientKey(ing);
      if (!agg[key]) agg[key] = { name: ing.name, unit: ing.unit, amount: 0, defaultPrice: ing.pricePerUnit };
      agg[key].amount += (ing.amount || 0) / (r.batchSize || 1);
    });
  }));

  const items = Object.entries(agg).sort((a, b) => a[1].name.localeCompare(b[1].name));
  const checkedCount = items.filter(([k]) => shoppingDone[k]).length;
  const noStores = stores.length === 0;

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {noStores && (
        <div className="card glass border-brand-ink/5 p-8 relative overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000">
             <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10">
            <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:scale-110 transition-transform text-brand-ink">
              <StoreIcon />
            </div>
            <p className="text-[10px] text-brand-ink/50 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[85%]">
              💡 Curating local markets in <b className="text-brand-ink">Folio → Markets</b> will unlock price optimization and provision sourcing.
            </p>
          </div>
        </div>
      )}

      <div className="card border-none shadow-xl p-10 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
           <img src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-2xl heading-serif text-brand-ink">Provisions Procurement</h2>
              <div className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-[0.2em] mt-1">{checkedCount} of {items.length} items acquired</div>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30 hover:text-brand-ink" onClick={onResetShopping}>Abort Mission</button>
          </div>
          <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-sage transition-all duration-1000 ease-out" 
              style={{ width: `${items.length ? (checkedCount / items.length * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6 ml-2">
           <div className="h-px flex-1 bg-brand-ink/5"></div>
           <span className="text-[10px] text-brand-ink/30 uppercase tracking-[0.4em] font-bold">Consolidated Market List</span>
           <div className="h-px flex-1 bg-brand-ink/5"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {items.map(([key, v]) => {
            const done = shoppingDone[key];
            const storePrices = prices[key] || {};
            const best = bestPriceForIngredient(v as any, prices);
            const lineCost = v.amount * best.price;

            return (
              <div 
                key={key} 
                className={`card !p-0 transition-all duration-500 overflow-hidden border border-brand-ink/5 ${done ? 'opacity-40 grayscale-[0.5]' : 'shadow-lg hover:shadow-xl'}`}
                onClick={() => onToggleShop(key)}
              >
                <div className="flex items-center gap-6 p-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border-2 ${done ? 'bg-brand-ink border-brand-ink text-white' : 'bg-transparent border-brand-ink/10 text-brand-ink/20'}`}>
                    {done ? <CheckIcon /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-ink/40" />}
                  </div>
                  
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-sage/10 border border-brand-ink/5 shrink-0 relative flex items-center justify-center">
                    <span className="text-2xl opacity-20 select-none">🛒</span>
                    <img 
                      src={`https://loremflickr.com/160/160/${encodeURIComponent(v.name.replace(/[^a-zA-Z\s]/g, ''))},food/all`}
                      alt={v.name}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-4">
                      <div className={`text-xl heading-serif text-brand-ink truncate ${done ? 'line-through opacity-40' : ''}`}>{v.name}</div>
                      <div className="text-[10px] font-bold text-brand-copper bg-brand-copper/5 px-3 py-1 rounded-full border border-brand-copper/10">${lineCost.toFixed(2)}</div>
                    </div>
                    <div className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-widest mt-1.5">{v.amount.toFixed(v.amount % 1 === 0 ? 0 : 2)} {v.unit} required</div>
                    
                    {stores.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {stores.map(s => {
                          const p = storePrices[s.id];
                          const isBest = s.id === best.storeId && p?.price;
                          return (
                            <button 
                              key={s.id} 
                              className={`text-[8.5px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full transition-all border ${
                                isBest 
                                ? 'bg-brand-sage text-white border-brand-sage shadow-md' 
                                : 'bg-brand-bg border-brand-ink/5 text-brand-ink/40 hover:border-brand-ink/20'
                              }`}
                              onClick={(e) => { e.stopPropagation(); onOpenPriceEditor(key); }}
                            >
                              {s.name}: {p?.price ? `$${p.price.toFixed(2)}` : 'N/A'}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

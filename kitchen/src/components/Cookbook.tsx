/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Recipe, Store, Prices } from '../types';
import { PRESET_RECIPES, COMPONENTS } from '../constants';
import { calcRecipeCost, findRecipe } from '../utils';

interface CookbookProps {
  customRecipes: Recipe[];
  stores: Store[];
  prices: Prices;
  onOpenRecipeEditor: (id: string | null) => void;
  onDeleteRecipe: (id: string) => void;
  onOpenStoreEditor: (id: string | null) => void;
  onOpenPriceEditor: (key: string) => void;
}

export const Cookbook: React.FC<CookbookProps> = ({
  customRecipes,
  stores,
  prices,
  onOpenRecipeEditor,
  onDeleteRecipe,
  onOpenStoreEditor,
  onOpenPriceEditor
}) => {
  const [tab, setTab] = useState<'recipes' | 'stores' | 'prices' | 'components'>('recipes');
  const [filter, setFilter] = useState<'all' | 'preset' | 'custom'>('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);
  const [viewBatchSize, setViewBatchSize] = useState<Record<string, number>>({});

  const all = [...PRESET_RECIPES, ...customRecipes];
  const list = filter === 'preset' ? all.filter(r => r.preset) : filter === 'custom' ? all.filter(r => !r.preset) : all;

  const renderRecipes = () => {
    return (
      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 p-1 bg-brand-ink/5 rounded-full">
            {['all', 'preset', 'custom'].map((f) => (
              <button 
                key={f}
                className={`px-4 py-1.5 text-[9px] font-bold rounded-full transition-all uppercase tracking-widest ${filter === f ? 'bg-brand-bg text-brand-ink shadow-sm' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
                onClick={() => setFilter(f as any)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="btn-secondary !py-2 !px-4" onClick={() => onOpenRecipeEditor(null)}>
            <PlusIcon />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold">New Folio Entry</span>
          </button>
        </div>

        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
          const dayRecipes = list.filter(r => r.day === day);
          if (dayRecipes.length === 0) return null;
          return (
            <div key={day} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-brand-ink/5"></div>
                <div className="text-[10px] font-bold text-brand-ink/30 uppercase tracking-[0.4em]">{day}</div>
                <div className="h-px flex-1 bg-brand-ink/5"></div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {dayRecipes.map(r => (
                  <div key={r.id} className="card !p-0 overflow-hidden hover:shadow-xl transition-all duration-500 border border-brand-ink/5 relative group/recipe">
                    <div className="absolute inset-0 z-0 opacity-[0.03] group-hover/recipe:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                      <img 
                        src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&name=${encodeURIComponent(r.name)}`}
                        className="w-full h-full object-cover"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div 
                      className="flex items-center gap-6 p-6 cursor-pointer relative z-10"
                      onClick={() => setExpandedRecipe(expandedRecipe === r.id ? null : r.id)}
                    >
                      <div className="w-14 h-14 rounded-full bg-brand-bg flex items-center justify-center text-3xl border border-brand-ink/5 shrink-0">
                        {r.emoji || '🍽'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl heading-serif text-brand-ink truncate">{r.name}</h3>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${r.preset ? 'bg-brand-ink text-brand-bg' : 'bg-brand-sage/10 text-brand-sage'}`}>
                            {r.preset ? 'Classic' : 'Signature'}
                          </span>
                        </div>
                        <div className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2">
                           {r.slot} · <span className="text-brand-copper">${(calcRecipeCost(r, prices) / (r.batchSize || 1)).toFixed(2)} / plate</span>
                        </div>
                      </div>
                      <div className={`transition-transform duration-500 ${expandedRecipe === r.id ? 'rotate-180 opacity-100' : 'opacity-20'}`}>
                        <ChevronIcon />
                      </div>
                    </div>
                    {expandedRecipe === r.id && (() => {
                      const baseBatch = r.batchSize || 1;
                      const currentBatch = viewBatchSize[r.id] || baseBatch;
                      const multiplier = currentBatch / baseBatch;

                      return (
                        <div className="bg-brand-bg/20 p-8 pt-0 space-y-10 animate-fade-in">
                          <div className="editorial-border"></div>
                          
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            {r.desc ? (
                               <div className="border-l-4 border-brand-copper pl-6 py-1 flex-1 min-w-[240px]">
                                 <p className="text-sm font-serif italic text-brand-ink/70 leading-relaxed font-medium">{r.desc}</p>
                               </div>
                            ) : <div></div>}
                            
                            <div className="bg-brand-ink/5 p-3 rounded-2xl flex items-center gap-3 border border-brand-ink/5">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-ink/40 ml-1">Batch scale</span>
                              <div className="flex items-center gap-1 bg-brand-bg rounded-xl p-1 shadow-inner">
                                {[1, 2, 4, 8].map(size => (
                                  <button 
                                    key={size}
                                    onClick={() => setViewBatchSize({ ...viewBatchSize, [r.id]: size })}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${currentBatch === size ? 'bg-brand-ink text-brand-bg shadow-sm' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
                                  >
                                    {size}x
                                  </button>
                                ))}
                                <input 
                                  type="number"
                                  className="w-12 bg-transparent text-[10px] font-bold text-center outline-none border-l border-brand-ink/10 ml-1"
                                  value={currentBatch}
                                  onChange={e => setViewBatchSize({ ...viewBatchSize, [r.id]: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Provisions Summary ({currentBatch} plates)</h4>
                              <div className="space-y-4">
                                {(r.ingredients || []).map((ing, i) => (
                                  <div key={i} className="text-xs flex items-center justify-between border-b border-brand-ink/[0.03] pb-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-sage/10 border border-brand-ink/5 shrink-0 relative flex items-center justify-center">
                                        <span className="text-xs opacity-20 select-none">🌿</span>
                                        <img 
                                          src={`https://loremflickr.com/80/80/${encodeURIComponent(ing.name.replace(/[^a-zA-Z\s]/g, ''))},food/all`}
                                          alt={ing.name}
                                          className="absolute inset-0 w-full h-full object-cover z-10"
                                          onError={(e) => (e.currentTarget.style.display = 'none')}
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                      <span className="text-brand-ink/60 font-medium truncate">{ing.name}</span>
                                    </div>
                                    <span className="font-serif italic font-bold text-brand-ink whitespace-nowrap ml-2">{(ing.amount * multiplier).toFixed(2).replace(/\.00$/, '')} {ing.unit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          {r.assembly && (
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Assembly Protocol</h4>
                              <div className="space-y-4">
                                {r.assembly.map((step, i) => (
                                  <div key={i} className="text-xs flex gap-4 text-brand-ink/70 leading-relaxed">
                                    <span className="font-serif italic font-bold text-brand-copper shrink-0">{i + 1}.</span>
                                    <span className="font-medium">{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {r.utensils && r.utensils.length > 0 && (
                          <div className="space-y-3">
                             <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Atelier Tools</h4>
                             <div className="flex flex-wrap gap-2">
                                {r.utensils.map((u, i) => (
                                  <span key={i} className="text-[9px] font-bold uppercase tracking-widest bg-brand-bg border border-brand-ink/5 px-4 py-2 rounded-full flex items-center gap-2 text-brand-ink/60 shadow-sm">
                                    <ToolIcon /> {u}
                                  </span>
                                ))}
                             </div>
                          </div>
                        )}

                        {!r.preset && (
                          <div className="flex gap-4 pt-8 border-t border-brand-ink/5">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40 hover:text-brand-ink" onClick={() => onOpenRecipeEditor(r.id)}>Edit Folio</button>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-red-700/60 hover:text-red-700" onClick={() => onDeleteRecipe(r.id)}>Archive Recipe</button>
                          </div>
                        )}
                      </div>
                    )})()}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderComponents = () => {
    const categories: any = {
      protein: '🍗 Proteins',
      base: '🍚 Bases',
      side: '🥦 Sides',
      sauce: '🫙 Sauces',
      pantry: '🥫 Pantry'
    };

    return (
      <div className="space-y-6">
        {Object.entries(categories).map(([cat, title]) => {
          const comps = Object.entries(COMPONENTS).filter(([_, c]) => c.category === cat);
          if (comps.length === 0) return null;

          return (
            <div key={cat} className="space-y-3">
              <h3 className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-widest ml-1">{title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comps.map(([id, comp]) => {
                  const isExp = expandedComponent === `lib-${id}`;
                  return (
                    <div key={id} className="card !p-0 overflow-hidden border border-brand-ink/10 shadow-sm">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer active:bg-brand-ink/5"
                        onClick={() => setExpandedComponent(isExp ? null : `lib-${id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{comp.emoji}</span>
                          <div>
                            <div className="text-sm font-bold text-brand-ink">{comp.name}</div>
                            <div className="text-[10px] text-brand-ink/40 mt-0.5">{comp.yield}</div>
                          </div>
                        </div>
                        <div className={`text-brand-ink/20 transition-transform ${isExp ? 'rotate-180' : ''}`}>
                          <ChevronIcon />
                        </div>
                      </div>
                      {isExp && (
                        <div className="p-4 bg-brand-bg border-t border-brand-ink/5 space-y-4">
                          <div className="space-y-1.5">
                            <div className="text-[9px] uppercase font-bold text-brand-ink/40 tracking-widest">Ingredients</div>
                            <div className="bg-brand-ink/[0.03] border border-brand-ink/5 rounded-xl p-2.5 space-y-1">
                              {comp.ingredients.map((ing, i) => (
                                <div key={i} className="text-[11px] text-brand-ink flex justify-between">
                                  <span>{ing.name}</span>
                                  <span className="font-bold">{ing.amount} {ing.unit}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[9px] uppercase font-bold text-brand-ink/40 tracking-widest">Preparation Steps</div>
                            <div className="space-y-2">
                              {comp.steps.map((s, i) => (
                                <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                                  <span className="text-brand-ink/30 font-bold shrink-0">{i + 1}</span>
                                  <span className="text-brand-ink/80">{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          {comp.utensils && comp.utensils.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[9px] uppercase font-bold text-brand-ink/40 tracking-widest">Tools needed</div>
                              <div className="flex flex-wrap gap-2">
                                {comp.utensils.map((u, i) => (
                                  <span key={i} className="text-[10px] bg-brand-bg border border-brand-ink/5 px-2 py-1 rounded-md text-brand-ink/60 flex items-center gap-1.5 font-medium">
                                    <ToolIcon /> {u}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {comp.storage && (
                            <div className="p-2.5 bg-brand-bg rounded-xl border border-black/5 text-[10px] text-brand-ink/60">
                              <span className="font-bold text-brand-ink/80 mr-1">Storage:</span> {comp.storage}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStores = () => {
    return (
      <div className="space-y-4">
        <button className="btn-primary" onClick={() => onOpenStoreEditor(null)}>
          <PlusIcon /> Add store
        </button>
        {stores.length === 0 ? (
          <div className="card text-center py-10 px-5 text-brand-ink/40 italic font-serif">No source markets established yet.</div>
        ) : (
          <div className="bg-brand-bg border border-brand-ink/10 rounded-2xl overflow-hidden divide-y divide-brand-ink/5">
            {stores.map(s => (
              <div key={s.id} className="p-4 flex items-center justify-between cursor-pointer active:bg-brand-ink/5" onClick={() => onOpenStoreEditor(s.id)}>
                <div>
                  <div className="text-sm font-semibold text-brand-ink">{s.name}</div>
                  <div className="text-xs text-brand-ink/40 mt-0.5">{s.distance}</div>
                </div>
                <ChevronRightIcon />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex gap-1.5 p-1.5 glass border border-brand-ink/5 rounded-full overflow-hidden shadow-sm">
        <button 
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full border-none outline-none cursor-pointer ${tab === 'recipes' ? 'bg-brand-ink text-brand-bg' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
          onClick={() => setTab('recipes')}
        >
          Folio
        </button>
        <button 
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full border-none outline-none cursor-pointer ${tab === 'stores' ? 'bg-brand-ink text-brand-bg' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
          onClick={() => setTab('stores')}
        >
          Markets
        </button>
        <button 
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full border-none outline-none cursor-pointer ${tab === 'prices' ? 'bg-brand-ink text-brand-bg' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
          onClick={() => setTab('prices')}
        >
          Provisions
        </button>
        <button 
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full border-none outline-none cursor-pointer ${tab === 'components' ? 'bg-brand-ink text-brand-bg' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
          onClick={() => setTab('components')}
        >
          Base
        </button>
      </div>

      {tab === 'recipes' && renderRecipes()}
      {tab === 'stores' && renderStores()}
      {tab === 'prices' && (
        <div className="card py-24 text-center border-dashed border-2 bg-transparent opacity-50">
           <p className="heading-serif italic text-xl">Pricing folio under curation...</p>
        </div>
      )}
      {tab === 'components' && renderComponents()}
    </div>
  );
};

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9"/></svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#CCC]">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#BBB]">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/>
  </svg>
);

const ToolIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/>
  </svg>
);

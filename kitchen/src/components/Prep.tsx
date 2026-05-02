/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Client, Recipe, Component } from '../types';
import { findRecipe } from '../utils';
import { COMPONENTS } from '../constants';

interface PrepProps {
  clients: Client[];
  customRecipes: Recipe[];
  prepDone: Record<string, boolean>;
  onTogglePrep: (key: string) => void;
  onResetPrep: () => void;
}

export const Prep: React.FC<PrepProps> = ({ 
  clients, 
  customRecipes, 
  prepDone, 
  onTogglePrep, 
  onResetPrep 
}) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  if (clients.length === 0) {
    return (
      <div className="card text-center py-9 px-5">
        <div className="text-4xl mb-2.5">👨‍🍳</div>
        <p className="text-sm text-[#777] leading-relaxed">Add clients to build a prep list.</p>
      </div>
    );
  }

  const recipeCounts: Record<string, number> = {};
  const componentCounts: Record<string, number> = {};

  clients.forEach(c => (c.meals || []).forEach(mid => {
    recipeCounts[mid] = (recipeCounts[mid] || 0) + 1;
    const r = findRecipe(mid, customRecipes);
    if (r && r.components) {
      r.components.forEach(cid => {
        componentCounts[cid] = (componentCounts[cid] || 0) + 1;
      });
    }
  }));

  const recipeList = Object.keys(recipeCounts).map(id => {
    const r = findRecipe(id, customRecipes);
    return r ? { r, count: recipeCounts[id] } : null;
  }).filter((x): x is { r: Recipe, count: number } => x !== null);

  const componentList = Object.keys(componentCounts).map(id => {
    const c = COMPONENTS[id];
    return c ? { id, c, count: componentCounts[id] } : null;
  }).filter((x): x is { id: string, c: Component, count: number } => x !== null);

  const allUtensils = new Set<string>();
  recipeList.forEach(x => {
    if (x.r.utensils) x.r.utensils.forEach(u => allUtensils.add(u));
    if (x.r.components) {
      x.r.components.forEach(cid => {
        const comp = COMPONENTS[cid];
        if (comp && comp.utensils) comp.utensils.forEach(u => allUtensils.add(u));
      });
    }
  });
  // Also check componentList which covers everything being batch cooked
  componentList.forEach(x => {
    if (x.c.utensils) x.c.utensils.forEach(u => allUtensils.add(u));
  });

  const assembly = ['Portion into containers', 'Label and refrigerate'];
  const total = recipeList.length + componentList.length + assembly.length;
  const doneCount = 
    recipeList.filter(x => prepDone[x.r.id]).length + 
    componentList.filter(x => prepDone[x.id]).length + 
    assembly.filter(a => prepDone[a]).length;

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="card border-none shadow-xl p-10 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
           <img src="https://images.unsplash.com/photo-1556910110-3b6f2a4a7a8d?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-2xl heading-serif text-brand-ink">Mise en Place</h2>
              <div className="text-[10px] font-bold text-brand-ink/40 uppercase tracking-[0.2em] mt-1">{doneCount} of {total} techniques mastered</div>
            </div>
            <button className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/30 hover:text-brand-ink" onClick={onResetPrep}>Reset Session</button>
          </div>
          <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-copper transition-all duration-1000 ease-out" 
              style={{ width: `${total ? (doneCount / total * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {allUtensils.size > 0 && (
        <div className="card glass border-brand-ink/5 p-8 relative overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000">
             <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-ink text-brand-bg flex items-center justify-center text-lg shadow-xl shrink-0">🛠️</div>
              <div>
                <h3 className="heading-serif text-lg text-brand-ink">Tool Master List</h3>
                <p className="text-[8px] text-brand-ink/40 font-bold uppercase tracking-[0.2em] mt-0.5">Atelier Readiness</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[...allUtensils].sort().map((u, i) => (
                <div key={i} className="text-[10px] font-bold bg-white/80 backdrop-blur-sm border border-brand-ink/5 text-brand-ink/60 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <ToolIcon /> {u}
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-brand-ink/5">
              <p className="font-serif italic text-sm text-brand-ink/40 text-center">"Efficiency in the kitchen begins with a clear workspace."</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-4 mb-6 ml-2">
           <div className="h-px flex-1 bg-brand-ink/5"></div>
           <span className="text-[10px] text-brand-ink/30 uppercase tracking-[0.4em] font-bold">1. Component Preparation</span>
           <div className="h-px flex-1 bg-brand-ink/5"></div>
        </div>
        <div className="space-y-6">
          {componentList.map(({ id, c, count }) => {
            const done = prepDone[id];
            const isExp = expanded === id;
            return (
              <div key={id} className={`card !p-0 transition-all duration-500 overflow-hidden border border-brand-ink/5 ${done ? 'opacity-40 grayscale-[0.5]' : 'shadow-lg hover:shadow-xl'}`}>
                <div className="flex items-center gap-6 p-6">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-500 border-2 ${done ? 'bg-brand-sage border-brand-sage text-white' : 'bg-transparent border-brand-ink/10 text-brand-ink/20 hover:border-brand-copper/40 hover:text-brand-copper/40'}`}
                    onClick={() => onTogglePrep(id)}
                  >
                    {done ? <CheckIcon /> : <span className="font-serif italic font-bold">m</span>}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isExp ? null : id)}>
                    <div className={`text-xl heading-serif flex items-center gap-3 ${done ? 'line-through opacity-40' : 'text-brand-ink'}`}>
                      <span>{c.emoji}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="text-[9px] text-brand-copper font-bold uppercase tracking-widest mt-1.5 font-sans">Portions: {count} Portions Total</div>
                  </div>
                  <button 
                    className={`transition-transform duration-500 ${isExp ? 'rotate-180 opacity-100' : 'opacity-20'}`}
                    onClick={() => setExpanded(isExp ? null : id)}
                  >
                    <ChevronIcon />
                  </button>
                </div>
                {isExp && (
                  <div className="p-8 pt-0 bg-brand-bg/10 space-y-10 animate-fade-in">
                    <div className="editorial-border"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="bg-brand-bg/30 p-6 rounded-[24px] border border-brand-ink/[0.03] space-y-4">
                        {c.ingredients.map((ing, i) => (
                          <div key={i} className="text-xs flex items-center justify-between border-b border-brand-ink/[0.03] pb-2">
                            <div className="flex items-center gap-3 min-w-0">
                               <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-sage/10 border border-brand-ink/5 shrink-0 relative flex items-center justify-center">
                                 <span className="text-xs opacity-20 select-none">🔪</span>
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
                            <span className="font-serif italic font-bold text-brand-ink whitespace-nowrap ml-2">{(ing.amount * (count / (c.yieldCount || 1))).toFixed(1).replace(/\.0$/, '')} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Protocol</h4>
                         <div className="space-y-4">
                           {c.steps.map((s, i) => (
                             <div key={i} className="text-xs flex gap-4 text-brand-ink/70 leading-relaxed">
                               <span className="font-serif italic font-bold text-brand-copper shrink-0">{i + 1}.</span>
                               <span className="font-medium">{s}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6 ml-2">
           <div className="h-px flex-1 bg-brand-ink/5"></div>
           <span className="text-[10px] text-brand-ink/30 uppercase tracking-[0.4em] font-bold">2. Plate & Portion</span>
           <div className="h-px flex-1 bg-brand-ink/5"></div>
        </div>
        <div className="space-y-6">
          {recipeList.map(({ r, count }) => {
            const done = prepDone[r.id];
            const isExp = expanded === r.id;
            return (
              <div key={r.id} className={`card !p-0 transition-all duration-500 overflow-hidden border border-brand-ink/5 ${done ? 'opacity-40 grayscale-[0.5]' : 'shadow-lg hover:shadow-xl'}`}>
                <div className={`flex items-center gap-6 p-6`}>
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-500 border-2 ${done ? 'bg-brand-sage border-brand-sage text-white' : 'bg-transparent border-brand-ink/10 text-brand-ink/20 hover:border-brand-copper/40 hover:text-brand-copper/40'}`}
                    onClick={() => onTogglePrep(r.id)}
                  >
                    {done ? <CheckIcon /> : <span className="font-serif italic font-bold">p</span>}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isExp ? null : r.id)}>
                    <div className={`text-xl heading-serif flex items-center gap-3 ${done ? 'line-through opacity-40' : 'text-brand-ink'}`}>
                      <span>{r.emoji}</span>
                      <span className="truncate">{r.name}</span>
                    </div>
                    <div className="text-[9px] text-brand-copper font-bold uppercase tracking-widest mt-1.5 font-sans">{count} Atelier Portions</div>
                  </div>
                  <button 
                    className={`transition-transform duration-500 ${isExp ? 'rotate-180 opacity-100' : 'opacity-20'}`}
                    onClick={() => setExpanded(isExp ? null : r.id)}
                  >
                    <ChevronIcon />
                  </button>
                </div>
                {isExp && (
                  <div className="p-8 pt-0 bg-brand-bg/10 space-y-8 animate-fade-in">
                    <div className="editorial-border"></div>
                    
                    {r.ingredients && r.ingredients.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Provisions Required ({count} plates)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {r.ingredients.map((ing, i) => (
                            <div key={i} className="text-xs flex items-center justify-between border-b border-brand-ink/[0.03] pb-2">
                              <span className="text-brand-ink/60 font-medium truncate">{ing.name}</span>
                              <span className="font-serif italic font-bold text-brand-ink whitespace-nowrap ml-2">
                                {(ing.amount * (count / (r.batchSize || 1))).toFixed(2).replace(/\.00$/, '')} {ing.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.assembly && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-brand-ink uppercase tracking-[0.2em] heading-serif italic opacity-40">Plating Protocol</h4>
                        <div className="space-y-4 px-1">
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-4 mb-6 ml-2">
           <div className="h-px flex-1 bg-brand-ink/5"></div>
           <span className="text-[10px] text-brand-ink/30 uppercase tracking-[0.4em] font-bold">3. Atelier Logistics</span>
           <div className="h-px flex-1 bg-brand-ink/5"></div>
        </div>
        <div className="space-y-6">
          {assembly.map(a => {
            const done = prepDone[a];
            return (
              <div 
                key={a} 
                className={`card !p-6 flex items-center gap-6 cursor-pointer transition-all duration-500 border border-brand-ink/5 ${done ? 'opacity-40 grayscale-[0.5]' : 'shadow-lg hover:shadow-xl'}`}
                onClick={() => onTogglePrep(a)}
              >
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border-2 ${done ? 'bg-brand-sage border-brand-sage text-white' : 'bg-transparent border-brand-ink/10 text-brand-ink/20'}`}
                >
                  {done ? <CheckIcon /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-ink/40" />}
                </div>
                <div className={`text-xl heading-serif ${done ? 'line-through opacity-40' : 'text-brand-ink'}`}>{a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="6 9 12 15 18 9"/></svg>
);

const ToolIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 opacity-30">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/>
  </svg>
);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Recipe, Prices, Ingredient, Component } from '../../types';
import { calcRecipeCost } from '../../utils';
import { COMPONENTS } from '../../constants';

interface RecipeEditorProps {
  recipe: Recipe | null;
  prices: Prices;
  onSave: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({
  recipe,
  prices,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState<Recipe>(recipe || {
    id: 'cr-' + Date.now(),
    name: '',
    desc: '',
    emoji: '🍽',
    day: 'Mon',
    slot: 'Lunch',
    ingredients: [{ name: '', amount: 1, unit: 'oz', pricePerUnit: 0 }],
    utensils: [],
    steps: [''],
    components: [],
    preset: false,
    batchSize: 1
  });

  const displayBatchSize = formData.batchSize || 1;
  const cost = calcRecipeCost(formData, prices);

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, { name: '', amount: 1, unit: 'oz', pricePerUnit: 0 }] });
  };

  const addComponent = (cid: string) => {
    if (formData.components?.includes(cid)) return;
    setFormData({ ...formData, components: [...(formData.components || []), cid] });
  };

  const removeComponent = (cid: string) => {
    setFormData({ ...formData, components: (formData.components || []).filter(x => x !== cid) });
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const next = [...formData.ingredients];
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, ingredients: next });
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end justify-center z-50 px-0 sm:px-4" onClick={onClose}>
      <div className="bg-brand-bg w-full max-w-2xl h-[92vh] rounded-t-2xl flex flex-col animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-brand-ink/10 flex items-center justify-between bg-brand-bg shrink-0">
          <h2 className="text-base font-semibold text-brand-ink">{recipe ? 'Edit recipe' : 'New recipe'}</h2>
          <button className="p-1.5 text-brand-ink/40" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
           <div className="flex gap-4">
             <div className="w-20 shrink-0 space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Emoji</label>
               <input 
                 className="w-full px-3 py-2.5 text-xl text-center border-2 border-brand-ink/10 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink"
                 value={formData.emoji}
                 onChange={e => setFormData({ ...formData, emoji: e.target.value })}
               />
             </div>
             <div className="flex-1 space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Name</label>
               <input 
                 className="w-full px-3 py-2.5 text-base border-2 border-brand-ink/10 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink font-semibold"
                 value={formData.name}
                 placeholder="Recipe name"
                 onChange={e => setFormData({ ...formData, name: e.target.value })}
                 autoFocus
               />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Description (shown to clients)</label>
             <textarea 
               className="w-full px-3 py-2.5 text-sm border-2 border-brand-ink/10 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink h-20 resize-none"
               value={formData.desc}
               placeholder="Briefly describe the dish for your client..."
               onChange={e => setFormData({ ...formData, desc: e.target.value })}
             />
           </div>

           <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Day</label>
               <select 
                 className="w-full px-3 py-2.5 text-sm border-2 border-brand-ink/10 rounded-xl outline-none bg-brand-ink/[0.02] text-brand-ink font-medium"
                 value={formData.day}
                 onChange={e => setFormData({ ...formData, day: e.target.value })}
               >
                 {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <option key={d} value={d}>{d}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Slot</label>
               <select 
                 className="w-full px-3 py-2.5 text-sm border-2 border-brand-ink/10 rounded-xl outline-none bg-brand-ink/[0.02] text-brand-ink font-medium"
                 value={formData.slot}
                 onChange={e => setFormData({ ...formData, slot: e.target.value })}
               >
                 {['Lunch','Dinner','Breakfast','Snack'].map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Batch (plates)</label>
               <input 
                 type="number"
                 min="1"
                 className="w-full px-3 py-2.5 text-sm border-2 border-brand-ink/10 rounded-xl outline-none bg-brand-ink/[0.02] text-brand-ink font-medium"
                 value={formData.batchSize || 1}
                 onChange={e => setFormData({ ...formData, batchSize: parseInt(e.target.value) || 1 })}
               />
             </div>
           </div>

           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider">Sub-Recipes (Components)</label>
               <select 
                 className="text-[10px] bg-brand-bg text-brand-ink border border-brand-ink/10 px-2 py-1 rounded-lg outline-none max-w-[140px]"
                 onChange={(e) => {
                   if (e.target.value) {
                     addComponent(e.target.value);
                     e.target.value = '';
                   }
                 }}
               >
                 <option value="">+ Add...</option>
                 {Object.entries(COMPONENTS).map(([id, c]) => (
                   <option key={id} value={id}>{c.emoji} {c.name}</option>
                 ))}
               </select>
             </div>
             <div className="flex flex-wrap gap-2">
               {(formData.components || []).map(cid => {
                 const comp = COMPONENTS[cid];
                 if (!comp) return null;
                 return (
                   <div key={cid} className="flex items-center gap-1.5 bg-brand-ink/5 px-2.5 py-1.5 rounded-xl border border-brand-ink/5 text-brand-ink">
                     <span className="text-xs">{comp.emoji} {comp.name}</span>
                     <button className="text-red-700/60 hover:text-red-700 hover:scale-110 transition-transform" onClick={() => removeComponent(cid)}>
                       <XIconSmall />
                     </button>
                   </div>
                 );
               })}
               {(!formData.components || formData.components.length === 0) && (
                 <div className="text-[10px] text-brand-ink/20 italic px-1">No sub-recipes selected</div>
               )}
             </div>
           </div>

           <div className="space-y-3">
             <div className="flex items-center justify-between">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider">Assembly (steps to plate)</label>
               <button className="text-[10px] bg-brand-bg text-brand-ink border border-brand-ink/10 px-2 py-1 rounded-lg" onClick={() => setFormData({ ...formData, assembly: [...(formData.assembly || []), ''] })}>+ Add Step</button>
             </div>
             <div className="space-y-2">
               {(formData.assembly || []).map((step, i) => (
                 <div key={i} className="flex gap-2 items-start">
                   <span className="text-[10px] font-bold text-brand-ink/20 mt-2.5">{i + 1}</span>
                   <textarea 
                     className="flex-1 px-3 py-2 text-xs border border-brand-ink/10 rounded-lg outline-none bg-brand-ink/[0.02] text-brand-ink resize-none min-h-[40px]"
                     placeholder="How to plate it..."
                     value={step}
                     onChange={e => {
                       const next = [...(formData.assembly || [])];
                       next[i] = e.target.value;
                       setFormData({ ...formData, assembly: next });
                     }}
                   />
                   <button className="p-1 mt-1 text-red-700/40 hover:text-red-700" onClick={() => setFormData({ ...formData, assembly: (formData.assembly || []).filter((_, idx) => idx !== i) })}>
                     <TrashIconSmall />
                   </button>
                 </div>
               ))}
             </div>
           </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider">Required Utensils</label>
                <button className="text-[10px] bg-brand-bg text-brand-ink border border-brand-ink/10 px-2 py-1 rounded-lg" onClick={() => setFormData({ ...formData, utensils: [...(formData.utensils || []), ''] })}>+ Add tool</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.utensils || []).map((u, i) => (
                  <div key={i} className="flex gap-1 items-center bg-brand-ink/5 border border-brand-ink/5 rounded-lg px-2 py-1 text-brand-ink">
                    <input 
                      className="text-xs outline-none bg-transparent w-24"
                      placeholder="Tool name..."
                      value={u}
                      onChange={e => {
                        const next = [...(formData.utensils || [])];
                        next[i] = e.target.value;
                        setFormData({ ...formData, utensils: next });
                      }}
                    />
                    <button className="text-[#A32D2D] hover:scale-110 transition-transform" onClick={() => setFormData({ ...formData, utensils: (formData.utensils || []).filter((_, idx) => idx !== i) })}>
                      <XIconSmall />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider">Shopping ingredients</label>
                <button className="text-[10px] bg-brand-bg text-brand-ink border border-brand-ink/10 px-2 py-1 rounded-lg" onClick={addIngredient}>+ Add</button>
              </div>
              <div className="space-y-2">
                {formData.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input 
                      className="flex-1 px-3 py-2 text-xs border border-brand-ink/10 rounded-lg outline-none bg-brand-ink/[0.02] text-brand-ink"
                      placeholder="Name"
                      value={ing.name}
                      onChange={e => updateIngredient(i, 'name', e.target.value)}
                    />
                    <input 
                      className="w-16 px-2 py-2 text-xs border border-brand-ink/10 rounded-lg outline-none text-center bg-brand-ink/[0.02] text-brand-ink"
                      type="number"
                      placeholder="Qty"
                      value={ing.amount}
                      onChange={e => updateIngredient(i, 'amount', parseFloat(e.target.value) || 0)}
                    />
                    <input 
                      className="w-16 px-2 py-2 text-xs border border-brand-ink/10 rounded-lg outline-none text-center bg-brand-ink/[0.02] text-brand-ink"
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={e => updateIngredient(i, 'unit', e.target.value)}
                    />
                    <div className="text-[10px] text-brand-ink/20 font-bold">$</div>
                    <input 
                      className="w-16 px-2 py-2 text-xs border border-brand-ink/10 rounded-lg outline-none text-center bg-brand-ink/[0.02] text-brand-ink"
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={ing.pricePerUnit}
                      onChange={e => updateIngredient(i, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                    />
                    <button className="p-1 text-red-700/40 hover:text-red-700" onClick={() => setFormData({ ...formData, ingredients: formData.ingredients.filter((_, idx) => idx !== i) })}>
                      <TrashIconSmall />
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </div>

        <div className="p-4 border-t border-brand-ink/10 bg-brand-bg flex items-center gap-2.5 shrink-0">
          <div className="flex-1">
            <div className="text-[10px] text-brand-ink/40">Estimated cost per plate</div>
            <div className="text-lg font-bold text-brand-ink">${(cost / displayBatchSize).toFixed(2)}</div>
          </div>
          {recipe && !recipe.preset && (
            <button className="btn-ghost text-[#A32D2D] border-[#F7C1C1] px-2.5" onClick={() => onDelete(recipe.id)}>
              <TrashIcon />
            </button>
          )}
          <button className="btn-primary" onClick={() => onSave(formData)}>Save</button>
        </div>
      </div>
    </div>
  );
};

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const XIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const TrashIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

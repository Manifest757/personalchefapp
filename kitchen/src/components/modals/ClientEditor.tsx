/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, Recipe, Prices } from '../../types';
import { CLIENT_COLORS } from '../../constants';
import { calcRecipeCost, findRecipe } from '../../utils';

interface ClientEditorProps {
  client: Client | null;
  recipes: Recipe[];
  prices: Prices;
  onSave: (client: Client) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  getPortalLink: (id: string) => string;
}

export const ClientEditor: React.FC<ClientEditorProps> = ({
  client,
  recipes,
  prices,
  onSave,
  onDelete,
  onClose,
  getPortalLink
}) => {
  const [formData, setFormData] = useState<Client>(client || {
    id: 'c-' + Date.now(),
    name: '',
    weeklyRate: 140,
    colorIdx: 0,
    meals: recipes.map(r => r.id),
    notes: ''
  });

  const cost = formData.meals.reduce((s, mid) => s + calcRecipeCost(findRecipe(mid, recipes), prices), 0);
  const profit = formData.weeklyRate - cost;

  const toggleMeal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.includes(id) ? prev.meals.filter(x => x !== id) : [...prev.meals, id]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end justify-center z-50 px-0 sm:px-4" onClick={onClose}>
      <div className="bg-brand-bg w-full max-w-2xl h-[92vh] rounded-t-2xl flex flex-col animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-brand-ink/10 flex items-center justify-between bg-brand-bg shrink-0">
          <h2 className="text-base font-semibold text-brand-ink">{client ? 'Edit client' : 'New client'}</h2>
          <button className="p-1.5 text-brand-ink/40" onClick={onClose}>
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Name</label>
            <input 
              className="w-full px-3 py-2.5 text-base border border-brand-ink/15 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink"
              value={formData.name}
              placeholder="e.g. Sarah Jenkins"
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Weekly rate ($)</label>
            <input 
              className="w-full px-3 py-2.5 text-base border border-brand-ink/15 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink"
              type="number"
              value={formData.weeklyRate}
              onChange={e => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Notes & Preferences</label>
            <textarea 
              className="w-full px-3 py-2.5 text-base border border-brand-ink/15 rounded-xl outline-none focus:border-brand-ink bg-brand-ink/[0.02] text-brand-ink min-h-[80px]"
              value={formData.notes}
              placeholder="e.g. No cilantro, low sodium focus, double protein for dinner..."
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Color tag</label>
            <div className="flex flex-wrap gap-2">
              {CLIENT_COLORS.map((col, i) => (
                <div 
                  key={i}
                  className={`w-9 h-9 rounded-full cursor-pointer flex items-center justify-center border-2 ${formData.colorIdx === i ? 'border-brand-ink' : 'border-transparent'}`}
                  style={{ backgroundColor: col.bg, color: col.fg }}
                  onClick={() => setFormData({ ...formData, colorIdx: i })}
                >
                  {formData.colorIdx === i && <CheckIcon />}
                </div>
              ))}
            </div>
          </div>

          {client && (
             <div className="space-y-1.5">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider block">Portal Link</label>
               <div className="bg-brand-ink/5 rounded-xl p-3 space-y-2">
                 <div className="text-[11px] font-mono break-all bg-brand-bg p-2 rounded border border-brand-ink/10 text-brand-ink/60">{getPortalLink(client.id)}</div>
                 <button className="btn-ghost w-full justify-center" onClick={() => {
                   navigator.clipboard.writeText(getPortalLink(client.id));
                 }}>Copy link</button>
               </div>
             </div>
          )}

          <div className="space-y-2">
             <div className="flex items-center justify-between">
               <label className="text-[10px] text-brand-ink/40 font-semibold uppercase tracking-wider">Meals ({formData.meals.length})</label>
               <div className="flex gap-1.5">
                 <button className="px-2 py-1 text-[10px] bg-brand-bg border border-brand-ink/10 rounded-lg text-brand-ink/60" onClick={() => setFormData({ ...formData, meals: recipes.map(r => r.id) })}>All</button>
                 <button className="px-2 py-1 text-[10px] bg-brand-bg border border-brand-ink/10 rounded-lg text-brand-ink/60" onClick={() => setFormData({ ...formData, meals: [] })}>None</button>
               </div>
             </div>
             <div className="space-y-1">
               {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
                 const dayRecipes = recipes.filter(r => r.day === day);
                 if (dayRecipes.length === 0) return null;
                 return (
                   <div key={day} className="space-y-1">
                     <div className="text-[10px] font-bold text-brand-ink/20 uppercase mt-2 ml-1">{day}</div>
                     {dayRecipes.map(r => {
                       const sel = formData.meals.includes(r.id);
                       return (
                         <div 
                           key={r.id} 
                           className={`flex items-center gap-3 p-2.5 border rounded-xl cursor-pointer transition-colors ${sel ? 'bg-brand-sage/5 border-brand-sage shadow-sm text-brand-ink' : 'bg-brand-bg border-brand-ink/10 text-brand-ink/60'}`}
                           onClick={() => toggleMeal(r.id)}
                         >
                           <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${sel ? 'bg-brand-ink border-brand-ink' : 'border-brand-ink/30'}`}>
                             {sel && <CheckIconSmall />}
                           </div>
                           <span className="text-[9px] font-bold opacity-40 uppercase w-7">{r.slot.charAt(0)}</span>
                           <span className="text-xs flex-1 truncate">{r.emoji} {r.name}</span>
                           <span className="text-[10px] opacity-40">${calcRecipeCost(r, prices).toFixed(2)}</span>
                         </div>
                       );
                     })}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-brand-ink/10 bg-brand-bg flex items-center gap-2.5 shrink-0">
          <div className="flex-1">
            <div className="text-[10px] text-brand-ink/40">Cost ${cost.toFixed(2)} · Profit</div>
            <div className={`text-lg font-bold ${profit >= 0 ? 'text-brand-sage' : 'text-red-700'}`}>${profit.toFixed(2)}</div>
          </div>
          {client && (
            <button className="btn-ghost text-[#A32D2D] border-[#F7C1C1] px-2.5" onClick={() => onDelete(client.id)}>
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white"><polyline points="20 6 9 17 4 12"/></svg>
);

const CheckIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white"><polyline points="20 6 9 17 4 12"/></svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PantryItem, Recipe } from '../types';
import { generateRecipesFromPantry } from '../services/aiService';

interface PantryProps {
  pantry: PantryItem[];
  onSaveItem: (item: PantryItem) => void;
  onDeleteItem: (id: string) => void;
  onAddGeneratedRecipe: (recipe: Recipe) => void;
}

export const Pantry: React.FC<PantryProps> = ({ pantry, onSaveItem, onDeleteItem, onAddGeneratedRecipe }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Partial<Recipe>[]>([]);
  const [newItem, setNewItem] = useState({ name: '', amount: 0, unit: '' });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    onSaveItem({ ...newItem, id: 'pi-' + Date.now() });
    setNewItem({ name: '', amount: 0, unit: '' });
  };

  const removeItem = (id: string) => {
    onDeleteItem(id);
  };

  const handleGenerate = async () => {
    if (pantry.length === 0) {
      alert("Add some ingredients to your pantry first!");
      return;
    }
    setIsGenerating(true);
    try {
      const recipes = await generateRecipesFromPantry(pantry);
      setSuggestedRecipes(recipes);
    } catch (error) {
      console.error("Recipe generation failed:", error);
      alert("Failed to generate recipes. Please check your AI configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addRecipeToCookbook = (partial: Partial<Recipe>) => {
    const full: Recipe = {
      id: 'cr-' + Date.now() + Math.random().toString(36).substr(2, 5),
      name: partial.name || 'AI Recipe',
      desc: partial.desc || '',
      emoji: partial.emoji || '🍽',
      day: partial.day || 'Mon',
      slot: partial.slot || 'Lunch',
      ingredients: (partial.ingredients || []).map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        pricePerUnit: ing.pricePerUnit || 0
      })),
      assembly: partial.assembly || [],
      preset: false
    };
    onAddGeneratedRecipe(full);
    setSuggestedRecipes(prev => prev.filter(r => r.name !== partial.name));
    alert(`${full.name} added to your Cookbook!`);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="card border-none shadow-xl p-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center text-2xl border border-brand-ink/5">🥫</div>
          <div>
            <h2 className="text-2xl heading-serif text-brand-ink">Atelier Provisions</h2>
            <p className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-[0.2em] mt-1">Stock Management & Creative Brainstorming</p>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-brand-bg/30 p-8 rounded-[32px] border border-brand-ink/[0.03]">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-5">
                <input 
                  className="neo-input w-full"
                  placeholder="Ingredient (e.g. Heirloom Carrots)"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <input 
                  className="neo-input w-full text-center"
                  type="number"
                  placeholder="Qty"
                  value={newItem.amount || ''}
                  onChange={e => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <input 
                  className="neo-input w-full text-center"
                  placeholder="Unit"
                  value={newItem.unit}
                  onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>
              <div className="col-span-4 sm:col-span-1 flex justify-end">
                <button className="btn-primary !p-4" onClick={addItem}>
                  <PlusIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {pantry.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-brand-ink/5 rounded-[32px]">
                <p className="heading-serif italic text-lg opacity-30">Pantry inventory is currently empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pantry.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-brand-ink/5 hover:border-brand-copper/30 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none">
                      <img 
                        src={`https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop&name=${encodeURIComponent(item.name)}`}
                        className="w-full h-full object-cover"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-ink/5 shrink-0 bg-brand-sage/10 relative flex items-center justify-center">
                        <span className="text-xl opacity-20 select-none">🍎</span>
                        <img 
                          src={`https://loremflickr.com/120/120/${encodeURIComponent(item.name.replace(/[^a-zA-Z\s]/g, ''))},food/all`} 
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brand-ink">{item.name}</div>
                        <div className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-widest mt-0.5">{item.amount} {item.unit}</div>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-700/40 hover:text-red-700" onClick={() => removeItem(item.id)}>
                      <TrashIconSmall />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-brand-ink text-brand-bg flex items-center justify-center text-lg">✨</div>
             <div>
               <h3 className="heading-serif text-xl border-b border-brand-ink/10 pb-1">Culinary Vision</h3>
               <p className="text-[8px] text-brand-ink/40 font-bold uppercase tracking-[0.25em] mt-1">AI-Powered Recipe Generation</p>
             </div>
          </div>
          <button 
            className="btn-secondary !text-[10px] uppercase tracking-[0.2em] px-8 disabled:opacity-30" 
            disabled={isGenerating || pantry.length === 0}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Curating...
              </span>
            ) : 'Consult AI'}
          </button>
        </div>

        {suggestedRecipes.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {suggestedRecipes.map((r, i) => (
              <div key={i} className="card !p-0 overflow-hidden border border-brand-copper/10 shadow-xl animate-fade-in">
                <div className="flex p-8 gap-8">
                  <div className="w-20 h-20 rounded-full bg-brand-copper/[0.03] border border-brand-copper/10 flex items-center justify-center text-5xl shrink-0">
                    {r.emoji}
                  </div>
                  <div className="flex-1 space-y-4">
                    <h4 className="text-2xl heading-serif text-brand-ink">{r.name}</h4>
                    <div className="border-l-2 border-brand-sage/20 pl-4">
                       <p className="text-xs font-serif italic text-brand-ink/60 leading-relaxed">{r.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {r.ingredients?.map((ing, j) => (
                        <span key={j} className="text-[7px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 bg-brand-bg border border-brand-ink/[0.03] text-brand-ink/60 rounded-full">
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-brand-bg/30 px-8 py-4 flex justify-between items-center border-t border-brand-ink/5">
                   <span className="text-[9px] font-bold text-brand-ink/30 uppercase tracking-widest italic font-serif">A proposed signature dish</span>
                   <button 
                     className="text-[10px] font-bold text-brand-copper uppercase tracking-widest flex items-center gap-2 hover:brightness-125 transition-all"
                     onClick={() => addRecipeToCookbook(r)}
                   >
                     Commit to Folio <PlusIconSmall />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const PlusIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const TrashIconSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

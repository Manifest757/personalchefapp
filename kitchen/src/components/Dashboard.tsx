/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChefInfo, Client, Recipe, Prices } from '../types';
import { CLIENT_COLORS } from '../constants';
import { calcRecipeCost, findRecipe } from '../utils';

interface DashboardProps {
  chefInfo: ChefInfo;
  clients: Client[];
  customRecipes: Recipe[];
  prices: Prices;
  onEditClient: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ chefInfo, clients, customRecipes, prices, onEditClient, onNavigate }) => {
  const totalCost = clients.reduce((s, c) => s + (c.meals || []).reduce((sum, mid) => sum + calcRecipeCost(findRecipe(mid, customRecipes), prices), 0), 0);
  const totalRevenue = clients.reduce((s, c) => s + (c.weeklyRate || 0), 0);
  const totalMeals = clients.reduce((s, c) => s + (c.meals || []).length, 0);
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="relative h-[480px] rounded-[48px] overflow-hidden group shadow-2xl border border-brand-ink/5">
        <img 
          src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
          alt="Chef Atelier" 
          className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-black/10 to-transparent p-16 flex flex-col justify-end">
          <div className="flex items-center gap-6 mb-8 animate-fade-in delay-100">
            {chefInfo.avatarUrl ? (
              <div className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
                <img src={chefInfo.avatarUrl} alt={chefInfo.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl border border-white/5 shadow-2xl">👨‍🍳</div>
            )}
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <div className="h-[1px] w-8 bg-brand-copper"></div>
                 <div className="text-white/60 text-[9px] uppercase font-black tracking-[0.4em]">Master of the Atelier</div>
              </div>
              <h3 className="text-white text-3xl heading-serif scale-y-110 origin-left">{chefInfo.name || 'Anonymous Chef'}</h3>
            </div>
          </div>
          <h2 className="text-7xl heading-serif text-white leading-[0.85] tracking-tight">
            Artisanal Systems <br/> 
            <span className="opacity-80 italic">for the Modern Chef.</span>
          </h2>
          <p className="text-white/50 text-base mt-8 max-w-lg leading-relaxed font-serif italic">
            Precision, elegance, and mastery. Your kitchen operations synchronized with the frequency of your craft.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6">
        <div className="card !bg-brand-sage/5 border-none shadow-none flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=400" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] text-brand-sage font-bold uppercase tracking-widest text-center py-1 bg-brand-sage/10 rounded-full w-24">Accounts</div>
            <div className="mt-8">
              <span className="text-6xl heading-serif text-brand-ink">{clients.length}</span>
              <p className="text-[10px] text-brand-ink/40 font-medium mt-1 uppercase tracking-widest">Client Profiles</p>
            </div>
          </div>
        </div>
        <div className="card !bg-brand-copper/5 border-none shadow-none flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=60&w=400" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] text-brand-copper font-bold uppercase tracking-widest text-center py-1 bg-brand-copper/10 rounded-full w-24">Inventory</div>
            <div className="mt-8">
              <span className="text-6xl heading-serif text-brand-ink">{totalMeals}</span>
              <p className="text-[10px] text-brand-ink/40 font-medium mt-1 uppercase tracking-widest">Weekly Portions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-1000">
          <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-widest text-brand-ink/30 italic font-serif">Weekly Balance</div>
            <div className={`text-6xl heading-serif ${profit >= 0 ? 'text-brand-ink' : 'text-red-800'}`}>
              ${profit.toFixed(0)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-brand-sage uppercase tracking-widest bg-brand-sage/10 px-3 py-1.5 rounded-full inline-block">
              {margin.toFixed(0)}% Margin
            </div>
            <div className="text-[11px] font-serif italic text-brand-ink/40 mt-3">
              Est. Monthly Profit: ${(profit * 4.33).toFixed(0)}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="text-[11px] font-bold text-brand-ink uppercase tracking-[0.22em] heading-serif opacity-60">Active Client Registry</div>
          <button className="text-[10px] text-brand-copper font-black uppercase tracking-widest" onClick={() => onNavigate('clients')}>Manage List</button>
        </div>
        
        {clients.length === 0 ? (
          <div className="card text-center py-20 px-8 flex flex-col items-center border-dashed border-2 bg-transparent border-brand-ink/10">
            <div className="w-20 h-20 rounded-full bg-brand-bg flex items-center justify-center text-3xl mb-8 border border-brand-ink/5">👨‍🍳</div>
            <h3 className="heading-serif text-2xl mb-2 italic text-brand-ink">A Quiet Kitchen...</h3>
            <p className="text-xs text-brand-ink/50 leading-relaxed font-medium">Ready to serve your first accounts this week?</p>
            <button className="btn-secondary mt-10" onClick={() => onNavigate('clients')}>Onboard Client</button>
          </div>
        ) : (
          <div className="space-y-6">
            {clients.map((c) => {
              const col = CLIENT_COLORS[c.colorIdx] || CLIENT_COLORS[0];
              const cc = (c.meals || []).reduce((sum, mid) => sum + calcRecipeCost(findRecipe(mid, customRecipes), prices), 0);
              const cp = (c.weeklyRate || 0) - cc;
              return (
                <div 
                  key={c.id} 
                  className="flex items-center gap-6 p-4 group cursor-pointer card !bg-transparent border-none hover:bg-brand-ink/[0.02] transition-colors relative overflow-hidden"
                  onClick={() => onEditClient(c.id)}
                >
                  <div className="absolute inset-0 z-0 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-700 pointer-events-none">
                    <img 
                      src={`https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop&name=${encodeURIComponent(c.name)}`}
                      className="w-full h-full object-cover"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-brand-ink/5 bg-brand-bg shadow-inner shrink-0 scale-100 group-hover:scale-105 transition-transform duration-700 relative z-10">
                    <img 
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.name}`} 
                      alt={c.name}
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    />
                  </div>
                  <div className="flex-1 min-w-0 editorial-border pb-8 flex justify-between items-center group-hover:border-brand-ink/30 transition-all">
                    <div>
                      <div className="text-2xl heading-serif text-brand-ink">{c.name}</div>
                      <div className="flex items-center gap-3 mt-2">
                         <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-ink/30">Chef's Retainer</span>
                         <div className="w-1 h-1 rounded-full bg-brand-copper/30"></div>
                         <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-ink/60">{(c.meals || []).length} Provisions Commissioned</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl heading-serif text-brand-ink">${(c.weeklyRate || 0).toFixed(0)}</div>
                      <div className={`text-[8px] font-bold tracking-[0.3em] uppercase mt-2 ${cp < 0 ? 'text-red-700' : 'text-brand-copper'}`}>
                         {cp < 0 ? 'Margin Deficit' : `+${cp.toFixed(0)} Net Yield`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Client, Recipe, Prices } from '../types';
import { CLIENT_COLORS } from '../constants';
import { findRecipe } from '../utils';

interface ClientsProps {
  clients: Client[];
  customRecipes: Recipe[];
  onEditClient: (id: string | null) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, customRecipes, onEditClient }) => {
  if (clients.length === 0) {
    return (
      <div className="card text-center py-12 px-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl neo-sm-in flex items-center justify-center text-3xl mb-6">👥</div>
        <p className="text-sm font-black text-brand-ink/40 uppercase tracking-tight leading-relaxed mb-8">Client list is empty.<br/>Ready to scale your business?</p>
        <button className="btn-primary" onClick={() => onEditClient(null)}>Add New Account</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((c) => {
        const col = CLIENT_COLORS[c.colorIdx] || CLIENT_COLORS[0];
        const tags = (c.meals || []).map(mid => {
          const m = findRecipe(mid, customRecipes);
          return m ? <span key={mid} className="text-[9px] font-black uppercase tracking-tight px-2 py-1 bg-brand-bg neo-sm-in text-brand-ink/40 rounded-lg">{m.day} {m.slot.charAt(0)}</span> : null;
        });

        return (
          <div 
            key={c.id} 
            className="card cursor-pointer group active:neo-sm-in transition-all relative overflow-hidden"
            onClick={() => onEditClient(c.id)}
          >
            <div className="absolute inset-0 z-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
              <img 
                src={`https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop&name=${encodeURIComponent(c.name)}`}
                className="w-full h-full object-cover"
                alt=""
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl neo-sm-in flex items-center justify-center text-lg font-black shrink-0 transition-transform group-hover:scale-105"
                style={{ color: col.fg }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-brand-ink uppercase tracking-tight truncate">{c.name}</div>
                <div className="text-[9px] text-brand-ink/30 font-black mt-1 uppercase tracking-tight">${(c.weeklyRate || 0).toFixed(0)}/week · {(c.meals || []).length} dishes</div>
              </div>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-brand-ink/5">
                {tags}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

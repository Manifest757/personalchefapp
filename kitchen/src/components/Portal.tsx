/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PRESET_RECIPES } from '../constants';

interface PortalProps {
  data: {
    meals: string[];
    recipes: { id: string, day: string, slot: string, name: string, desc: string }[];
    chef: string;
    avatarUrl?: string;
    email: string;
    phone: string;
    cid?: string;
  };
}

export const Portal: React.FC<PortalProps> = ({ data }) => {
  const [picked, setPicked] = useState<string[]>([]);
  const [clientName, setClientName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-[#1A1A18] mb-2">Order sent!</h2>
        <p className="text-[#888] leading-relaxed">Your selections have been sent to {data.chef}. They'll confirm shortly.</p>
      </div>
    );
  }

  const toggleMeal = (id: string) => {
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    const lines = picked.map(id => {
      const m = data.recipes.find(r => r.id === id) || PRESET_RECIPES.find(x => x.id === id);
      return m ? `${m.day} ${m.slot}: ${m.name}` : '';
    }).filter(Boolean).join('\n');
    
    const body = `Hi ${data.chef},\n\nHere are my meal selections:\n\n${lines}\n\nName: ${clientName}\n\nThanks!`;
    
    if (data.phone) {
      window.location.href = `sms:${data.phone}${navigator.userAgent.match(/iPhone/i) ? '&' : '?'}body=${encodeURIComponent(body)}`;
    } else if (data.email) {
      window.location.href = `mailto:${data.email}?subject=${encodeURIComponent('Meal Order - ' + clientName)}&body=${encodeURIComponent(body)}`;
    } else {
      alert('Order:\n\n' + body);
    }
    setSubmitted(true);
  };

  const offered = data.meals.map(id => data.recipes.find(r => r.id === id) || PRESET_RECIPES.find(x => x.id === id)).filter((x): x is any => !!x);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <div className="relative h-64 bg-brand-ink text-white p-12 flex flex-col justify-end overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-64 h-64"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/></svg>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          {data.avatarUrl ? (
            <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl shrink-0">
               <img src={data.avatarUrl} alt={data.chef} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/5 shrink-0">👨‍🍳</div>
          )}
          <div>
            <h1 className="text-4xl heading-serif leading-tight">{data.chef}'s <br/> Atelier Portfolio</h1>
            <div className="flex items-center gap-2 mt-4 text-white/40">
               <div className="w-[8px] h-px bg-brand-copper"></div>
               <div className="text-[10px] uppercase font-bold tracking-[0.2em]">Weekly Provisions Selection</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8 pb-40 max-w-lg mx-auto space-y-12 -mt-8 relative z-20">
        <div className="card glass !p-10 shadow-2xl">
          <label className="text-[9px] text-brand-ink/40 font-bold uppercase tracking-[0.3em] block mb-4">Account Identification</label>
          <input 
            className="w-full bg-transparent border-b-2 border-brand-ink/10 py-3 text-xl heading-serif text-brand-ink outline-none focus:border-brand-ink transition-colors placeholder:text-brand-ink/10"
            placeholder="Your Signature Name"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
          />
        </div>

        <div className="space-y-12">
          {days.map(day => {
            const dayMeals = offered.filter(m => m.day === day);
            if (dayMeals.length === 0) return null;
            return (
              <div key={day} className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="text-[10px] font-bold text-brand-ink/20 uppercase tracking-[0.4em] shrink-0">{day}day Collection</div>
                   <div className="h-px flex-1 bg-brand-ink/5"></div>
                </div>
                {dayMeals.map(m => {
                  const p = picked.includes(m.id);
                  return (
                    <div 
                      key={m.id} 
                      className={`card transition-all duration-700 cursor-pointer !p-0 overflow-hidden relative group/item ${p ? 'shadow-2xl translate-y-[-4px] border-brand-copper/30' : 'hover:translate-y-[-2px]'}`}
                      onClick={() => toggleMeal(m.id)}
                    >
                      <div className={`absolute inset-0 z-0 transition-opacity duration-700 pointer-events-none ${p ? 'opacity-[0.08]' : 'opacity-[0.02]'}`}>
                         <img 
                           src={`https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=60&w=800&ixlib=rb-4.0.3&name=${encodeURIComponent(m.name)}`}
                           className="w-full h-full object-cover"
                           alt=""
                           referrerPolicy="no-referrer"
                         />
                      </div>
                      <div className="flex items-center gap-6 p-8 relative z-10">
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-700 ${p ? 'bg-brand-ink border-brand-ink text-white' : 'bg-transparent border-brand-ink/10 text-brand-ink/10'}`}>
                           {p ? <CheckIcon /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-ink/20" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 ${p ? 'text-brand-copper' : 'text-brand-ink/30'}`}>
                            {m.slot} Selection
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-sage/10 border border-brand-ink/5 shrink-0 relative flex items-center justify-center">
                              <span className="text-2xl opacity-20 select-none">🍳</span>
                              <img 
                                src={`https://loremflickr.com/160/160/${encodeURIComponent(m.name.replace(/[^a-zA-Z\s]/g, ''))},food/all`}
                                alt={m.name}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xl heading-serif text-brand-ink leading-tight">{m.name}</div>
                              {m.desc && <div className="text-xs italic text-brand-ink/50 mt-1 font-serif leading-relaxed line-clamp-1">{m.desc}</div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 glass border-t border-brand-ink/5 p-8 flex items-center gap-6 z-50 animate-fade-in shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="text-[9px] text-brand-ink/40 uppercase font-bold tracking-[0.2em]">
          <span className="text-brand-ink text-lg font-serif italic mr-2">{picked.length}</span> Selections Curated
        </div>
        <button 
          className="flex-1 btn-primary py-5 !text-[11px]"
          disabled={picked.length === 0 || !clientName.trim()}
          onClick={handleSubmit}
        >
          Confirm Provisions Portfolio
        </button>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

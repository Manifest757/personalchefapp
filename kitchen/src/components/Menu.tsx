/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChefInfo } from '../types';
import { useSupabase } from '../lib/SupabaseContext';

interface MenuProps {
  chefInfo: ChefInfo;
  menuOffers: string[];
  customRecipes: any[];
  allRecipes: any[];
  theme: 'light' | 'dark';
  onUpdateChefInfo: (info: ChefInfo) => void;
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onToggleOffer: (id: string) => void;
  onOfferAll: () => void;
  onOfferNone: () => void;
  onCopyPortalLink: () => void;
  onPreviewPortal: () => void;
  onLogout: () => void;
  portalLink: string;
}

export const Menu: React.FC<MenuProps> = ({
  chefInfo,
  menuOffers,
  customRecipes,
  allRecipes,
  theme,
  onUpdateChefInfo,
  onUpdateTheme,
  onToggleOffer,
  onOfferAll,
  onOfferNone,
  onCopyPortalLink,
  onPreviewPortal,
  onLogout,
  portalLink
}) => {
  const { uploadAvatar } = useSupabase();
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) {
        onUpdateChefInfo({ ...chefInfo, avatarUrl: url });
      }
    } finally {
      setUploading(false);
    }
  };

  const hasContact = chefInfo.email || chefInfo.phone;

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest ml-0.5">Chef Profile</div>
      
      <div className="card flex flex-col items-center gap-6 py-10 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000">
           <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative group/avatar">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-brand-ink/5 bg-brand-bg shadow-2xl relative">
              {chefInfo.avatarUrl ? (
                <img 
                  src={chefInfo.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-brand-ink/5 text-brand-ink/20">
                  👨‍🍳
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-10 h-10 bg-brand-ink text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              disabled={uploading}
            >
              <CameraIcon />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl heading-serif text-brand-ink">{chefInfo.name || 'Set your name'}</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-brand-ink/30 mt-1">Master of the Atelier</p>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest ml-0.5">Contact configuration</div>
      <div className="card space-y-3 relative overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000">
           <img src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=60&w=800" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#999] font-semibold uppercase tracking-wider block">Your name (shown to clients)</label>
            <input 
              className="w-full px-3 py-2.5 text-base border border-black/15 rounded-xl outline-none focus:border-[#1A1A18] bg-white/80 backdrop-blur-sm"
              value={chefInfo.name}
              placeholder="e.g. Chef Marcus"
              onChange={(e) => onUpdateChefInfo({ ...chefInfo, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#999] font-semibold uppercase tracking-wider block">Email</label>
            <input 
              className="w-full px-3 py-2.5 text-base border border-black/15 rounded-xl outline-none focus:border-[#1A1A18] bg-white/80 backdrop-blur-sm"
              type="email"
              value={chefInfo.email}
              placeholder="you@email.com"
              onChange={(e) => onUpdateChefInfo({ ...chefInfo, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#999] font-semibold uppercase tracking-wider block">Phone (for SMS orders, optional)</label>
            <input 
              className="w-full px-3 py-2.5 text-base border border-black/15 rounded-xl outline-none focus:border-[#1A1A18] bg-white/80 backdrop-blur-sm"
              type="tel"
              value={chefInfo.phone}
              placeholder="+1 555 000 0000"
              onChange={(e) => onUpdateChefInfo({ ...chefInfo, phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest ml-0.5">Atmosphere</div>
      <div className="card flex p-1.5 bg-brand-ink/5 border-none">
        <button 
          onClick={() => onUpdateTheme('light')}
          className={`flex-1 py-3 rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          Morning
        </button>
        <button 
          onClick={() => onUpdateTheme('dark')}
          className={`flex-1 py-3 rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-brand-ink text-white shadow-sm' : 'text-brand-ink/40 hover:text-brand-ink/60'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          Evening
        </button>
      </div>

      <div className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest ml-0.5">This week's menu — tap to include/remove</div>
      <div className="bg-brand-bg rounded-2xl overflow-hidden border border-brand-ink/10">
        <div className="flex justify-end gap-1.5 p-2.5 border-b border-brand-ink/5 bg-brand-ink/[0.02]">
          <button className="px-3 py-1.5 text-xs bg-brand-bg border border-brand-ink/15 rounded-lg active:bg-brand-ink/5" onClick={onOfferAll}>All</button>
          <button className="px-3 py-1.5 text-xs bg-brand-bg border border-brand-ink/15 rounded-lg active:bg-brand-ink/5" onClick={onOfferNone}>None</button>
        </div>
        <div>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => {
            const dayRecipes = allRecipes.filter(r => r.day === day);
            if (dayRecipes.length === 0) return null;
            return (
              <div key={day}>
                <div className="px-4 py-2 bg-brand-ink/[0.02] text-[10px] text-brand-ink/40 font-bold uppercase tracking-widest border-y border-brand-ink/5">{day}</div>
                {dayRecipes.map(r => {
                  const on = menuOffers.includes(r.id);
                  return (
                    <div 
                      key={r.id} 
                      className={`flex items-center gap-3 p-3.5 border-b border-brand-ink/5 last:border-0 cursor-pointer ${on ? 'bg-brand-sage/5' : ''}`}
                      onClick={() => onToggleOffer(r.id)}
                    >
                      <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 ${on ? 'bg-brand-ink border-brand-ink' : 'border-brand-ink/30'}`}>
                        {on && <CheckIcon />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{r.emoji || ''} {r.name} {!r.preset && <span className="bg-[#ECF5E0] text-[#2D6A0A] text-[10px] px-2 py-0.5 rounded-full font-semibold ml-1.5">Custom</span>}</div>
                        <div className="text-xs text-[#888] mt-0.5">{r.slot}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest ml-0.5">Client ordering link</div>
      {hasContact ? (
        <div className="bg-[#F0EFE8] rounded-xl p-3.5 space-y-3">
          <div className="text-xs text-[#666] leading-relaxed">Share this link with clients. They pick meals and send their order via email/SMS.</div>
          <div className="text-[11px] text-[#444] break-all font-mono bg-white/50 p-2 rounded border border-black/5">{portalLink}</div>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1 justify-center" onClick={onCopyPortalLink}>
              <CopyIcon /> Copy link
            </button>
            <button className="btn-ghost flex-1 justify-center" onClick={onPreviewPortal}>
              Preview
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center py-5 text-[#888] text-sm">
          Enter your name and email/phone above to generate a client link.
        </div>
      )}

      <div className="pt-12">
        <button 
          onClick={onLogout}
          className="w-full py-4 text-red-600 font-bold uppercase tracking-widest text-[10px] border border-red-100 rounded-2xl hover:bg-red-50 transition-colors"
        >
          Logout of Atelier account
        </button>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);

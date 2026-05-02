/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChefInfo, Client, Recipe, Prices, PantryItem } from './types';
import { PRESET_RECIPES } from './constants';
import { allRecipes } from './utils';
import { useSupabase } from './lib/SupabaseContext';
import { Dashboard } from './components/Dashboard';
import { Shopping } from './components/Shopping';
import { Menu } from './components/Menu';
import { Clients } from './components/Clients';
import { Prep } from './components/Prep';
import { Cookbook } from './components/Cookbook';
import { ClientEditor } from './components/modals/ClientEditor';
import { RecipeEditor } from './components/modals/RecipeEditor';
import { Portal } from './components/Portal';
import { Pantry } from './components/Pantry';
import { Login } from './components/Login';
import { usePersistentState } from './hooks/usePersistentState';

export default function App() {
  const { 
    user, loading, 
    clients, recipes: customRecipes, pantry, chefInfo, prices, stores,
    menuOffers, shoppingDone, prepDone, theme,
    saveClient, deleteClient, saveRecipe, deleteRecipe, savePantryItem, deletePantryItem, updateSettings,
    logout 
  } = useSupabase();

  const [view, setView] = useState(() => window.location.hash.startsWith('#portal=') ? 'portal' : 'dashboard');
  
  // Transient state
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const getPortalData = () => {
    const h = window.location.hash;
    if (!h.startsWith('#portal=')) return null;
    try {
      return JSON.parse(decodeURIComponent(escape(atob(h.slice(8)))));
    } catch {
      return null;
    }
  };

  const portalData = getPortalData();

  const recipes = allRecipes(customRecipes);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-1.5 h-12 bg-brand-ink animate-pulse"></div>
      </div>
    );
  }

  if (view !== 'portal' && !user) {
    return <Login />;
  }

  const getPortalLink = (clientId?: string) => {
    const data = {
      meals: menuOffers,
      recipes: recipes.filter(r => menuOffers.includes(r.id)).map(r => ({ id: r.id, day: r.day, slot: r.slot, name: r.name, desc: r.desc })),
      chef: chefInfo.name || 'Your Chef',
      avatarUrl: chefInfo.avatarUrl || '',
      email: chefInfo.email || '',
      phone: chefInfo.phone || '',
      cid: clientId || '',
    };
    const enc = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    return `${window.location.origin}${window.location.pathname}#portal=${enc}`;
  };

  const currentEditingClient = editingClientId === 'new' 
    ? null 
    : clients.find(c => c.id === editingClientId) || null;

  const currentEditingRecipe = editingRecipeId === 'new'
    ? null
    : recipes.find(r => r.id === editingRecipeId) || null;

  const renderContent = () => {
    if (view === 'portal' && portalData) {
      return <Portal data={portalData} />;
    }
    
    switch (view) {
      case 'dashboard':
        return <Dashboard 
          chefInfo={chefInfo}
          clients={clients} 
          customRecipes={customRecipes} 
          prices={prices} 
          onEditClient={setEditingClientId} 
          onNavigate={setView} 
        />;
      case 'clients':
        return <Clients 
          clients={clients} 
          customRecipes={customRecipes} 
          onEditClient={setEditingClientId} 
        />;
      case 'shopping':
        return <Shopping 
          clients={clients} 
          customRecipes={customRecipes} 
          prices={prices} 
          stores={stores} 
          shoppingDone={shoppingDone} 
          onToggleShop={(key) => updateSettings({ shoppingDone: { ...shoppingDone, [key]: !shoppingDone[key] } })}
          onResetShopping={() => updateSettings({ shoppingDone: {} })}
          onOpenPriceEditor={() => {}}
        />;
      case 'prep':
        return <Prep 
          clients={clients} 
          customRecipes={customRecipes} 
          prepDone={prepDone}
          onTogglePrep={(key) => updateSettings({ prepDone: { ...prepDone, [key]: !prepDone[key] } })}
          onResetPrep={() => updateSettings({ prepDone: {} })}
        />;
      case 'pantry':
        return <Pantry 
          pantry={pantry}
          onSaveItem={savePantryItem}
          onDeleteItem={deletePantryItem}
          onAddGeneratedRecipe={(recipe) => saveRecipe(recipe)}
        />;
      case 'menu':
        return <Menu 
          chefInfo={chefInfo}
          menuOffers={menuOffers}
          customRecipes={customRecipes}
          allRecipes={recipes}
          theme={theme}
          onUpdateChefInfo={(info) => updateSettings({ chefInfo: info })}
          onUpdateTheme={(t) => updateSettings({ theme: t })}
          onToggleOffer={(id) => {
            const next = menuOffers.includes(id) ? menuOffers.filter(x => x !== id) : [...menuOffers, id];
            updateSettings({ menuOffers: next });
          }}
          onOfferAll={() => updateSettings({ menuOffers: recipes.map(r => r.id) })}
          onOfferNone={() => updateSettings({ menuOffers: [] })}
          onLogout={logout}
          onCopyPortalLink={() => {
            navigator.clipboard.writeText(getPortalLink());
            const b = document.createElement('div');
            b.innerText = 'Link copied!';
            b.className = 'fixed top-10 left-1/2 -translate-x-1/2 bg-[#1A1A18] text-white px-4 py-2 rounded-full text-sm z-[100] shadow-lg animate-fade-in';
            document.body.appendChild(b);
            setTimeout(() => b.remove(), 2000);
          }}
          onPreviewPortal={() => window.open(getPortalLink(), '_blank')}
          portalLink={getPortalLink()}
        />;
      case 'cookbook':
        return <Cookbook 
          customRecipes={customRecipes}
          stores={stores}
          prices={prices}
          onOpenRecipeEditor={setEditingRecipeId}
          onDeleteRecipe={(id) => {
             if (confirm('Delete this recipe?')) {
               deleteRecipe(id);
             }
          }}
          onOpenStoreEditor={() => {}}
          onOpenPriceEditor={() => {}}
        />;
      default:
        return <div className="text-center py-20 text-[#888]">View "{view}" coming soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-32 font-sans overflow-x-hidden">
      {/* Theme Quick Toggle */}
      {view !== 'portal' && (
        <button 
          onClick={() => updateSettings({ theme: theme === 'light' ? 'dark' : 'light' })}
          className="fixed top-6 right-6 z-[101] w-10 h-10 rounded-full glass border border-brand-ink/10 flex items-center justify-center text-brand-ink shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
          title={theme === 'light' ? 'Evening Mode' : 'Morning Mode'}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          )}
        </button>
      )}

      {view !== 'portal' && (
        <header className="px-6 pt-16 pb-8 sticky top-0 z-30 glass border-b border-brand-ink/5">
          <div className="max-w-2xl mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-3xl heading-serif text-brand-ink/90">The Chef's Atelier</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-sage animate-pulse"></span>
                <p className="text-[10px] font-semibold text-brand-ink/40 uppercase tracking-widest font-sans">
                  Current Session · {clients.length} Active Accounts
                </p>
              </div>
            </div>
            {view === 'clients' && (
              <button 
                className="btn-primary flex items-center gap-2" 
                onClick={() => setEditingClientId('new')}
              >
                <PlusIcon />
                <span className="uppercase tracking-widest text-[9px]">Add Profile</span>
              </button>
            )}
          </div>
        </header>
      )}

      <main className={`max-w-2xl mx-auto ${view === 'portal' ? '' : 'px-6 py-10'}`}>
        {renderContent()}
      </main>

      {editingClientId && (
        <ClientEditor 
          client={currentEditingClient}
          recipes={recipes}
          prices={prices}
          onSave={(c) => {
            saveClient(c);
            setEditingClientId(null);
          }}
          onDelete={(id) => {
            if (confirm('Delete this client profile?')) {
              deleteClient(id);
              setEditingClientId(null);
            }
          }}
          onClose={() => setEditingClientId(null)}
          getPortalLink={getPortalLink}
        />
      )}

      {editingRecipeId && (
        <RecipeEditor 
          recipe={currentEditingRecipe}
          onSave={(r) => {
            saveRecipe(r);
            setEditingRecipeId(null);
          }}
          onClose={() => setEditingRecipeId(null)}
        />
      )}

      {view !== 'portal' && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-lg glass border border-brand-ink/10 rounded-full flex p-2.5 z-[100] shadow-2xl">
          <NavButton active={view === 'dashboard'} label="Atelier" icon="home" onClick={() => setView('dashboard')} />
          <NavButton active={view === 'clients'} label="Clients" icon="users" onClick={() => setView('clients')} />
          <NavButton active={view === 'shopping'} label="Provisions" icon="shop" onClick={() => setView('shopping')} />
          <NavButton active={view === 'prep'} label="Mise" icon="prep" onClick={() => setView('prep')} />
          <NavButton active={view === 'pantry'} label="Stocks" icon="pantry" onClick={() => setView('pantry')} />
          <NavButton active={view === 'menu'} label="Gallery" icon="menu" onClick={() => setView('menu')} />
          <NavButton active={view === 'cookbook'} label="Folio" icon="book" onClick={() => setView('cookbook')} />
        </nav>
      )}
    </div>
  );
}

function NavButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: string, onClick: () => void }) {
  const icons: any = {
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.06 2L4 14h13.31l3.34-9H5.45"/><path d="M20 14a2 2 0 0 1-2 2H9.22a2 2 0 0 1-2-1.6L4 2"/></svg>,
    prep: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z"/></svg>,
    pantry: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M12 2v20"/><path d="M20 12H4"/><path d="M22 7H2"/><path d="M22 17H2"/></svg>,
    menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  };
  return (
    <button 
      className={`relative group flex-1 flex flex-col items-center justify-center gap-1.5 p-2 rounded-full transition-all duration-500 border-none outline-none cursor-pointer ${active ? 'bg-brand-ink text-brand-bg shadow-lg' : 'text-brand-ink/30 hover:text-brand-ink/50'}`} 
      onClick={onClick}
    >
      {/* Tooltip */}
      {!active && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-brand-ink text-brand-bg text-[9px] font-bold uppercase tracking-[0.2em] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl transform translate-y-2 group-hover:translate-y-0">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-x-[5px] border-x-transparent border-t-[5px] border-t-brand-ink"></div>
        </div>
      )}
      
      <div className={`${active ? 'scale-110' : 'scale-90 group-hover:scale-100'} transition-transform duration-500`}>
        {icons[icon]}
      </div>
      {active && <span className="text-[8px] font-bold tracking-[0.15em] uppercase animate-fade-in">{label}</span>}
    </button>
  );
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

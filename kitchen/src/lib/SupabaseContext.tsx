import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Client, Recipe, PantryItem, ChefInfo, Prices } from '../types';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  clients: Client[];
  recipes: Recipe[];
  pantry: PantryItem[];
  chefInfo: ChefInfo;
  prices: Prices;
  stores: any[];
  menuOffers: string[];
  shoppingDone: Record<string, boolean>;
  prepDone: Record<string, boolean>;
  theme: 'light' | 'dark';
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ data: any, error: any }>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  saveClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  savePantryItem: (item: PantryItem) => Promise<void>;
  deletePantryItem: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<ChefInfo & { prices: Prices, stores: any[], menuOffers: string[], shoppingDone: Record<string, boolean>, prepDone: Record<string, boolean>, theme: 'light' | 'dark' }>) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [chefInfo, setChefInfo] = useState<ChefInfo>({ name: '', email: '', phone: '' });
  const [prices, setPrices] = useState<Prices>({});
  const [stores, setStores] = useState<any[]>([]);
  const [menuOffers, setMenuOffers] = useState<string[]>([]);
  const [shoppingDone, setShoppingDone] = useState<Record<string, boolean>>({});
  const [prepDone, setPrepDone] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setRecipes([]);
      setPantry([]);
      setMenuOffers([]);
      setShoppingDone({});
      setPrepDone({});
      setTheme('light');
      return;
    }

    const fetchAll = async () => {
      // Clients
      const { data: clientData } = await supabase.from('clients').select('*');
      if (clientData) {
        setClients(clientData.map(c => ({
          id: c.id,
          name: c.name,
          weeklyRate: c.weekly_rate,
          colorIdx: c.color_idx,
          meals: c.meals,
          notes: c.notes
        } as Client)));
      }

      // Recipes
      const { data: recipeData } = await supabase.from('recipes').select('*');
      if (recipeData) {
        setRecipes(recipeData.map(r => ({
          id: r.id,
          name: r.name,
          day: r.day,
          slot: r.slot,
          desc: r.description,
          emoji: r.emoji,
          ingredients: r.ingredients,
          assembly: r.assembly,
          steps: r.steps,
          utensils: r.utensils,
          batchSize: r.batch_size
        } as Recipe)));
      }

      // Pantry
      const { data: pantryData } = await supabase.from('pantry').select('*');
      if (pantryData) setPantry(pantryData);

      // Settings
      try {
        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').eq('id', user.id).single();
        if (settingsData) {
          const ci = settingsData.chef_info || {};
          setChefInfo({
            name: ci.name || '',
            email: ci.email || '',
            phone: ci.phone || '',
            avatarUrl: ci.avatar_url || ''
          });
          setPrices(settingsData.prices || {});
          setStores(settingsData.stores || []);
          setMenuOffers(settingsData.menu_offers || []);
          setShoppingDone(settingsData.shopping_done || {});
          setPrepDone(settingsData.prep_done || {});
          setTheme(settingsData.theme || 'light');
        } else if (settingsError) {
          console.warn('Settings fetch error:', settingsError.message, settingsError.code);
          if (settingsError.code === 'PGRST116') {
            // If settings record doesn't exist yet, we'll use defaults
            setChefInfo({ name: user.email?.split('@')[0] || 'Chef', email: user.email || '', phone: '' });
            setPrices({});
            setStores([]);
            setMenuOffers([]);
            setShoppingDone({});
            setPrepDone({});
            setTheme('light');
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching settings:', err);
      }
    };

    fetchAll();

    // Set up subscriptions for real-time updates if needed, 
    // but for now we'll just use the fetchAll or implement individual subscribers.
    const clientSub = supabase.channel('clients-all').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchAll).subscribe();
    const recipeSub = supabase.channel('recipes-all').on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, fetchAll).subscribe();
    const pantrySub = supabase.channel('pantry-all').on('postgres_changes', { event: '*', schema: 'public', table: 'pantry' }, fetchAll).subscribe();
    const settingsSub = supabase.channel('settings-all').on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: `id=eq.${user.id}` }, fetchAll).subscribe();

    return () => {
      clientSub.unsubscribe();
      recipeSub.unsubscribe();
      pantrySub.unsubscribe();
      settingsSub.unsubscribe();
    };
  }, [user]);

  const saveClient = async (client: Client) => {
    if (!user) return;
    const { error } = await supabase.from('clients').upsert({
      id: client.id,
      user_id: user.id,
      name: client.name,
      weekly_rate: client.weeklyRate,
      color_idx: client.colorIdx,
      meals: client.meals,
      notes: client.notes,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error saving client:', error);
  };

  const deleteClient = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) console.error('Error deleting client:', error);
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return;
    const { error } = await supabase.from('recipes').upsert({
      id: recipe.id,
      user_id: user.id,
      name: recipe.name,
      day: recipe.day,
      slot: recipe.slot,
      description: recipe.desc,
      emoji: recipe.emoji,
      ingredients: recipe.ingredients,
      assembly: recipe.assembly,
      steps: recipe.steps,
      utensils: recipe.utensils,
      batch_size: recipe.batchSize,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error saving recipe:', error);
  };

  const deleteRecipe = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) console.error('Error deleting recipe:', error);
  };

  const savePantryItem = async (item: PantryItem) => {
    if (!user) return;
    const { error } = await supabase.from('pantry').upsert({
      id: item.id,
      user_id: user.id,
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Error saving pantry item:', error);
  };

  const deletePantryItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('pantry').delete().eq('id', id);
    if (error) console.error('Error deleting pantry item:', error);
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;
    
    // Attempt to upload to 'avatars' bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const logout = async () => { await supabase.auth.signOut(); };

  const updateSettings = async (settings: any) => {
    if (!user) return;

    // Optimistic local state updates for snappier UI
    if (settings.theme) setTheme(settings.theme);
    if (settings.chefInfo) setChefInfo(settings.chefInfo);
    if (settings.prices) setPrices(settings.prices);
    if (settings.stores) setStores(settings.stores);
    if (settings.menuOffers) setMenuOffers(settings.menuOffers);
    if (settings.shoppingDone) setShoppingDone(settings.shoppingDone);
    if (settings.prepDone) setPrepDone(settings.prepDone);

    // Map camelCase to snake_case if necessary for Supabase columns
    const mapped: any = {};
    if (settings.chefInfo) {
      mapped.chef_info = {
        name: settings.chefInfo.name,
        email: settings.chefInfo.email,
        phone: settings.chefInfo.phone,
        avatar_url: settings.chefInfo.avatarUrl
      };
    }
    if (settings.prices !== undefined) mapped.prices = settings.prices;
    if (settings.stores !== undefined) mapped.stores = settings.stores;
    if (settings.menuOffers !== undefined) mapped.menu_offers = settings.menuOffers;
    if (settings.shoppingDone !== undefined) mapped.shopping_done = settings.shoppingDone;
    if (settings.prepDone !== undefined) mapped.prep_done = settings.prepDone;
    if (settings.theme !== undefined) mapped.theme = settings.theme;

    const { error } = await supabase.from('settings').upsert({ id: user.id, ...mapped });
    if (error) {
      console.error('Error updating settings:', error);
      // Revert on error? (Optional, but usually better to just keep trying or notify)
    }
  };

  return (
    <SupabaseContext.Provider value={{
      user, loading, clients, recipes, pantry, chefInfo, prices, stores,
      menuOffers, shoppingDone, prepDone, theme,
      loginWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
      },
      signUpWithEmail: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
      },
      loginAsDemo: async () => {
        // We'll use a hardcoded demo account for testing
        const demoEmail = 'demo@chef-atelier.app';
        const demoPass = 'demo123456';
        
        const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPass });
        
        if (error && error.message.includes('Invalid login credentials')) {
          // If demo account doesn't exist, try to create it
          await supabase.auth.signUp({ email: demoEmail, password: demoPass });
        }
      },
      login: async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); },
      logout,
      uploadAvatar,
      saveClient, deleteClient, saveRecipe, deleteRecipe, savePantryItem, deletePantryItem, updateSettings
    }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within SupabaseProvider');
  return context;
};

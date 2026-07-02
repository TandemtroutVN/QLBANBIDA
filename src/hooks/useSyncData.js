import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import { fetchTables, upsertTable, deleteTable, fetchMenu, upsertMenuItem, deleteMenuItem } from '../supabase/api';
import { DEFAULT_TABLES, DEFAULT_MENU } from '../data/defaults';

function loadLocal(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export default function useSyncData() {
  const [tables, setTables] = useState(() => loadLocal('qlbida_tables', DEFAULT_TABLES));
  const [menu, setMenu] = useState(() => loadLocal('qlbida_menu', DEFAULT_MENU));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    saveLocal('qlbida_tables', tables);
  }, [tables]);

  useEffect(() => {
    saveLocal('qlbida_menu', menu);
  }, [menu]);

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setLoading(false);
      return;
    }
    initData();
    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, payload => {
        if (payload.eventType === 'DELETE') {
          setTables(prev => prev.filter(t => t.id !== payload.old.id));
        } else {
          setTables(prev => {
            const exists = prev.find(t => t.id === payload.new.id);
            if (exists) return prev.map(t => t.id === payload.new.id ? payload.new : t);
            return [...prev, payload.new];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
        if (payload.eventType === 'DELETE') {
          setMenu(prev => prev.filter(m => m.id !== payload.old.id));
        } else {
          setMenu(prev => {
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev.map(m => m.id === payload.new.id ? payload.new : m);
            return [...prev, payload.new];
          });
        }
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    const id = setInterval(async () => {
      try {
        const [t, m] = await Promise.all([fetchTables(), fetchMenu()]);
        if (t) setTables(t);
        if (m) setMenu(m);
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, [connected]);

  async function initData() {
    try {
      const [t, m] = await Promise.all([fetchTables(), fetchMenu()]);
      if (t && t.length > 0) setTables(t);
      if (m && m.length > 0) setMenu(m);
      if (!t || t.length === 0) {
        await Promise.all(DEFAULT_TABLES.map(table => upsertTable(table)));
      }
      if (!m || m.length === 0) {
        await Promise.all(DEFAULT_MENU.map(item => upsertMenuItem(item)));
      }
      setConnected(true);
    } catch (err) {
      setConnected(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleUpsertTable = useCallback(async (table) => {
    if (connected) await upsertTable(table);
    setTables(prev => prev.map(t => t.id === table.id ? table : t));
  }, [connected]);

  const handleDeleteTable = useCallback(async (id) => {
    if (connected) await deleteTable(id);
    setTables(prev => prev.filter(t => t.id !== id));
  }, [connected]);

  const handleUpsertMenu = useCallback(async (item) => {
    if (connected) await upsertMenuItem(item);
    setMenu(prev => prev.map(m => m.id === item.id ? item : m));
  }, [connected]);

  const handleDeleteMenu = useCallback(async (id) => {
    if (connected) await deleteMenuItem(id);
    setMenu(prev => prev.filter(m => m.id !== id));
  }, [connected]);

  return {
    tables, menu, loading, error, connected,
    setTables, setMenu,
    upsertTable: handleUpsertTable,
    deleteTable: handleDeleteTable,
    upsertMenu: handleUpsertMenu,
    deleteMenu: handleDeleteMenu,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase/client';
import { fetchTables, upsertTable, deleteTable, fetchMenu, upsertMenuItem, deleteMenuItem } from '../supabase/api';
import { DEFAULT_TABLES, DEFAULT_MENU } from '../data/defaults';
import { repairSyncedMenu, repairSyncedMenuItem, repairSyncedTable, repairSyncedTables } from '../utils/repairVietnamese';

const TABLES_STORAGE_KEY = 'qlbida_tables_v2';
const MENU_STORAGE_KEY = 'qlbida_menu_v2';

function loadLocal(key, fallback, repair) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const repaired = repair(JSON.parse(stored));
    return Array.isArray(fallback) && !Array.isArray(repaired) ? fallback : repaired;
  } catch { return fallback; }
}

function saveLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export default function useSyncData() {
  const [tables, setTables] = useState(() => loadLocal(TABLES_STORAGE_KEY, DEFAULT_TABLES, repairSyncedTables));
  const [menu, setMenu] = useState(() => loadLocal(MENU_STORAGE_KEY, DEFAULT_MENU, repairSyncedMenu));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    saveLocal(TABLES_STORAGE_KEY, tables);
  }, [tables]);

  useEffect(() => {
    saveLocal(MENU_STORAGE_KEY, menu);
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
          const repairedTable = repairSyncedTable(payload.new);
          setTables(prev => {
            const exists = prev.find(t => t.id === repairedTable.id);
            if (exists) return prev.map(t => t.id === repairedTable.id ? repairedTable : t);
            return [...prev, repairedTable];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
        if (payload.eventType === 'DELETE') {
          setMenu(prev => prev.filter(m => m.id !== payload.old.id));
        } else {
          const repairedItem = repairSyncedMenuItem(payload.new);
          setMenu(prev => {
            const exists = prev.find(m => m.id === repairedItem.id);
            if (exists) return prev.map(m => m.id === repairedItem.id ? repairedItem : m);
            return [...prev, repairedItem];
          });
        }
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function initData() {
    try {
      const [t, m] = await Promise.all([fetchTables(), fetchMenu()]);
      const repairedTables = repairSyncedTables(t);
      const repairedMenu = repairSyncedMenu(m);
      if (repairedTables && repairedTables.length > 0) setTables(repairedTables);
      if (repairedMenu && repairedMenu.length > 0) setMenu(repairedMenu);
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
    const repairedTable = repairSyncedTable(table);
    if (connected) await upsertTable(repairedTable);
    setTables(prev => prev.map(t => t.id === repairedTable.id ? repairedTable : t));
  }, [connected]);

  const handleDeleteTable = useCallback(async (id) => {
    if (connected) await deleteTable(id);
    setTables(prev => prev.filter(t => t.id !== id));
  }, [connected]);

  const handleUpsertMenu = useCallback(async (item) => {
    const repairedItem = repairSyncedMenuItem(item);
    if (connected) await upsertMenuItem(repairedItem);
    setMenu(prev => prev.map(m => m.id === repairedItem.id ? repairedItem : m));
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

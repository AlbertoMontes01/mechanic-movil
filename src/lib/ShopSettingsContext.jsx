import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/api/client";

const ShopSettingsContext = createContext(null);

export function ShopSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await api.entities.ShopSettings.list();
      if (list.length > 0) setSettings(list[0]);
      else setSettings(null);
    } catch (e) {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (data) => {
    if (settings?.id) {
      const updated = await api.entities.ShopSettings.update(settings.id, data);
      setSettings(updated);
      return updated;
    } else {
      const created = await api.entities.ShopSettings.create(data);
      setSettings(created);
      return created;
    }
  }, [settings]);

  return (
    <ShopSettingsContext.Provider value={{ settings, loading, save, refresh: load }}>
      {children}
    </ShopSettingsContext.Provider>
  );
}

export function useShopSettings() {
  const ctx = useContext(ShopSettingsContext);
  if (!ctx) throw new Error("useShopSettings must be used within ShopSettingsProvider");
  return ctx;
}

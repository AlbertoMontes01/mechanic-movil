import React, { useState, useEffect } from "react";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { PageHeader, Loader, Card, Field } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function Settings() {
  const { settings, save, loading, refresh } = useShopSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) setForm({ shop_name: settings.shop_name || "", phone: settings.phone || "", address: settings.address || "", tax_rate: settings.tax_rate ?? 0 });
    else if (!loading) setForm({ shop_name: "", phone: "", address: "", tax_rate: 0 });
  }, [settings, loading]);

  if (loading || !form) return <Loader />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save({ ...form, tax_rate: Number(form.tax_rate) || 0 });
      refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Shop profile used on PDF exports and the app header." />
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <Card className="p-4">
          <Field label="Shop Name *"><input className="input-base" required value={form.shop_name} onChange={(e) => set("shop_name", e.target.value)} /></Field>
        </Card>

        <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone"><input className="input-base" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Default Tax Rate (%)"><input className="input-base" type="number" step="0.01" value={form.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Address"><input className="input-base" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field></div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}</Button>
        </div>
      </form>
    </div>
  );
}

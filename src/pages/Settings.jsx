import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { PageHeader, Loader, Card, Field } from "@/components/shared";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Upload, Save, Wrench } from "lucide-react";

export default function Settings() {
  const { settings, save, loading, refresh } = useShopSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (settings) setForm({ shop_name: settings.shop_name || "", logo_url: settings.logo_url || "", phone: settings.phone || "", address: settings.address || "", tax_rate: settings.tax_rate ?? 0 });
    else if (!loading) setForm({ shop_name: "", logo_url: "", phone: "", address: "", tax_rate: 0 });
  }, [settings, loading]);

  if (loading || !form) return <Loader />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("logo_url", file_url);
    } finally {
      setUploading(false);
    }
  };

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
          <div className="mt-3">
            <span className="field-label">Logo</span>
            <div className="mt-2 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-md bg-primary/15 border border-white/10 overflow-hidden">
                {form.logo_url ? (
                  <Image src={form.logo_url} alt="logo" className="h-full w-full object-cover" fittingType="fill" />
                ) : (
                  <Wrench className="h-7 w-7 text-primary" />
                )}
              </div>
              <label className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer hover:bg-white/5">
                <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
              </label>
              {form.logo_url && <button type="button" onClick={() => set("logo_url", "")} className="text-xs text-red-300 hover:underline">Remove</button>}
            </div>
          </div>
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

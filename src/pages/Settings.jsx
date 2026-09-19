import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { useShopSettings } from "@/lib/ShopSettingsContext";
import { useAuth } from "@/lib/AuthContext";
import { PageHeader, Loader, Card, Field } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { showError, showSuccess } from "@/lib/errorToast";
import { Upload, Save, LogOut, Wrench, User, Star, MessageSquareQuote, CreditCard } from "lucide-react";

const SUBSCRIPTION_LABELS = {
  on_trial: "Free trial",
  active: "Active",
  past_due: "Payment failed",
  unpaid: "Payment failed",
  cancelled: "Cancelled",
  expired: "Expired",
  paused: "Paused",
};

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function subscriptionDetail(sub) {
  const card = sub.card_last_four ? ` Card ending in ${sub.card_last_four}.` : "";
  if (sub.status === "on_trial" && sub.trial_ends_at) return `Your trial ends on ${fmtDate(sub.trial_ends_at)}, then $10/month.${card}`;
  if (sub.status === "active" && sub.renews_at) return `Renews on ${fmtDate(sub.renews_at)} for $10/month.${card}`;
  if (sub.status === "cancelled" && sub.ends_at) return `You keep access until ${fmtDate(sub.ends_at)}.`;
  if (sub.status === "past_due" || sub.status === "unpaid") return "Your last payment didn't go through. Update your card to keep using PitStop.";
  return "Manage your billing details, invoices and cancellation.";
}

export default function Settings() {
  const { settings, save, loading, refresh } = useShopSettings();
  const { user, logout, checkUserAuth } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [testimonial, setTestimonial] = useState({ rating: 5, comment: "", authorName: "" });
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  useEffect(() => {
    if (settings) setForm({ shop_name: settings.shop_name || "", logo_url: settings.logo_url || "", phone: settings.phone || "", address: settings.address || "", tax_rate: settings.tax_rate ?? 0, invoice_terms: settings.invoice_terms || "" });
    else if (!loading) setForm({ shop_name: "", logo_url: "", phone: "", address: "", tax_rate: 0, invoice_terms: "" });
  }, [settings, loading]);

  const [sub, setSub] = useState(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  useEffect(() => {
    api.billing.getSubscription().then(setSub).catch(() => {});
  }, []);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [changingSub, setChangingSub] = useState(false);

  const changeSubscription = async (action, successMessage) => {
    setChangingSub(true);
    try {
      await action();
      setSub(await api.billing.getSubscription());
      setCancelOpen(false);
      showSuccess(successMessage);
    } catch (err) {
      showError(err, "Could not update your subscription. Please try again.");
    } finally {
      setChangingSub(false);
    }
  };

  // Coming back with the browser's Back button restores this page from
  // memory with the "Opening…" state still set -- reset it.
  useEffect(() => {
    const onShow = (e) => e.persisted && setOpeningPortal(false);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await api.billing.getPortalUrl();
      window.location.href = url;
    } catch (err) {
      showError(err, "Could not open your billing page.");
      setOpeningPortal(false);
    }
  };

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  useEffect(() => {
    api.testimonials.getMine().then((t) => {
      if (t) setTestimonial({ rating: t.rating, comment: t.comment, authorName: t.author_name === "Verified PitStop user" ? "" : t.author_name });
    }).catch(() => {});
  }, []);

  if (loading || !form) return <Loader />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await api.auth.updateProfile({ name });
      await checkUserAuth();
      showSuccess("Name saved");
    } catch (err) {
      showError(err, "Could not save your name.");
    } finally {
      setSavingName(false);
    }
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();
    setSavingTestimonial(true);
    try {
      const saved = await api.testimonials.save(testimonial);
      setTestimonial({ rating: saved.rating, comment: saved.comment, authorName: saved.author_name === "Verified PitStop user" ? "" : saved.author_name });
      showSuccess("Testimonial saved — thanks for the feedback!");
    } catch (err) {
      showError(err, "Could not save your testimonial.");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await api.integrations.Core.UploadPublicFile({ file });
      set("logo_url", file_url);
      showSuccess("Logo uploaded");
    } catch (err) {
      showError(err, "Could not upload this logo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save({ ...form, tax_rate: Number(form.tax_rate) || 0 });
      refresh();
      showSuccess("Settings saved");
    } catch (err) {
      showError(err, "Could not save shop settings.");
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
            <p className="text-xs text-muted-foreground/70 mt-0.5 mb-2">Appears on the invoices and work orders you export as PDF.</p>
            <div className="mt-2 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-md bg-primary/15 border border-white/10 overflow-hidden shrink-0">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Shop logo" className="h-full w-full object-cover" />
                ) : (
                  <Wrench className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm cursor-pointer hover:bg-white/5">
                  <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload logo"}
                  <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={onLogo} disabled={uploading} />
                </label>
                {form.logo_url && <button type="button" onClick={() => set("logo_url", "")} className="text-xs text-red-300 hover:underline">Remove</button>}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone"><input className="input-base" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="Default Tax Rate (%)"><input className="input-base" type="number" step="0.01" value={form.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} /></Field>
          <div className="col-span-2"><Field label="Address"><input className="input-base" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field></div>
        </Card>

        <Card className="p-4">
          <Field label="Invoice Terms" hint="Printed on every invoice PDF -- warranty policy, payment terms, anything that applies to all of them. Use the Note field on a specific invoice for anything just about that job.">
            <textarea
              className="input-base min-h-[90px]"
              placeholder="e.g. Parts carry manufacturer warranty. Labor warranty is 90 days and covers workmanship only..."
              value={form.invoice_terms}
              onChange={(e) => set("invoice_terms", e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Settings"}</Button>
        </div>
      </form>

      <Card className="max-w-lg p-4 mt-6">
        <p className="field-label mb-2">Your Name</p>
        <p className="text-xs text-muted-foreground/70 mb-2">Used as the default Technician on new work orders.</p>
        <form onSubmit={submitName} className="flex gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input className="input-base pl-9" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" disabled={savingName || !name.trim()} className="gap-1.5"><Save className="h-4 w-4" /> {savingName ? "Saving…" : "Save"}</Button>
        </form>
      </Card>

      <Card className="max-w-lg p-4 mt-6">
        <p className="field-label mb-2 flex items-center gap-1.5"><MessageSquareQuote className="h-4 w-4" /> Leave a Testimonial</p>
        <p className="text-xs text-muted-foreground/70 mb-3">Shown publicly on the PitStop landing page. Your email and login are never shown.</p>
        <form onSubmit={submitTestimonial} className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTestimonial((t) => ({ ...t, rating: n }))}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star
                  className={n <= testimonial.rating ? "h-6 w-6 text-primary" : "h-6 w-6 text-muted-foreground/30"}
                  fill={n <= testimonial.rating ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <Field label="Your testimonial">
            <textarea
              className="input-base min-h-[80px]"
              placeholder="What's PitStop done for your shop?"
              value={testimonial.comment}
              onChange={(e) => setTestimonial((t) => ({ ...t, comment: e.target.value }))}
              maxLength={1000}
            />
          </Field>
          <Field label="Display name (optional)" hint={'e.g. "Alberto M., Miami FL" -- leave blank to show as "Verified PitStop user".'}>
            <input
              className="input-base"
              placeholder="Verified PitStop user"
              value={testimonial.authorName}
              onChange={(e) => setTestimonial((t) => ({ ...t, authorName: e.target.value }))}
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={savingTestimonial || !testimonial.comment.trim()} className="gap-1.5">
              <Save className="h-4 w-4" /> {savingTestimonial ? "Saving…" : "Save Testimonial"}
            </Button>
          </div>
        </form>
      </Card>

      {sub && SUBSCRIPTION_LABELS[sub.status] && (
        <Card className="max-w-lg p-4 mt-6">
          <p className="field-label mb-2 flex items-center gap-1.5"><CreditCard className="h-4 w-4" /> Subscription</p>
          <p className="text-sm text-foreground">{SUBSCRIPTION_LABELS[sub.status]}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{subscriptionDetail(sub)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sub.status === "cancelled" && sub.ends_at && new Date(sub.ends_at) > new Date() && (
              <Button type="button" onClick={() => changeSubscription(api.billing.resumeSubscription, "Your subscription is active again.")} disabled={changingSub}>
                {changingSub ? "Resuming…" : "Resume subscription"}
              </Button>
            )}
            {["on_trial", "active", "past_due", "unpaid", "paused"].includes(sub.status) && (
              <Button type="button" variant="outline" onClick={() => setCancelOpen(true)}>
                Cancel subscription
              </Button>
            )}
            <Button type="button" variant="outline" onClick={openPortal} disabled={openingPortal}>
              {openingPortal ? "Opening…" : "Update card & invoices"}
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={cancelOpen} onOpenChange={(o) => !changingSub && setCancelOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              You'll keep full access until{" "}
              <span className="text-foreground font-medium">
                {sub && (sub.status === "on_trial" ? sub.trial_ends_at : sub.renews_at) ? fmtDate(sub.status === "on_trial" ? sub.trial_ends_at : sub.renews_at) : "the end of your current period"}
              </span>
              , and you won't be charged again.
            </p>
            <p>Your clients, vehicles, work orders and invoices stay saved. You can resubscribe any time.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)} disabled={changingSub}>
              Keep my subscription
            </Button>
            <Button type="button" onClick={() => changeSubscription(api.billing.cancelSubscription, "Your subscription was cancelled.")} disabled={changingSub} className="bg-red-600 hover:bg-red-700 text-white">
              {changingSub ? "Cancelling…" : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="max-w-lg p-4 mt-6">
        <p className="field-label mb-2">Account</p>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </Card>

      <p className="max-w-lg text-xs text-muted-foreground/70 mt-4 text-center">
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        {" · "}
        <Link to="/terms" className="hover:underline">Terms of Service</Link>
      </p>
    </div>
  );
}

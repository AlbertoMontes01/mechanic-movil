import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";

// Landing spot for the global 402 handler in api/client.js -- reached by an
// authenticated user whose account has no usable Lemon Squeezy subscription
// (trial ended, payment never recovered, cancelled). Deliberately outside
// the protected app shell (Layout), since nothing in there would load
// anyway.
export default function Subscribe() {
  const { isAuthenticated, isLoadingAuth, authChecked, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (authChecked && !isLoadingAuth && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authChecked, isLoadingAuth, isAuthenticated, navigate]);

  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const { url } = await api.billing.createCheckout();
      window.location.href = url;
    } catch (err) {
      // 409 from POST /api/checkout: a subscription already exists on this
      // account, so sending them to a new checkout would double-bill them.
      if (err.message === "already_subscribed") setHasSubscription(true);
      setError(
        err.message === "already_subscribed"
          ? "You already have a PitStop subscription, so we can't start a new one. If you're locked out, your payment may need attention. Update your card or manage your subscription below."
          : err.message || "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await api.billing.getPortalUrl();
      window.location.href = url;
    } catch (err) {
      setError("Could not open your billing page. Please try again or contact support.");
      setOpeningPortal(false);
    }
  };

  return (
    <AuthLayout
      icon={CreditCard}
      title="Reactivate your subscription"
      subtitle="Subscribe to keep using PitStop"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <p className="text-sm text-muted-foreground mb-6">
        Your clients, vehicles, and invoices are all still here — subscribe for $10/month to keep using PitStop.
      </p>
      <Button onClick={handleSubscribe} className="w-full h-12 font-medium" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting...
          </>
        ) : (
          "Subscribe now"
        )}
      </Button>
      {hasSubscription && (
        <Button onClick={openPortal} variant="outline" className="mt-3 w-full h-12 font-medium" disabled={openingPortal}>
          {openingPortal ? "Opening..." : "Manage subscription"}
        </Button>
      )}
      <button
        onClick={logout}
        className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Log out
      </button>
    </AuthLayout>
  );
}

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
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={CreditCard}
      title="Reactivate your subscription"
      subtitle="Your trial ended or your last payment didn't go through"
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
      <button
        onClick={logout}
        className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Log out
      </button>
    </AuthLayout>
  );
}

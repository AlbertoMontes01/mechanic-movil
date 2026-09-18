import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
// Pricing hidden from the landing for now -- uncomment this import and the
// <Pricing /> line below (in that order) to bring the pricing section back.
// import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  useEffect(() => {
    if (authChecked && !isLoadingAuth && isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [authChecked, isLoadingAuth, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Problem />
        <Features />
        <Testimonials />
        {/* <Pricing /> */}
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

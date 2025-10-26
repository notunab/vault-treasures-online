import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShoppingCart, User, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <KeyRound className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-playfair gold-shimmer">
                Vintage Vault
              </h1>
              <p className="text-xs text-muted-foreground font-cormorant">
                Where Time Meets Treasure
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/categories" className="text-sm hover:text-primary transition-colors">
              Categories
            </Link>
            <Link to="/auctions" className="text-sm hover:text-primary transition-colors">
              Live Auctions
            </Link>
            <Link to="/my-bids" className="text-sm hover:text-primary transition-colors">
              My Bids
            </Link>
            <Link to="/celebrity" className="text-sm hover:text-primary transition-colors">
              Celebrity Items
            </Link>
            <Link to="/verify" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Verify
            </Link>
            <Link to="/about" className="text-sm hover:text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {session ? (
              <>
                <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                  <User className="h-5 w-5" />
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default" size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
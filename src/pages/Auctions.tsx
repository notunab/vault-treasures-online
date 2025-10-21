import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Hammer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Auctions = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

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

  // Fetch live and upcoming auctions
  const { data: auctionItems = [], isLoading } = useQuery({
    queryKey: ["auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*, bids(count)")
        .eq("is_auction", true)
        .in("auction_status", ["live", "upcoming"])
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const getTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const distance = end - now;

    if (distance < 0) return "ENDED";

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleJoinAuction = (itemId: string) => {
    if (!session) {
      toast.error("Please sign in to join the auction");
      navigate("/auth");
      return;
    }
    navigate(`/auction/${itemId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-playfair mb-4 gold-shimmer">
            Live Auctions
          </h1>
          <p className="text-xl font-cormorant text-muted-foreground">
            Place your bids on authentic vintage treasures
          </p>
        </div>

        {auctionItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No live auctions at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctionItems.map((item) => {
              const timeLeft = item.end_time ? getTimeLeft(item.end_time) : "TBD";
              const isLive = item.auction_status === "live";
              
              return (
                <Card key={item.id} className="vintage-border hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={isLive ? "destructive" : "secondary"} 
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {timeLeft}
                      </Badge>
                      {item.verified && (
                        <Badge className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-playfair">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-3xl font-bold font-cormorant text-primary">
                        ₹{(item.current_bid || item.price).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleJoinAuction(item.id)}
                      className="w-full"
                      variant={isLive ? "default" : "outline"}
                    >
                      <Hammer className="mr-2 h-4 w-4" />
                      {isLive ? "Join Live Auction" : "View Auction"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;
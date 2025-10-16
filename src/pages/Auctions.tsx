import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Hammer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

  // Mock auction items (in real app, fetch from database)
  const auctionItems = [
    {
      id: 1,
      name: "1920s Art Deco Diamond Ring",
      currentBid: 4500,
      minBid: 4600,
      timeLeft: "1h 23m",
      verified: true,
      bids: 12,
    },
    {
      id: 2,
      name: "Vintage Rolex Submariner",
      currentBid: 15000,
      minBid: 15500,
      timeLeft: "3h 45m",
      verified: true,
      bids: 28,
    },
    {
      id: 3,
      name: "Signed Beatles Album",
      currentBid: 8200,
      minBid: 8500,
      timeLeft: "5h 12m",
      verified: true,
      bids: 19,
    },
  ];

  const handlePlaceBid = (itemId: number, minBid: number) => {
    if (!session) {
      toast.error("Please sign in to place a bid");
      navigate("/auth");
      return;
    }
    
    // In real app, would process bid through database
    toast.success(`Bid placed successfully for $${minBid}!`);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctionItems.map((item) => (
            <Card key={item.id} className="vintage-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeLeft}
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
                <div>
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-3xl font-bold font-cormorant text-primary">
                    ${item.currentBid.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.bids} bids placed
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Bid (min ${item.minBid.toLocaleString()})
                  </p>
                  <Input
                    type="number"
                    min={item.minBid}
                    placeholder={item.minBid.toString()}
                    className="font-cormorant"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handlePlaceBid(item.id, item.minBid)}
                  className="w-full"
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  Place Bid
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auctions;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Hammer, TrendingUp, Users } from "lucide-react";

const LiveAuction = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch auction item details
  const { data: item, refetch: refetchItem } = useQuery({
    queryKey: ["auction-item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });

  // Fetch all bids for this item
  const { data: bids = [], refetch: refetchBids } = useQuery({
    queryKey: ["auction-bids", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, profiles(full_name)")
        .eq("item_id", itemId)
        .order("amount", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!itemId,
  });

  // Subscribe to real-time bid updates and item changes
  useEffect(() => {
    if (!itemId) return;

    const channel = supabase
      .channel(`auction-${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          console.log("New bid received:", payload);
          refetchBids();
          refetchItem();
          
          // Only show toast if it's not the current user's bid
          if (payload.new.user_id !== session?.user?.id) {
            toast.success("New bid placed!", {
              description: `${payload.new.bidder_name} placed a bid of ₹${payload.new.amount.toLocaleString()}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "items",
          filter: `id=eq.${itemId}`,
        },
        (payload) => {
          console.log("Item updated:", payload);
          refetchItem();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, session, refetchBids, refetchItem]);

  // Countdown timer
  useEffect(() => {
    if (!item?.end_time) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(item.end_time).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("ENDED");
        clearInterval(interval);
        
        // Check if current user is the winner
        if (bids.length > 0 && session?.user?.id === bids[0].user_id) {
          toast.success("Congratulations! You won the auction!", {
            description: "Proceeding to payment...",
            duration: 5000,
          });
          setTimeout(() => navigate(`/item/${itemId}`), 3000);
        }
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [item, bids, session, navigate, itemId]);

  const handlePlaceBid = async () => {
    if (!session) {
      toast.error("Please sign in to place a bid");
      navigate("/auth");
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const currentBid = item?.current_bid || 0;
    const minIncrement = item?.min_bid_increment || 50;
    const minBid = currentBid + minIncrement;

    if (bidValue < minBid) {
      toast.error(`Minimum bid is ₹${minBid.toLocaleString()}`);
      return;
    }

    try {
      // Get user profile for bidder name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      // Insert bid
      const { error: bidError } = await supabase.from("bids").insert({
        item_id: itemId,
        user_id: session.user.id,
        amount: bidValue,
        bidder_name: profile?.full_name || "Anonymous",
      });

      if (bidError) throw bidError;

      // Update item's current bid
      const { error: updateError } = await supabase
        .from("items")
        .update({ current_bid: bidValue })
        .eq("id", itemId);

      if (updateError) throw updateError;

      toast.success("Bid placed successfully!");
      setBidAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to place bid");
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center">Loading auction...</p>
        </div>
      </div>
    );
  }

  const highestBid = bids[0];
  const minNextBid = (item.current_bid || item.price) + (item.min_bid_increment || 50);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Auction Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-playfair gold-shimmer">
                    {item.name}
                  </CardTitle>
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    <Clock className="mr-2 h-5 w-5" />
                    {timeLeft}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Current Bid Section */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Highest Bid</p>
                      <p className="text-4xl font-bold font-cormorant text-primary">
                        ₹{(item.current_bid || item.price).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-primary" />
                  </div>

                  {highestBid && (
                    <div className="flex items-center gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {highestBid.bidder_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">
                        Leading: <span className="font-semibold">{highestBid.bidder_name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Place Bid Section */}
                {timeLeft !== "ENDED" && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Minimum next bid: ₹{minNextBid.toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder={`Enter bid (min ₹${minNextBid})`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={minNextBid}
                          step={item.min_bid_increment || 50}
                        />
                        <Button onClick={handlePlaceBid} size="lg">
                          <Hammer className="mr-2 h-5 w-5" />
                          Place Bid
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bid History Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Live Bid Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bids.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No bids yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bids.map((bid, index) => (
                      <div
                        key={bid.id}
                        className={`p-3 rounded-lg ${
                          index === 0
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {bid.bidder_name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">
                                {bid.bidder_name}
                                {index === 0 && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Leading
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(bid.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">
                            ₹{bid.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Auction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Bid:</span>
                  <span className="font-semibold">₹{item.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Increment:</span>
                  <span className="font-semibold">
                    ₹{item.min_bid_increment?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Bids:</span>
                  <span className="font-semibold">{bids.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuction;
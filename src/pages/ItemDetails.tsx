import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Clock, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handlePlaceBid = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please sign in to place a bid", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= (item?.current_bid || item?.price || 0)) {
      toast({
        title: "Invalid bid amount",
        description: "Bid must be higher than current bid",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("bids").insert({
      item_id: itemId,
      user_id: session.user.id,
      amount,
    });

    if (error) {
      toast({ title: "Error placing bid", variant: "destructive" });
    } else {
      await supabase
        .from("items")
        .update({ current_bid: amount })
        .eq("id", itemId);
      
      toast({ title: "Bid placed successfully!" });
      setBidAmount("");
    }
  };

  const handleBuyNow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please sign in to buy", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      user_id: session.user.id,
      item_id: itemId,
      price: item?.price,
    });

    if (error) {
      toast({ title: "Error creating order", variant: "destructive" });
    } else {
      toast({ title: "Order created! Proceed to payment." });
      navigate("/cart");
    }
  };

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please sign in to add to cart", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_id: session.user.id,
      item_id: itemId,
      quantity: 1,
    });

    if (error) {
      toast({ title: "Error adding to cart", variant: "destructive" });
    } else {
      toast({ title: "Added to cart!" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          Loading item details...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-playfair mb-4">Item not found</h1>
          <Button onClick={() => navigate("/categories")}>Back to Categories</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div
              className="h-[500px] rounded-lg bg-cover bg-center vintage-border"
              style={{
                backgroundImage: item.image_url
                  ? `url(${item.image_url})`
                  : "url(/placeholder.svg)",
              }}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold font-playfair gold-shimmer">
                  {item.name}
                </h1>
                {item.verified && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xl font-cormorant text-muted-foreground">
                {item.description}
              </p>
            </div>

            {item.celebrity_name && (
              <Card className="vintage-border">
                <CardHeader>
                  <CardTitle className="font-playfair text-lg">
                    Celebrity Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-cormorant">
                    Previously owned by <strong>{item.celebrity_name}</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            {item.certificate_id && (
              <Card className="vintage-border">
                <CardHeader>
                  <CardTitle className="font-playfair text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Certificate of Authenticity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-cormorant">
                    Certificate ID: <strong>{item.certificate_id}</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="vintage-border">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold font-playfair gold-shimmer mb-4">
                  ${item.current_bid || item.price}
                </div>

                {item.is_auction ? (
                  <div className="space-y-4">
                    {item.end_time && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                        <span className="font-cormorant">
                          Auction ends: {new Date(item.end_time).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter bid amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                      />
                      <Button onClick={handlePlaceBid}>Place Bid</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleBuyNow}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Buy Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </Button>
                  </div>
                )}

                <Button variant="outline" className="w-full mt-3">
                  <Heart className="h-5 w-5 mr-2" />
                  Save for Later
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;

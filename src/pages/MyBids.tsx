import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserBids, useUserWonItems } from "@/hooks/useBids";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Clock, DollarSign } from "lucide-react";

const MyBids = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: bids = [], isLoading: bidsLoading } = useUserBids(session?.user?.id);
  const { data: wonItems = [], isLoading: wonLoading } = useUserWonItems(session?.user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-playfair gold-shimmer mb-2">My Bids & Wins</h1>
          <p className="text-muted-foreground">Track your bidding activity and won auctions</p>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="active">Active Bids</TabsTrigger>
            <TabsTrigger value="won">Won Items</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {bidsLoading ? (
              <p className="text-center py-8">Loading your bids...</p>
            ) : bids.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't placed any bids yet.</p>
                  <Button className="mt-4" onClick={() => navigate("/auctions")}>
                    Browse Auctions
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bids.map((bid: any) => (
                  <Card key={bid.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {bid.item?.image_url && (
                          <img
                            src={bid.item.image_url}
                            alt={bid.item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{bid.item?.name}</h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Your bid: ₹{bid.amount.toLocaleString()}
                            </span>
                            <Badge
                              variant={
                                bid.item?.highest_bidder === session?.user?.id
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {bid.item?.highest_bidder === session?.user?.id
                                ? "Leading"
                                : "Outbid"}
                            </Badge>
                          </div>
                          {bid.item?.auction_status === "live" && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Current highest: ₹{bid.item.highest_bid?.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => navigate(`/auction/${bid.item?.id}`)}
                          variant="outline"
                        >
                          View Auction
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="won" className="mt-6">
            {wonLoading ? (
              <p className="text-center py-8">Loading won items...</p>
            ) : wonItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't won any auctions yet.</p>
                  <Button className="mt-4" onClick={() => navigate("/auctions")}>
                    Browse Auctions
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {wonItems.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                          </div>
                          <p className="text-sm">
                            Winning bid: ₹{item.highest_bid?.toLocaleString()}
                          </p>
                        </div>
                        <Button onClick={() => navigate(`/checkout/${item.id}`)}>
                          Proceed to Checkout
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyBids;

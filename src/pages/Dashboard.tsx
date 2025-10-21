import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Package, Hammer, Settings, Gavel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return false;
      
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      return data?.role === "admin";
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center font-cormorant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Mock data (in real app, fetch from database)
  const myListings = [
    {
      id: 1,
      name: "Vintage Camera",
      status: "pending",
      price: 450,
    },
  ];

  const myOrders = [
    {
      id: 1,
      name: "Victorian Gold Pocket Watch",
      status: "completed",
      price: 2500,
      date: "2024-12-10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold font-playfair gold-shimmer">
              My Dashboard
            </h1>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate("/create-auction")} size="lg">
              <Gavel className="mr-2 h-5 w-5" />
              Create Auction
            </Button>
          )}
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="listings">
              <Package className="h-4 w-4 mr-2" />
              My Listings
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Hammer className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-playfair">My Listings</h2>
                <Button onClick={() => navigate("/list-item")}>
                  List New Item
                </Button>
              </div>

              {myListings.length === 0 ? (
                <Card className="vintage-border">
                  <CardContent className="py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-cormorant mb-4">
                      You haven't listed any items yet
                    </p>
                    <Button onClick={() => navigate("/list-item")}>
                      List Your First Item
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myListings.map((item) => (
                  <Card key={item.id} className="vintage-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold font-playfair text-lg">
                            {item.name}
                          </h3>
                          <p className="text-primary font-cormorant text-xl">
                            ${item.price}
                          </p>
                        </div>
                        <Badge variant={item.status === "pending" ? "secondary" : "default"}>
                          {item.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <h2 className="text-2xl font-bold font-playfair mb-4">My Orders</h2>
            <div className="space-y-4">
              {myOrders.map((order) => (
                <Card key={order.id} className="vintage-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold font-playfair text-lg">
                          {order.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-cormorant">
                          Ordered on {order.date}
                        </p>
                        <p className="text-primary font-cormorant text-xl mt-1">
                          ${order.price.toLocaleString()}
                        </p>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="vintage-border">
              <CardHeader>
                <CardTitle className="font-playfair">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-cormorant">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-bold">{session.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-bold">
                    {new Date(session.user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
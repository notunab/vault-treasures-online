import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CategoryItems = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const categoryNames: Record<string, string> = {
    antiques: "Antiques",
    celebrity: "Celebrity Memorabilia",
    fashion: "Designer Fashion",
    jewelry: "Fine Jewelry",
    art: "Art & Collectibles",
    cameras: "Vintage Cameras",
    garments: "Vintage Garments",
    makeup: "Vintage Makeup",
    watches: "Luxury Watches",
    home_decor: "Home Decor",
    books: "Rare Books",
    music: "Music Collectibles",
  };

  const { data: items, isLoading } = useQuery({
    queryKey: ["category-items", categoryId, verifiedOnly, sortBy],
    queryFn: async () => {
      if (!categoryId) return [];
      
      let query = supabase
        .from("items")
        .select("*")
        .eq("category", categoryId as any);

      if (verifiedOnly) {
        query = query.eq("verified", true);
      }

      if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredItems = items?.filter(
    (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
  );

  const handleSaveForLater = async (itemId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Please sign in to save items", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("cart").insert({
      user_id: session.user.id,
      item_id: itemId,
      quantity: 0,
    });

    if (error) {
      toast({ title: "Error saving item", variant: "destructive" });
    } else {
      toast({ title: "Item saved for later!" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold font-playfair mb-8 gold-shimmer text-center">
          {categoryNames[categoryId || ""] || "Category Items"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="vintage-border sticky top-24">
              <CardHeader>
                <CardTitle className="font-playfair">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-cormorant text-lg mb-3 block">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-cormorant text-lg mb-3 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </Label>
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-cormorant text-lg">Verified Only</Label>
                  <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">Loading items...</div>
            ) : filteredItems && filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-xl transition-all vintage-border group overflow-hidden"
                  >
                    <div
                      className="h-64 bg-cover bg-center cursor-pointer"
                      style={{
                        backgroundImage: item.image_url
                          ? `url(${item.image_url})`
                          : "url(/placeholder.svg)",
                      }}
                      onClick={() => navigate(`/items/${item.id}`)}
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-playfair text-xl">
                          {item.name}
                        </CardTitle>
                        {item.verified && (
                          <Badge variant="secondary" className="ml-2">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-cormorant line-clamp-2">
                        {item.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold font-playfair gold-shimmer">
                        ${item.price}
                      </div>
                      {item.is_auction && item.end_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Clock className="h-4 w-4" />
                          Ends: {new Date(item.end_time).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      {item.is_auction ? (
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/items/${item.id}`)}
                        >
                          Place Bid
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => navigate(`/items/${item.id}`)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSaveForLater(item.id)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save for Later
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl font-cormorant text-muted-foreground">
                  No items found in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryItems;

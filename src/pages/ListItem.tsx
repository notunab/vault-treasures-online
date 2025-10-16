import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { z } from "zod";

const listingSchema = z.object({
  name: z.string().trim().min(3, "Name too short").max(200),
  description: z.string().trim().min(10, "Description too short").max(2000),
  price: z.number().min(1, "Price must be at least $1").max(1000000),
  category: z.enum(["antiques", "celebrity", "fashion", "jewelry", "art"]),
  celebrityName: z.string().max(100).optional(),
});

const ListItem = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    isAuction: false,
    celebrityName: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Please sign in to list an item");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Validate input
      const validated = listingSchema.parse({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        celebrityName: formData.celebrityName || undefined,
      });

      // Insert into database
      const { error } = await supabase.from("items").insert({
        name: validated.name,
        description: validated.description,
        category: validated.category,
        price: validated.price,
        is_auction: formData.isAuction,
        celebrity_name: validated.celebrityName,
        seller_id: session.user.id,
        verified: false, // Requires admin approval
      });

      if (error) throw error;

      toast.success("Item submitted for verification! Our experts will review it soon.");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit item");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-playfair mb-4 gold-shimmer">
              List Your Vintage Treasure
            </h1>
            <p className="text-lg font-cormorant text-muted-foreground">
              Submit your item for expert verification and listing
            </p>
          </div>

          <Card className="vintage-border">
            <CardHeader>
              <CardTitle className="font-playfair">Item Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Victorian Gold Pocket Watch"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Provide detailed description including condition, history, and provenance..."
                    rows={5}
                    required
                    maxLength={2000}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="antiques">Antiques</SelectItem>
                        <SelectItem value="celebrity">Celebrity Memorabilia</SelectItem>
                        <SelectItem value="fashion">Vintage Fashion</SelectItem>
                        <SelectItem value="jewelry">Fine Jewelry</SelectItem>
                        <SelectItem value="art">Art & Collectibles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {formData.category === "celebrity" && (
                  <div className="space-y-2">
                    <Label htmlFor="celebrity">Celebrity Name</Label>
                    <Input
                      id="celebrity"
                      value={formData.celebrityName}
                      onChange={(e) =>
                        setFormData({ ...formData, celebrityName: e.target.value })
                      }
                      placeholder="e.g., Marilyn Monroe"
                      maxLength={100}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label htmlFor="auction" className="font-bold">
                      Enable Auction
                    </Label>
                    <p className="text-sm text-muted-foreground font-cormorant">
                      Allow buyers to place bids on this item
                    </p>
                  </div>
                  <Switch
                    id="auction"
                    checked={formData.isAuction}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isAuction: checked })
                    }
                  />
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-cormorant text-muted-foreground mb-2">
                    Image upload coming soon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For now, our team will handle photography after verification
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-cormorant text-muted-foreground">
                    <strong>Note:</strong> All items must be verified by our expert team
                    before appearing on the marketplace. This typically takes 2-3 business
                    days. We'll contact you via email if we need additional information.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
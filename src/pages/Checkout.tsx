import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AddressForm from "@/components/AddressForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserAddresses, useCreateAddress } from "@/hooks/useAddresses";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Plus } from "lucide-react";
import { Address } from "@/services/addresses";

const Checkout = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });
  }, [navigate]);

  const { data: item } = useQuery({
    queryKey: ["checkout-item", itemId],
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

  const { data: addresses = [] } = useUserAddresses(session?.user?.id);
  const createAddressMutation = useCreateAddress();

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr: any) => addr.is_default);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handleAddAddress = (address: Address) => {
    createAddressMutation.mutate(
      { ...address, user_id: session?.user?.id },
      {
        onSuccess: () => {
          setShowAddressForm(false);
        },
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    try {
      const { error } = await supabase.from("orders").insert({
        user_id: session?.user?.id,
        item_id: itemId,
        address_id: selectedAddressId,
        price: item.highest_bid || item.price,
        total_amount: item.highest_bid || item.price,
        payment_status: "pending",
        order_status: "pending",
      });

      if (error) throw error;

      toast.success("Order placed successfully!");
      navigate("/my-bids");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    }
  };

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-playfair gold-shimmer mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Address
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showAddressForm ? (
                  <AddressForm
                    onSubmit={handleAddAddress}
                    onCancel={() => setShowAddressForm(false)}
                    isLoading={createAddressMutation.isPending}
                  />
                ) : addresses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No saved addresses. Please add a delivery address.
                  </p>
                ) : (
                  <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    {addresses.map((address: any) => (
                      <div
                        key={address.id}
                        className="flex items-start space-x-3 border rounded-lg p-4"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                          <p className="font-semibold">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.line1}
                            {address.line2 && `, ${address.line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Item Price</span>
                    <span className="font-semibold">
                      ₹{(item.highest_bid || item.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">FREE</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      ₹{(item.highest_bid || item.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId}
                >
                  Place Order (Cash on Delivery)
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

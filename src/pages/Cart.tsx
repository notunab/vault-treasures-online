import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  
  // Mock cart items (in real app, fetch from database)
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Victorian Gold Pocket Watch",
      price: 2500,
      quantity: 1,
    },
    {
      id: 2,
      name: "Art Deco Diamond Ring",
      price: 4500,
      quantity: 1,
    },
  ]);

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    toast.success("Proceeding to checkout...");
    // In real app, navigate to checkout page
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold font-playfair gold-shimmer">
              Shopping Cart
            </h1>
          </div>

          {cartItems.length === 0 ? (
            <Card className="vintage-border">
              <CardContent className="py-16 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold font-playfair mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground font-cormorant mb-6">
                  Discover timeless treasures in our collections
                </p>
                <Button onClick={() => navigate("/categories")}>
                  Browse Categories
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="vintage-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold font-playfair text-lg mb-1">
                            {item.name}
                          </h3>
                          <p className="text-2xl font-cormorant text-primary">
                            ${item.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <Card className="vintage-border sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-playfair">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between font-cormorant text-lg">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-cormorant text-lg">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-bold font-playfair text-xl">
                        <span>Total:</span>
                        <span className="text-primary">${total.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button onClick={handleCheckout} className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                    <Button
                      onClick={() => navigate("/categories")}
                      variant="outline"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
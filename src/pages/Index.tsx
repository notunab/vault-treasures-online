import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Clock, Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import watchImg from "@/assets/watch.jpg";
import jewelryImg from "@/assets/jewelry.jpg";
import celebrityImg from "@/assets/celebrity-item.jpg";

const Index = () => {
  const navigate = useNavigate();

  const featuredItems = [
    {
      id: 1,
      name: "Victorian Gold Pocket Watch",
      price: 2500,
      currentBid: 1800,
      image: watchImg,
      category: "Antiques",
      isAuction: true,
      timeLeft: "2h 15m",
    },
    {
      id: 2,
      name: "Royal Ruby Necklace",
      price: 8500,
      image: jewelryImg,
      category: "Jewelry",
      isAuction: false,
      verified: true,
    },
    {
      id: 3,
      name: "Hollywood Legend's Autograph",
      price: 3200,
      currentBid: 2400,
      image: celebrityImg,
      category: "Celebrity",
      isAuction: true,
      timeLeft: "5h 42m",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold font-playfair mb-6 gold-shimmer">
            Where Time Meets Treasure
          </h1>
          <p className="text-xl md:text-2xl font-cormorant text-muted-foreground mb-8">
            Discover authenticated vintage treasures and celebrity memorabilia
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate("/auctions")} size="lg" className="vintage-border">
              <Hammer className="mr-2 h-5 w-5" />
              Start Bidding
            </Button>
            <Button onClick={() => navigate("/categories")} variant="secondary" size="lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Shop Now
            </Button>
            <Button onClick={() => navigate("/list-item")} variant="outline" size="lg">
              List Your Item
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-playfair mb-4">Featured Treasures</h2>
          <p className="text-muted-foreground font-cormorant text-lg">
            Handpicked authentic vintage items from our expert curators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                {item.verified && (
                  <Badge className="absolute top-4 right-4 bg-primary">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {item.isAuction && item.timeLeft && (
                  <Badge className="absolute top-4 left-4 bg-secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.timeLeft}
                  </Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.category}</Badge>
                  {item.isAuction && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hammer className="h-3 w-3" />
                      Live Auction
                    </span>
                  )}
                </div>
                <CardTitle className="font-playfair mt-2">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.isAuction ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-2xl font-bold font-cormorant text-primary">
                      ${item.currentBid.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Buy Now</p>
                    <p className="text-2xl font-bold font-cormorant">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                {item.isAuction ? (
                  <Button onClick={() => navigate("/auctions")} className="w-full">
                    Place Bid
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => navigate("/categories")} className="flex-1">
                      Buy Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Add to Cart
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold font-playfair mb-2">
                Expert Authentication
              </h3>
              <p className="text-muted-foreground font-cormorant">
                Every item verified by certified professionals
              </p>
            </div>
            <div>
              <Hammer className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold font-playfair mb-2">Fair Bidding</h3>
              <p className="text-muted-foreground font-cormorant">
                Transparent real-time auction system
              </p>
            </div>
            <div>
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold font-playfair mb-2">
                Sustainable Legacy
              </h3>
              <p className="text-muted-foreground font-cormorant">
                Preserving history with eco-friendly practices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground font-cormorant">
          <p>&copy; 2025 Vintage Vault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
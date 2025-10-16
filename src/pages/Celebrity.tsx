import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import celebrityImg from "@/assets/celebrity-item.jpg";

const Celebrity = () => {
  const navigate = useNavigate();

  const celebrityItems = [
    {
      id: 1,
      name: "Marilyn Monroe's Lipstick",
      celebrity: "Marilyn Monroe",
      price: 12500,
      image: celebrityImg,
      verified: true,
      description: "Authentic signature lipstick from the Hollywood legend",
    },
    {
      id: 2,
      name: "Elvis Presley's Stage Jacket",
      celebrity: "Elvis Presley",
      price: 45000,
      image: celebrityImg,
      verified: true,
      description: "Worn during his iconic 1973 Aloha from Hawaii concert",
    },
    {
      id: 3,
      name: "Alia Bhatt's Red Carpet Gown",
      celebrity: "Alia Bhatt",
      price: 8500,
      image: celebrityImg,
      verified: true,
      description: "Designer gown worn at 2023 Filmfare Awards",
    },
    {
      id: 4,
      name: "David Bowie's Sunglasses",
      celebrity: "David Bowie",
      price: 15000,
      image: celebrityImg,
      verified: true,
      description: "Signature shades from Ziggy Stardust era",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Star className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-bold font-playfair mb-4 gold-shimmer">
            Celebrity Memorabilia
          </h1>
          <p className="text-xl font-cormorant text-muted-foreground">
            Own a piece of history from your favorite icons
          </p>
        </div>

        {/* Authentication Badge */}
        <Card className="vintage-border mb-12 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div className="font-cormorant">
                <h3 className="font-bold font-playfair text-xl mb-2">
                  100% Authenticated
                </h3>
                <p className="text-muted-foreground">
                  Every celebrity item comes with a Certificate of Authenticity from
                  PSA/DNA or JSA authentication services. Our experts verify provenance,
                  signatures, and ownership history before listing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {celebrityItems.map((item) => (
            <Card key={item.id} className="vintage-border hover:shadow-lg transition-all">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-primary">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified Authentic
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-sm text-muted-foreground font-cormorant">
                    {item.celebrity}
                  </span>
                </div>
                <CardTitle className="font-playfair">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-cormorant mb-4">
                  {item.description}
                </p>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold font-cormorant text-primary">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button onClick={() => navigate("/categories")} className="flex-1">
                  Buy Now
                </Button>
                <Button variant="outline" className="flex-1">
                  Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="vintage-border mt-16">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl text-center">
              Why Choose Vintage Vault for Celebrity Items?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-cormorant text-center">
              <div>
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold font-playfair text-lg mb-2">
                  Third-Party Authentication
                </h3>
                <p className="text-muted-foreground">
                  All items verified by PSA/DNA, JSA, or Beckett authentication services
                </p>
              </div>
              <div>
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold font-playfair text-lg mb-2">
                  Provenance Documentation
                </h3>
                <p className="text-muted-foreground">
                  Complete ownership history and chain of custody provided
                </p>
              </div>
              <div>
                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-bold font-playfair text-lg mb-2">
                  Lifetime Guarantee
                </h3>
                <p className="text-muted-foreground">
                  We stand behind every item's authenticity for life
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Celebrity;
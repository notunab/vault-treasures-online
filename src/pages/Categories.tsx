import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gem, Watch, Palette, Crown, Shirt, Camera, Lipstick, Home, Book, Music } from "lucide-react";

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: "cameras",
      name: "Vintage Cameras",
      icon: Camera,
      description: "Classic film & instant cameras",
      count: 45,
    },
    {
      id: "garments",
      name: "Vintage Garments",
      icon: Shirt,
      description: "Classic fashion & couture",
      count: 203,
    },
    {
      id: "jewelry",
      name: "Fine Jewelry",
      icon: Gem,
      description: "Precious gems & heirlooms",
      count: 156,
    },
    {
      id: "makeup",
      name: "Vintage Makeup",
      icon: Lipstick,
      description: "Collectible cosmetics & compacts",
      count: 78,
    },
    {
      id: "watches",
      name: "Luxury Watches",
      icon: Watch,
      description: "Timeless timepieces",
      count: 124,
    },
    {
      id: "home_decor",
      name: "Home Decor",
      icon: Home,
      description: "Elegant vintage furnishings",
      count: 92,
    },
    {
      id: "books",
      name: "Rare Books",
      icon: Book,
      description: "First editions & manuscripts",
      count: 67,
    },
    {
      id: "music",
      name: "Music Collectibles",
      icon: Music,
      description: "Vinyl, instruments & memorabilia",
      count: 53,
    },
    {
      id: "celebrity",
      name: "Celebrity Memorabilia",
      icon: Crown,
      description: "Authentic items from icons",
      count: 87,
    },
    {
      id: "art",
      name: "Art & Collectibles",
      icon: Palette,
      description: "Paintings, sculptures & rarities",
      count: 98,
    },
    {
      id: "antiques",
      name: "Antiques",
      icon: Watch,
      description: "Historic treasures & artifacts",
      count: 142,
    },
    {
      id: "fashion",
      name: "Designer Fashion",
      icon: Crown,
      description: "Haute couture & accessories",
      count: 189,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold font-playfair mb-4 gold-shimmer">
            Browse Categories
          </h1>
          <p className="text-xl font-cormorant text-muted-foreground">
            Explore our curated collections of authenticated vintage treasures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-all cursor-pointer vintage-border group"
                onClick={() => navigate(`/categories/${category.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                    <Badge variant="secondary">{category.count} items</Badge>
                  </div>
                  <CardTitle className="font-playfair text-2xl">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-cormorant">
                    {category.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Explore Collection
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Categories;
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Leaf, Eye, Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(10, "Message too short").max(1000),
});

const About = () => {
  const experts = [
    {
      name: "Dr. Elizabeth Morgan",
      field: "Art & Antiques",
      certification: "PhD in Art History, 20+ years expertise",
    },
    {
      name: "James Chen",
      field: "Jewelry & Gems",
      certification: "GIA Certified Gemologist",
    },
    {
      name: "Maria Rodriguez",
      field: "Celebrity Memorabilia",
      certification: "PSA/DNA Authentication Specialist",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const validated = contactSchema.parse({
        name: formData.get("name"),
        email: formData.get("email"),
        message: formData.get("message"),
      });
      
      // In real app, would send to backend
      toast.success("Message sent! We'll respond within 24 hours.");
      e.currentTarget.reset();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold font-playfair mb-4 gold-shimmer">
            About Vintage Vault
          </h1>
          <p className="text-xl font-cormorant text-muted-foreground max-w-3xl mx-auto">
            Where authenticity meets heritage. We preserve history, one treasure at a time.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="vintage-border">
            <CardHeader>
              <Eye className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="font-playfair">Transparency</CardTitle>
            </CardHeader>
            <CardContent className="font-cormorant text-muted-foreground">
              Every item comes with full provenance documentation and open bidding history.
            </CardContent>
          </Card>

          <Card className="vintage-border">
            <CardHeader>
              <Leaf className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="font-playfair">Sustainability</CardTitle>
            </CardHeader>
            <CardContent className="font-cormorant text-muted-foreground">
              Eco-friendly packaging and celebrating the reuse of beautiful heritage pieces.
            </CardContent>
          </Card>

          <Card className="vintage-border">
            <CardHeader>
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <CardTitle className="font-playfair">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="font-cormorant text-muted-foreground">
              Every item verified by certified experts before listing on our platform.
            </CardContent>
          </Card>
        </div>

        {/* Authentication Process */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold font-playfair mb-8 text-center">
            Our Authentication Process
          </h2>
          <Card className="vintage-border">
            <CardContent className="pt-6">
              <div className="space-y-6 font-cormorant text-lg">
                <div>
                  <h3 className="font-bold font-playfair text-xl mb-2">1. Expert Evaluation</h3>
                  <p className="text-muted-foreground">
                    Each item is physically inspected by our certified specialists who examine
                    materials, craftsmanship, and historical markers.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold font-playfair text-xl mb-2">2. Documentation Review</h3>
                  <p className="text-muted-foreground">
                    We verify provenance records, original receipts, and ownership history
                    to ensure authenticity.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold font-playfair text-xl mb-2">3. Certificate Issuance</h3>
                  <p className="text-muted-foreground">
                    Upon verification, we issue a unique certificate ID that buyers can use
                    to verify authenticity at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meet Our Experts */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold font-playfair mb-8 text-center">
            Meet Our Experts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {experts.map((expert) => (
              <Card key={expert.name} className="vintage-border text-center">
                <CardHeader>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4" />
                  <CardTitle className="font-playfair">{expert.name}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    {expert.field}
                  </Badge>
                </CardHeader>
                <CardContent className="font-cormorant text-muted-foreground">
                  {expert.certification}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="vintage-border">
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="font-playfair text-center text-3xl">
                Get In Touch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    maxLength={1000}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
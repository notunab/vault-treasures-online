import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const Verify = () => {
  const [certificateId, setCertificateId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    
    // Simulate verification (in real app, query database)
    setTimeout(() => {
      // Mock verification result
      const isValid = certificateId.toLowerCase().includes("vv");
      
      setVerificationResult(isValid ? {
        valid: true,
        itemName: "Victorian Gold Pocket Watch",
        authenticatedBy: "Dr. Elizabeth Morgan",
        authenticatedDate: "2024-12-15",
        category: "Antiques",
        certNumber: certificateId,
      } : {
        valid: false,
      });
      
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-5xl font-bold font-playfair mb-4 gold-shimmer">
              Verify Authenticity
            </h1>
            <p className="text-xl font-cormorant text-muted-foreground">
              Enter your certificate ID to verify item authenticity
            </p>
          </div>

          {/* Verification Form */}
          <Card className="vintage-border mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Certificate ID (e.g., VV-2024-12345)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  className="font-cormorant text-lg"
                  maxLength={100}
                />
                <Button onClick={handleVerify} disabled={loading} size="lg">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {verificationResult && (
            <Card
              className={`vintage-border ${
                verificationResult.valid
                  ? "border-green-500"
                  : "border-destructive"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  {verificationResult.valid ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-destructive" />
                  )}
                </div>
                <CardTitle className="text-center font-playfair text-3xl">
                  {verificationResult.valid
                    ? "Authenticated Item"
                    : "Invalid Certificate"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResult.valid ? (
                  <div className="space-y-4 font-cormorant text-lg">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-muted-foreground">Item Name:</span>
                      <span className="font-bold">{verificationResult.itemName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="secondary">{verificationResult.category}</Badge>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-muted-foreground">Authenticated By:</span>
                      <span>{verificationResult.authenticatedBy}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-muted-foreground">Authenticated Date:</span>
                      <span>{verificationResult.authenticatedDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Certificate Number:</span>
                      <span className="font-mono text-sm">{verificationResult.certNumber}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-center font-cormorant text-lg text-muted-foreground">
                    The certificate ID you entered could not be found in our database.
                    Please check the ID and try again.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="vintage-border mt-8">
            <CardHeader>
              <CardTitle className="font-playfair">Where to find your certificate ID?</CardTitle>
            </CardHeader>
            <CardContent className="font-cormorant text-muted-foreground space-y-2">
              <p>• Check the authentication certificate included with your purchase</p>
              <p>• Find it in your order confirmation email</p>
              <p>• View it in your account dashboard under "My Items"</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verify;
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto border-border shadow-sm">
          <CardContent className="pt-10 pb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">404 - Not Found</h1>
            <p className="text-foreground/60 mb-8">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

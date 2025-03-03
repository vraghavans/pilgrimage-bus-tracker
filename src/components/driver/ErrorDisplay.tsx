
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Reload App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;

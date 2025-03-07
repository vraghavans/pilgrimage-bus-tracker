
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DriverApp from "./pages/DriverApp";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Define the base path based on environment
const basePath = import.meta.env.PROD ? '/pilgrimage-bus-tracker' : '';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Add a loading state to prevent rendering too early
  useEffect(() => {
    // Small delay to ensure all dependencies are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basePath}>
          <AuthProvider>
            <Routes>
              {/* Public route */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Default redirect to auth */}
              <Route path="/" element={
                <ProtectedRoute requiredRole="admin">
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Protected driver route */}
              <Route path="/driver" element={
                <ProtectedRoute requiredRole="driver">
                  <DriverApp />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

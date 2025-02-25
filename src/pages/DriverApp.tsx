
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus } from "@/types/bus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DriverApp = () => {
  const [driverBus] = useState<Bus>({
    id: "1",
    name: "Bus 101",
    driverName: "John Doe",
    status: "active",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  });

  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);

  // Check for location permission on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Function to check location permission
  const checkLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);
      
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });
    } catch (error) {
      console.error('Error checking location permission:', error);
      toast.error('Could not check location permission');
    }
  };

  // Function to request location permission and start tracking
  const startTracking = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request permission if needed
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setIsTracking(true);
      updateLocation(position);
      startWatchingLocation();
      toast.success('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      toast.error('Could not start location tracking');
    }
  };

  // Function to stop tracking
  const stopTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      setIsTracking(false);
      toast.success('Location tracking stopped');
    }
  };

  // Reference to store the watchPosition ID
  const watchId = React.useRef<number>();

  // Function to start watching location
  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        updateLocation,
        (error) => {
          console.error('Error watching location:', error);
          toast.error('Error updating location');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  // Function to update location in Supabase
  const updateLocation = async (position: GeolocationPosition) => {
    try {
      const { error } = await supabase
        .from('bus_locations')
        .upsert({
          bus_id: driverBus.id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status: 'active',
          driver_id: null, // This would be replaced with actual driver_id from auth
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{driverBus.name}</CardTitle>
            <Badge
              variant={
                driverBus.status === "active"
                  ? "default"
                  : driverBus.status === "stopped"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize"
            >
              {driverBus.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Driver</h3>
            <p className="text-lg">{driverBus.driverName}</p>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Location Tracking
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                variant={isTracking ? "destructive" : "default"}
                onClick={isTracking ? stopTracking : startTracking}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
              <Badge variant="outline">
                Permission: {locationPermission || 'unknown'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Location
            </h3>
            <p className="text-sm">
              Lat: {driverBus.location.latitude.toFixed(6)}
              <br />
              Long: {driverBus.location.longitude.toFixed(6)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Update
            </h3>
            <p className="text-sm">
              {new Date(driverBus.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverApp;

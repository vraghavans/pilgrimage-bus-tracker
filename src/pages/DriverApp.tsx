import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus } from "@/types/bus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const DriverApp = () => {
  const { signOut, session } = useAuth();
  const [driverBus] = useState<Bus>({
    id: session?.user?.id || "1",
    name: `Bus ${session?.user?.id?.substring(0, 4) || "101"}`,
    driverName: session?.user?.email?.split('@')[0] || "John Doe",
    status: "active",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  });

  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState(driverBus.location);
  const [lastUpdateTime, setLastUpdateTime] = useState(driverBus.lastUpdate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      checkLocationPermission();
      console.log("DriverApp component mounted");
    } catch (err) {
      console.error("Error in initial loading:", err);
      setError("Failed to initialize the driver app");
      toast.error("Failed to initialize the driver app");
    }
  }, []);

  const checkLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }
      
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(permission.state);
      
      permission.addEventListener('change', () => {
        setLocationPermission(permission.state);
      });
      
      console.log("Location permission:", permission.state);
    } catch (error) {
      console.error('Error checking location permission:', error);
      setError('Could not check location permission');
      toast.error('Could not check location permission');
    }
  };

  const startTracking = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setIsTracking(true);
      updateLocation(position);
      startWatchingLocation();
      toast.success('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setError('Could not start location tracking');
      toast.error('Could not start location tracking');
    }
  };

  const stopTracking = () => {
    if (navigator.geolocation && watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      setIsTracking(false);
      toast.success('Location tracking stopped');
    }
  };

  const watchId = React.useRef<number>();

  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        updateLocation,
        (error) => {
          console.error('Error watching location:', error);
          setError('Error updating location');
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

  const updateLocation = async (position: GeolocationPosition) => {
    try {
      const newLat = position.coords.latitude;
      const newLng = position.coords.longitude;
      const timestamp = new Date().toISOString();
      
      setCurrentLocation({
        latitude: newLat,
        longitude: newLng
      });
      setLastUpdateTime(timestamp);
      
      console.log('Updating location in Supabase:', {
        bus_id: driverBus.id,
        latitude: newLat,
        longitude: newLng
      });
      
      const { data, error } = await supabase
        .from('bus_locations')
        .upsert({
          bus_id: driverBus.id,
          latitude: newLat,
          longitude: newLng,
          status: 'active',
          updated_at: timestamp
        }, {
          onConflict: 'bus_id'
        });

      if (error) {
        console.error('Error updating location:', error);
        
        const { error: insertError } = await supabase
          .rpc('update_bus_location', {
            p_bus_id: driverBus.id,
            p_latitude: newLat,
            p_longitude: newLng,
            p_status: 'active'
          });
        
        if (insertError) {
          console.error('Failed fallback location update:', insertError);
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location');
      toast.error('Failed to update location');
    }
  };

  if (error) {
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
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Driver App</h1>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
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
              Lat: {currentLocation.latitude.toFixed(6)}
              <br />
              Long: {currentLocation.longitude.toFixed(6)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Update
            </h3>
            <p className="text-sm">
              {new Date(lastUpdateTime).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverApp;

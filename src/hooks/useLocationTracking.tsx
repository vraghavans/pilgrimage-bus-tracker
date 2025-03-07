import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bus } from "@/types/bus";
import { 
  checkLocationPermission, 
  updateLocationInDatabase, 
  getCurrentPosition 
} from "@/services/locationTracking";

export const useLocationTracking = (driverBus: Bus) => {
  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState(driverBus.location);
  const [lastUpdateTime, setLastUpdateTime] = useState(driverBus.lastUpdate);
  const [error, setError] = useState<string | null>(null);
  const [updateInterval, setUpdateInterval] = useState<number>(30); // Default 30 seconds
  
  const intervalRef = useRef<number>();
  const watchId = useRef<number>();

  useEffect(() => {
    try {
      const initLocationPermission = async () => {
        const permission = await checkLocationPermission();
        setLocationPermission(permission);
      };
      
      initLocationPermission();
      console.log("Location tracking hook initialized");
    } catch (err) {
      console.error("Error in initial loading:", err);
      setError("Failed to initialize the driver app");
      toast.error("Failed to initialize the driver app");
    }

    return () => {
      // Clean up interval and location watching when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

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
      
      await updateLocationInDatabase(driverBus, newLat, newLng);
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location');
    }
  };

  const startTracking = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const position = await getCurrentPosition();
      setIsTracking(true);
      updateLocation(position);
      
      // Instead of continuous watching, set up an interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Convert seconds to milliseconds for the interval
      const intervalTime = updateInterval * 1000;
      
      intervalRef.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          updateLocation,
          (error) => {
            console.error('Error getting location:', error);
            toast.error('Error updating location');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }, intervalTime);
      
      toast.success(`Location tracking started - updates every ${updateInterval} seconds`);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setError('Could not start location tracking');
      toast.error('Could not start location tracking');
    }
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = undefined;
    }
    
    setIsTracking(false);
    toast.success('Location tracking stopped');
  };

  const handleIntervalChange = (value: string) => {
    const newInterval = parseInt(value, 10);
    setUpdateInterval(newInterval);
    
    if (isTracking) {
      // Restart tracking with new interval
      stopTracking();
      startTracking();
      toast.success(`Update interval changed to ${newInterval} seconds`);
    }
  };

  return {
    isTracking,
    locationPermission,
    currentLocation,
    lastUpdateTime,
    error,
    updateInterval,
    startTracking,
    stopTracking,
    handleIntervalChange
  };
};

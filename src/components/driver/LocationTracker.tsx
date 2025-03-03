
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";

interface LocationTrackerProps {
  isTracking: boolean;
  locationPermission: string | null;
  updateInterval: number;
  currentLocation: { latitude: number; longitude: number };
  lastUpdateTime: string;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onIntervalChange: (value: string) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({
  isTracking,
  locationPermission,
  updateInterval,
  currentLocation,
  lastUpdateTime,
  onStartTracking,
  onStopTracking,
  onIntervalChange,
}) => {
  return (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Update Interval
        </h3>
        <Select 
          value={updateInterval.toString()} 
          onValueChange={onIntervalChange}
          disabled={isTracking}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="120">2 minutes</SelectItem>
            <SelectItem value="300">5 minutes</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {isTracking ? `Updating every ${updateInterval} seconds` : "Select how often to update location"}
        </p>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Location Tracking
        </h3>
        <div className="flex items-center gap-2">
          <Button 
            variant={isTracking ? "destructive" : "default"}
            onClick={isTracking ? onStopTracking : onStartTracking}
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
  );
};

export default LocationTracker;

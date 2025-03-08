
import { Bus } from "@/types/bus";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleBusTracking } from "@/services/busTracking";
import { toast } from "sonner";

interface BusListItemProps {
  bus: Bus;
  isSelected: boolean;
  isTracked: boolean;
  onSelect: (bus: Bus) => void;
  onTrackingToggle: (busId: string, isTracked: boolean) => void;
  adminId: string;
}

export const BusListItem = ({ 
  bus, 
  isSelected, 
  isTracked, 
  onSelect, 
  onTrackingToggle,
  adminId 
}: BusListItemProps) => {
  const [isToggling, setIsToggling] = useState(false);
  
  // Check if a bus hasn't transmitted in a while (15 minutes)
  const isInactive = (lastUpdate: string) => {
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const currentTime = new Date().getTime();
    const fifteenMinutesInMs = 15 * 60 * 1000;
    
    return currentTime - lastUpdateTime > fifteenMinutesInMs;
  };

  const busInactive = isInactive(bus.lastUpdate);

  const toggleBusTrackingStatus = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      // Toggle tracking (false means untrack since buses are tracked by default)
      const success = await toggleBusTracking(bus.id, adminId, !isTracked);
      
      if (success) {
        onTrackingToggle(bus.id, !isTracked);
        toast.success(`${isTracked ? 'Stopped tracking' : 'Now tracking'} ${bus.name}`);
      }
    } catch (error) {
      console.error("Error toggling bus tracking:", error);
      toast.error("Failed to update tracking settings");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`w-full p-4 rounded-lg transition-all duration-200 ease-in-out ${
        isSelected
          ? "bg-sage-100 shadow-lg"
          : "bg-background/50 hover:bg-sage-50"
      }`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            busInactive
              ? "bg-red-500"
              : bus.status === "active"
              ? "bg-green-500"
              : bus.status === "stopped"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        />
        <div className="flex-1 text-left">
          <p className="font-medium">{bus.name}</p>
          <p className="text-sm text-muted-foreground">
            Driver: {bus.driverName}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex-1 mr-1"
          onClick={() => onSelect(bus)}
        >
          View
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 ml-1"
          onClick={toggleBusTrackingStatus}
          disabled={isToggling}
        >
          {isTracked ? (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              Untrack
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-1" />
              Track
            </>
          )}
        </Button>
      </div>
      
      {busInactive && (
        <Badge variant="destructive" className="w-full justify-center mt-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Not transmitting
        </Badge>
      )}
    </div>
  );
};

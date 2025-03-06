
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bus } from "@/types/bus";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Clock, AlertTriangle } from "lucide-react";
import { fetchTrackedBuses, updateBusTrackingStatus, associateBusWithAdmin } from "@/services/locationTracking";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BusListProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
  selectedBusId?: string;
}

export const BusList = ({ buses, onSelectBus, selectedBusId }: BusListProps) => {
  const { session } = useAuth();
  const [trackedBuses, setTrackedBuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadTrackedBuses();
    }
  }, [session]);

  const loadTrackedBuses = async () => {
    if (session?.user) {
      setLoading(true);
      const tracked = await fetchTrackedBuses(session.user.id);
      setTrackedBuses(tracked);
      setLoading(false);
    }
  };

  const toggleBusTracking = async (bus: Bus, isCurrentlyTracked: boolean) => {
    if (!session?.user) return;
    
    try {
      const adminId = session.user.id;
      let success;
      
      if (isCurrentlyTracked) {
        // Remove from tracking
        success = await updateBusTrackingStatus(adminId, bus.id, false);
        if (success) {
          setTrackedBuses(prev => prev.filter(id => id !== bus.id));
          toast.success(`Stopped tracking ${bus.name}`);
        }
      } else {
        // Add to tracking
        const relationExists = trackedBuses.includes(bus.id);
        
        if (relationExists) {
          success = await updateBusTrackingStatus(adminId, bus.id, true);
        } else {
          success = await associateBusWithAdmin(adminId, bus.id);
        }
        
        if (success) {
          setTrackedBuses(prev => [...prev, bus.id]);
          toast.success(`Now tracking ${bus.name}`);
        }
      }
    } catch (error) {
      console.error("Error toggling bus tracking:", error);
      toast.error("Failed to update tracking settings");
    }
  };

  // Check if a bus hasn't transmitted in a while (15 minutes)
  const isInactive = (lastUpdate: string) => {
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const currentTime = new Date().getTime();
    const fifteenMinutesInMs = 15 * 60 * 1000;
    
    return currentTime - lastUpdateTime > fifteenMinutesInMs;
  };

  // Filter buses based on tracking settings if we have trackedBuses loaded
  const displayBuses = trackedBuses.length > 0 
    ? buses.filter(bus => trackedBuses.includes(bus.id))
    : buses;

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-80 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90">Tracked Buses</h2>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {displayBuses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No buses are currently being tracked
              </p>
            ) : (
              <div className="space-y-2">
                {displayBuses.map((bus) => {
                  const isTracked = trackedBuses.includes(bus.id);
                  const busInactive = isInactive(bus.lastUpdate);
                  
                  return (
                    <div
                      key={bus.id}
                      className={`w-full p-4 rounded-lg transition-all duration-200 ease-in-out ${
                        selectedBusId === bus.id
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
                          onClick={() => onSelectBus(bus)}
                        >
                          View
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 ml-1"
                          onClick={() => toggleBusTracking(bus, isTracked)}
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
                })}
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">All Available Buses</h3>
              {buses.filter(bus => !trackedBuses.includes(bus.id)).map(bus => (
                <div key={bus.id} className="flex items-center justify-between p-2 border rounded-md mb-2">
                  <span className="text-sm">{bus.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleBusTracking(bus, false)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};

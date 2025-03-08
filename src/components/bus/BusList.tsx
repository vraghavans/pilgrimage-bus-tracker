
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bus } from "@/types/bus";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchTrackedBuses, toggleBusTracking } from "@/services/busTracking";
import { TrackedBusList } from "./TrackedBusList";
import { UntrackedBusList } from "./UntrackedBusList";
import { BusListSkeleton } from "./BusListSkeleton";
import { toast } from "sonner";

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
      // By default, all buses are tracked unless explicitly untracked
      const explicityUntracked = await fetchTrackedBuses(session.user.id);
      
      // Get all bus IDs except those explicitly untracked
      const allBusIds = buses.map(bus => bus.id);
      const tracked = allBusIds.filter(id => !explicityUntracked.includes(id));
      
      setTrackedBuses(tracked);
      setLoading(false);
    }
  };

  const handleTrackingToggle = (busId: string, isTracked: boolean) => {
    if (isTracked) {
      setTrackedBuses(prev => [...prev, busId]);
    } else {
      setTrackedBuses(prev => prev.filter(id => id !== busId));
    }
  };

  const handleUntrackBus = async (bus: Bus) => {
    if (!session?.user) return;
    
    try {
      const adminId = session.user.id;
      const success = await toggleBusTracking(bus.id, adminId, false);
      
      if (success) {
        handleTrackingToggle(bus.id, false);
        toast.success(`Stopped tracking ${bus.name}`);
      }
    } catch (error) {
      console.error("Error untracking bus:", error);
      toast.error("Failed to untrack bus");
    }
  };
  
  const handleTrackBus = async (bus: Bus) => {
    if (!session?.user) return;
    
    try {
      const adminId = session.user.id;
      const success = await toggleBusTracking(bus.id, adminId, true);
      
      if (success) {
        handleTrackingToggle(bus.id, true);
        toast.success(`Now tracking ${bus.name}`);
      }
    } catch (error) {
      console.error("Error tracking bus:", error);
      toast.error("Failed to track bus");
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-80 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90">Tracked Buses</h2>
        
        {loading ? (
          <BusListSkeleton />
        ) : (
          <>
            <TrackedBusList 
              buses={buses}
              trackedBusIds={trackedBuses}
              selectedBusId={selectedBusId}
              adminId={session?.user?.id || ''}
              onSelectBus={onSelectBus}
              onTrackingToggle={handleTrackingToggle}
            />
            
            <UntrackedBusList 
              buses={buses}
              trackedBusIds={trackedBuses}
              onTrackBus={handleTrackBus}
            />
          </>
        )}
      </div>
    </ScrollArea>
  );
};


import { ScrollArea } from "@/components/ui/scroll-area";
import { Bus } from "@/types/bus";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { fetchTrackedBuses } from "@/services/busTracking";
import { TrackedBusList } from "./TrackedBusList";
import { UntrackedBusList } from "./UntrackeedBusList";
import { BusListSkeleton } from "./BusListSkeleton";

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

  const handleTrackingToggle = (busId: string, isTracked: boolean) => {
    if (isTracked) {
      setTrackedBuses(prev => [...prev, busId]);
    } else {
      setTrackedBuses(prev => prev.filter(id => id !== busId));
    }
  };

  const handleTrackBus = async (bus: Bus) => {
    if (!session?.user) return;
    
    const adminId = session.user.id;
    handleTrackingToggle(bus.id, true);
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

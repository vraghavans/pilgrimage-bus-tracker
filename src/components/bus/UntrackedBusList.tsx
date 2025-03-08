
import { Bus } from "@/types/bus";
import { Button } from "@/components/ui/button";
import { EyeOff } from "lucide-react";

interface UntrackedBusListProps {
  buses: Bus[];
  trackedBusIds: string[];
  onTrackBus: (bus: Bus) => void;
}

export const UntrackedBusList = ({ 
  buses, 
  trackedBusIds, 
  onTrackBus 
}: UntrackedBusListProps) => {
  const untrackedBuses = buses.filter(bus => !trackedBusIds.includes(bus.id));
  
  if (untrackedBuses.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Untracked Buses</h3>
      {untrackedBuses.map(bus => (
        <div key={bus.id} className="flex items-center justify-between p-2 border rounded-md mb-2">
          <span className="text-sm">{bus.name}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTrackBus(bus)}
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Untrack
          </Button>
        </div>
      ))}
    </div>
  );
};

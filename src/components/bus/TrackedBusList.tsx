
import { Bus } from "@/types/bus";
import { BusListItem } from "./BusListItem";

interface TrackedBusListProps {
  buses: Bus[];
  trackedBusIds: string[];
  selectedBusId?: string;
  adminId: string;
  onSelectBus: (bus: Bus) => void;
  onTrackingToggle: (busId: string, isTracked: boolean) => void;
}

export const TrackedBusList = ({
  buses,
  trackedBusIds,
  selectedBusId,
  adminId,
  onSelectBus,
  onTrackingToggle
}: TrackedBusListProps) => {
  // Filter buses based on tracking settings
  const trackedBuses = buses.filter(bus => trackedBusIds.includes(bus.id));
  
  if (trackedBuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No buses are currently being tracked
      </p>
    );
  }
  
  return (
    <div className="space-y-2">
      {trackedBuses.map(bus => (
        <BusListItem
          key={bus.id}
          bus={bus}
          isSelected={selectedBusId === bus.id}
          isTracked={true}
          onSelect={onSelectBus}
          onTrackingToggle={onTrackingToggle}
          adminId={adminId}
        />
      ))}
    </div>
  );
};

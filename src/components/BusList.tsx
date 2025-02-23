
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bus } from "@/types/bus";

interface BusListProps {
  buses: Bus[];
  onSelectBus: (bus: Bus) => void;
  selectedBusId?: string;
}

export const BusList = ({ buses, onSelectBus, selectedBusId }: BusListProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-4rem)] w-80 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground/90">Pilgrimage Buses</h2>
        <div className="space-y-2">
          {buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={`w-full p-4 rounded-lg transition-all duration-200 ease-in-out ${
                selectedBusId === bus.id
                  ? "bg-sage-100 shadow-lg scale-[1.02]"
                  : "bg-background/50 hover:bg-sage-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    bus.status === "active"
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
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

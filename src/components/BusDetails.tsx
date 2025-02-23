
import { Bus } from "@/types/bus";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusDetailsProps {
  bus: Bus;
}

export const BusDetails = ({ bus }: BusDetailsProps) => {
  return (
    <Card className="fixed bottom-4 left-84 max-w-md p-6 bg-background/95 backdrop-blur-sm border shadow-lg rounded-lg animate-fade-up">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{bus.name}</h3>
          <Badge
            variant={
              bus.status === "active"
                ? "default"
                : bus.status === "stopped"
                ? "secondary"
                : "destructive"
            }
          >
            {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
          </Badge>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Driver: </span>
            {bus.driverName}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last Updated: </span>
            {new Date(bus.lastUpdate).toLocaleTimeString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Location: </span>
            {bus.location.latitude.toFixed(6)}, {bus.location.longitude.toFixed(6)}
          </p>
        </div>
      </div>
    </Card>
  );
};

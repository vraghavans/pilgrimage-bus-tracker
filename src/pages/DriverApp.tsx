
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus } from "@/types/bus";

const DriverApp = () => {
  // This would later be replaced with real driver data
  const [driverBus] = useState<Bus>({
    id: "1",
    name: "Bus 101",
    driverName: "John Doe",
    status: "active",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">{driverBus.name}</CardTitle>
            <Badge
              variant={
                driverBus.status === "active"
                  ? "default"
                  : driverBus.status === "stopped"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize"
            >
              {driverBus.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Driver</h3>
            <p className="text-lg">{driverBus.driverName}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Current Location
            </h3>
            <p className="text-sm">
              Lat: {driverBus.location.latitude.toFixed(6)}
              <br />
              Long: {driverBus.location.longitude.toFixed(6)}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Update
            </h3>
            <p className="text-sm">
              {new Date(driverBus.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverApp;

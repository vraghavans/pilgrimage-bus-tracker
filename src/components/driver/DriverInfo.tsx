
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus } from "@/types/bus";

interface DriverInfoProps {
  bus: Bus;
}

const DriverInfo: React.FC<DriverInfoProps> = ({ bus }) => {
  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{bus.name}</CardTitle>
          <Badge
            variant={
              bus.status === "active"
                ? "default"
                : bus.status === "stopped"
                ? "secondary"
                : "destructive"
            }
            className="capitalize"
          >
            {bus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Driver</h3>
          <p className="text-lg">{bus.driverName}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverInfo;

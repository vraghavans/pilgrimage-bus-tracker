
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus } from "@/types/bus";
import { useAuth } from "@/contexts/auth";
import { LogOut } from "lucide-react";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import DriverInfo from "@/components/driver/DriverInfo";
import LocationTracker from "@/components/driver/LocationTracker";
import ErrorDisplay from "@/components/driver/ErrorDisplay";
import AdminAccessManager from "@/components/driver/AdminAccessManager";
import { sendHeartbeat } from "@/services/locationUpdates";

const DriverApp = () => {
  const { signOut, session } = useAuth();
  const [driverBus] = useState<Bus>({
    id: session?.user?.id || "1",
    name: `Bus ${session?.user?.email?.split('@')[0] || "101"}`,
    driverName: session?.user?.email?.split('@')[0] || "John Doe",
    status: "active",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  });

  const {
    isTracking,
    locationPermission,
    currentLocation,
    lastUpdateTime,
    error,
    updateInterval,
    startTracking,
    stopTracking,
    handleIntervalChange
  } = useLocationTracking(driverBus);

  useEffect(() => {
    if (!session?.user?.id) return;

    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(session.user.id);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(heartbeatInterval);
  }, [session]);

  const handleSignOut = async () => {
    if (isTracking) {
      await stopTracking();
    }
    await signOut();
  };

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Driver App</h1>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
      <Card className="max-w-md mx-auto shadow-lg">
        <DriverInfo bus={driverBus} />
        <LocationTracker
          isTracking={isTracking}
          locationPermission={locationPermission}
          updateInterval={updateInterval}
          currentLocation={currentLocation}
          lastUpdateTime={lastUpdateTime}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
          onIntervalChange={handleIntervalChange}
        />
        {session?.user?.id && (
          <AdminAccessManager busId={session.user.id} />
        )}
      </Card>
    </div>
  );
};

export default DriverApp;

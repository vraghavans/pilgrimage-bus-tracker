
import { useState } from "react";
import { BusList } from "@/components/BusList";
import { BusDetails } from "@/components/BusDetails";
import { Bus } from "@/types/bus";

// Temporary mock data
const mockBuses: Bus[] = [
  {
    id: "1",
    name: "Bus 101",
    driverName: "John Doe",
    status: "active",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bus 102",
    driverName: "Jane Smith",
    status: "stopped",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Bus 103",
    driverName: "Mike Johnson",
    status: "offline",
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    lastUpdate: new Date().toISOString(),
  },
];

const Index = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  return (
    <div className="flex min-h-screen bg-sage-50">
      <BusList
        buses={mockBuses}
        onSelectBus={setSelectedBus}
        selectedBusId={selectedBus?.id}
      />
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-sage-100/30">
          {/* Map will be added here in the next iteration */}
          <div className="h-full flex items-center justify-center text-sage-500">
            Map view coming soon...
          </div>
        </div>
        {selectedBus && <BusDetails bus={selectedBus} />}
      </div>
    </div>
  );
};

export default Index;

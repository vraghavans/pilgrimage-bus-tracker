
import { useState, useEffect } from "react";
import { BusList } from "@/components/BusList";
import { BusDetails } from "@/components/BusDetails";
import { Bus } from "@/types/bus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);

  // Fetch initial bus locations
  useEffect(() => {
    const fetchBusLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('bus_locations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the Bus type
        const transformedBuses: Bus[] = data.map(location => ({
          id: location.bus_id,
          name: `Bus ${location.bus_id}`,
          driverName: "Active Driver", // You might want to fetch this from a drivers table
          status: location.status as "active" | "stopped" | "offline",
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          lastUpdate: location.updated_at,
        }));

        setBuses(transformedBuses);
      } catch (error) {
        console.error('Error fetching bus locations:', error);
        toast.error('Failed to fetch bus locations');
      }
    };

    fetchBusLocations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_locations'
        },
        async (payload) => {
          // Refetch all bus locations when there's an update
          fetchBusLocations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-sage-50">
      <BusList
        buses={buses}
        onSelectBus={setSelectedBus}
        selectedBusId={selectedBus?.id}
      />
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-sage-100/30">
          {/* Map will be added in future iterations */}
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

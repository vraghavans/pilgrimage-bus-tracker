
import { useState, useEffect } from "react";
import { BusList } from "@/components/bus/BusList";
import { BusDetails } from "@/components/BusDetails";
import { Bus } from "@/types/bus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const { signOut, session } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

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
          name: location.bus_name || `Bus ${location.bus_id.substring(0, 4)}`,
          driverName: location.bus_name?.split('@')[0] || "Active Driver",
          status: location.status as "active" | "stopped" | "offline",
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          lastUpdate: location.last_heartbeat || location.updated_at,
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
    <div className="flex flex-col min-h-screen bg-sage-50">
      <header className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Pilgrimage Bus Tracker - Admin</h1>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>
      <div className="flex flex-1">
        <BusList
          buses={buses}
          onSelectBus={setSelectedBus}
          selectedBusId={selectedBus?.id}
        />
        <div className="flex-1 relative">
          <Map 
            buses={buses}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
          />
          {selectedBus && <BusDetails bus={selectedBus} />}
        </div>
      </div>
    </div>
  );
};

export default Index;

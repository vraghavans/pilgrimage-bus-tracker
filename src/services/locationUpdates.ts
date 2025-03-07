
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bus } from "@/types/bus";

// Update location in the database
export const updateLocationInDatabase = async (
  bus: Bus, 
  newLat: number, 
  newLng: number
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    
    console.log('Updating location in Supabase:', {
      bus_id: bus.id,
      latitude: newLat,
      longitude: newLng,
      bus_name: bus.name
    });
    
    const { error } = await supabase
      .from('bus_locations')
      .upsert({
        bus_id: bus.id,
        latitude: newLat,
        longitude: newLng,
        status: 'active',
        updated_at: timestamp,
        last_heartbeat: timestamp,
        bus_name: bus.name
      }, {
        onConflict: 'bus_id'
      });

    if (error) {
      console.error('Error updating location:', error);
      
      const { error: insertError } = await supabase
        .rpc('update_bus_location', {
          p_bus_id: bus.id,
          p_latitude: newLat,
          p_longitude: newLng,
          p_status: 'active'
        });
      
      if (insertError) {
        console.error('Failed fallback location update:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error updating location:', error);
    toast.error('Failed to update location');
    throw error;
  }
};

// Send heartbeat to indicate bus is active
export const sendHeartbeat = async (busId: string): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('bus_locations')
      .update({ 
        last_heartbeat: timestamp 
      })
      .eq('bus_id', busId);
    
    if (error) {
      console.error('Error sending heartbeat:', error);
    }
  } catch (error) {
    console.error('Error sending heartbeat:', error);
  }
};

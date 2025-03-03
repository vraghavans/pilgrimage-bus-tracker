
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Bus } from "@/types/bus";

// Check and request location permissions
export const checkLocationPermission = async (): Promise<string> => {
  try {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }
    
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state;
  } catch (error) {
    console.error('Error checking location permission:', error);
    toast.error('Could not check location permission');
    return 'denied';
  }
};

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
      longitude: newLng
    });
    
    const { error } = await supabase
      .from('bus_locations')
      .upsert({
        bus_id: bus.id,
        latitude: newLat,
        longitude: newLng,
        status: 'active',
        updated_at: timestamp
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

// Get current location from browser
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

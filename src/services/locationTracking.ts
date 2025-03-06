
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

// Fetch bus location history
export const fetchBusLocationHistory = async (busId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('bus_location_history')
      .select('*')
      .eq('bus_id', busId)
      .order('recorded_at', { ascending: false })
      .limit(24);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching bus location history:', error);
    toast.error('Failed to fetch bus location history');
    return [];
  }
};

// Associate a bus with an admin
export const associateBusWithAdmin = async (adminId: string, busId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_bus_relationships')
      .upsert({
        admin_id: adminId,
        bus_id: busId,
        is_tracking: true
      });
    
    if (error) {
      console.error('Error associating bus with admin:', error);
      toast.error('Failed to associate bus with admin');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error associating bus with admin:', error);
    toast.error('Failed to associate bus with admin');
    return false;
  }
};

// Update bus tracking status
export const updateBusTrackingStatus = async (
  adminId: string, 
  busId: string, 
  isTracking: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_bus_relationships')
      .update({ is_tracking })
      .match({ admin_id: adminId, bus_id: busId });
    
    if (error) {
      console.error('Error updating bus tracking status:', error);
      toast.error('Failed to update bus tracking status');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating bus tracking status:', error);
    toast.error('Failed to update bus tracking status');
    return false;
  }
};

// Fetch tracked buses for an admin
export const fetchTrackedBuses = async (adminId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_bus_relationships')
      .select('bus_id')
      .eq('admin_id', adminId)
      .eq('is_tracking', true);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => item.bus_id) || [];
  } catch (error) {
    console.error('Error fetching tracked buses:', error);
    toast.error('Failed to fetch tracked buses');
    return [];
  }
};

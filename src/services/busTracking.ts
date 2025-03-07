
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      .update({ is_tracking: isTracking })
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

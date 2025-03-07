
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Toggle bus tracking for an admin user
export const toggleBusTracking = async (
  busId: string, 
  adminId: string, 
  isTracking: boolean
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_bus_relationships')
      .upsert({
        bus_id: busId,
        admin_id: adminId,
        is_tracking: isTracking // Use the snake_case field name to match the database column
      }, {
        onConflict: 'bus_id,admin_id'
      });
    
    if (error) {
      console.error('Error toggling bus tracking:', error);
      toast.error('Failed to update bus tracking status');
      return false;
    }
    
    toast.success(`Bus ${isTracking ? 'tracked' : 'untracked'} successfully`);
    return true;
  } catch (error) {
    console.error('Error toggling bus tracking:', error);
    toast.error('Failed to update bus tracking status');
    return false;
  }
};

// Get bus tracking status for admin
export const getBusTrackingStatus = async (
  busId: string, 
  adminId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_bus_relationships')
      .select('is_tracking') // Use the snake_case field name to match the database column
      .eq('bus_id', busId)
      .eq('admin_id', adminId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting bus tracking status:', error);
      return false;
    }
    
    return data?.is_tracking ?? false; // Use the snake_case field name to match the database column
  } catch (error) {
    console.error('Error getting bus tracking status:', error);
    return false;
  }
};

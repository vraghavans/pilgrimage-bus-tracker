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
        is_tracking: isTracking
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
      .select('is_tracking')
      .eq('bus_id', busId)
      .eq('admin_id', adminId)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting bus tracking status:', error);
      return false;
    }
    
    if (!data) return true;
    
    return !data.is_tracking;
  } catch (error) {
    console.error('Error getting bus tracking status:', error);
    return true;
  }
};

// Fetch explicitly untracked buses for an admin
export const fetchTrackedBuses = async (adminId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_bus_relationships')
      .select('bus_id')
      .eq('admin_id', adminId)
      .eq('is_tracking', false);
    
    if (error) {
      throw error;
    }
    
    return data.map(item => item.bus_id) || [];
  } catch (error) {
    console.error('Error fetching untracked buses:', error);
    toast.error('Failed to fetch untracked buses');
    return [];
  }
};

// Associate a bus with an admin (explicit tracking)
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

// Add an admin to a bus by email
export const addAdminToBus = async (busId: string, adminEmail: string): Promise<{success: boolean; error?: string}> => {
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .maybeSingle();
    
    if (adminError) {
      console.error('Error finding admin user:', adminError);
      return { success: false, error: 'database_error' };
    }
    
    if (!adminData) {
      return { success: false, error: 'admin_not_found' };
    }
    
    const { error: relationshipError } = await supabase
      .from('admin_bus_relationships')
      .upsert({
        admin_id: adminData.id,
        bus_id: busId,
        is_tracking: true
      });
    
    if (relationshipError) {
      console.error('Error adding admin to bus:', relationshipError);
      return { success: false, error: 'relationship_error' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding admin to bus:', error);
    return { success: false, error: 'unexpected_error' };
  }
};

// Remove an admin from a bus
export const removeAdminFromBus = async (busId: string, adminId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_bus_relationships')
      .delete()
      .match({ bus_id: busId, admin_id: adminId });
    
    if (error) {
      console.error('Error removing admin from bus:', error);
      toast.error('Failed to remove admin');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing admin from bus:', error);
    toast.error('Failed to remove admin');
    return false;
  }
};

// Get all admins who have access to a specific bus
export const getAdminsForBus = async (busId: string): Promise<{email: string; id: string}[]> => {
  try {
    const { data, error } = await supabase.rpc('get_admins_for_bus', { 
      bus_id: busId 
    });
    
    if (error) {
      console.error('Error getting admins for bus:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting admins for bus:', error);
    return [];
  }
};

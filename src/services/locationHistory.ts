
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

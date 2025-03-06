
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get inactive buses (not transmitted in over a month)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 1);
    
    console.log(`Checking for buses inactive since: ${cutoffDate.toISOString()}`);
    
    const { data: inactiveBuses, error: fetchError } = await supabase
      .from('bus_locations')
      .select('bus_id, bus_name, last_heartbeat')
      .lt('last_heartbeat', cutoffDate.toISOString());
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${inactiveBuses?.length || 0} inactive buses`);
    
    if (inactiveBuses && inactiveBuses.length > 0) {
      // Delete inactive buses
      const { error: deleteError } = await supabase
        .from('bus_locations')
        .delete()
        .in('bus_id', inactiveBuses.map(bus => bus.bus_id));
      
      if (deleteError) {
        throw deleteError;
      }
      
      console.log(`Successfully deleted ${inactiveBuses.length} inactive buses`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Deleted ${inactiveBuses.length} inactive buses`,
          deleted: inactiveBuses
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No inactive buses found to delete'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error cleaning up inactive buses:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

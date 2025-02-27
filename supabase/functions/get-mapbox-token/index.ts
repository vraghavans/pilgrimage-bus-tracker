
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    if (!token) {
      console.error('MAPBOX_PUBLIC_TOKEN not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not found in environment variables',
          status: 500 
        }),
        { 
          headers: corsHeaders,
          status: 500 
        }
      )
    }

    console.log('Successfully retrieved MAPBOX_PUBLIC_TOKEN')
    return new Response(
      JSON.stringify({ 
        MAPBOX_PUBLIC_TOKEN: token,
        status: 200 
      }),
      { 
        headers: corsHeaders,
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-mapbox-token function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        status: 500 
      }),
      { 
        headers: corsHeaders,
        status: 500 
      }
    )
  }
})

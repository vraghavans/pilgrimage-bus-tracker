
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

console.log('Get Mapbox token function is running!')

serve(async (req) => {
  const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Mapbox token not found in environment variables' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }

  return new Response(
    JSON.stringify({ MAPBOX_PUBLIC_TOKEN: token }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    },
  )
})

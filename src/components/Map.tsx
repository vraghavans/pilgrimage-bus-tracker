
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Bus } from '@/types/bus';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { fetchBusLocationHistory } from '@/services/locationTracking';

interface MapProps {
  buses: Bus[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus) => void;
}

const Map = ({ buses, selectedBus, onBusSelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [historyPoints, setHistoryPoints] = useState<any[]>([]);
  const historySourceRef = useRef<string | null>(null);

  useEffect(() => {
    async function initializeMap() {
      if (!mapContainer.current) return;

      try {
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          throw new Error('Failed to fetch Mapbox token');
        }

        if (!data?.MAPBOX_PUBLIC_TOKEN) {
          console.error('No Mapbox token in response:', data);
          throw new Error('No Mapbox token received');
        }

        console.log('Successfully received Mapbox token');
        
        // Initialize map
        mapboxgl.accessToken = data.MAPBOX_PUBLIC_TOKEN;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [0, 0],
          zoom: 2
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl(),
          'top-right'
        );

        // Initialize the history source reference ID
        historySourceRef.current = 'bus-history-source';

        // Set up map for history layer
        map.current.on('load', () => {
          if (!map.current) return;
          
          // Add empty source for history points
          map.current.addSource(historySourceRef.current, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
          
          // Add history line layer
          map.current.addLayer({
            id: 'history-line',
            type: 'line',
            source: historySourceRef.current,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3887be',
              'line-width': 3,
              'line-opacity': 0.75
            }
          });
          
          // Add history points layer
          map.current.addLayer({
            id: 'history-points',
            type: 'circle',
            source: historySourceRef.current,
            paint: {
              'circle-radius': 5,
              'circle-color': '#3887be',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }
          });
        });
      } catch (error) {
        const errorMessage = "Failed to initialize map. Please check your Mapbox token.";
        setMapError(errorMessage);
        toast.error(errorMessage);
        console.error('Map initialization error:', error);
      }
    }

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Fetch and display bus location history when a bus is selected
  useEffect(() => {
    if (!map.current || !selectedBus || !historySourceRef.current) return;
    
    const getHistory = async () => {
      try {
        const history = await fetchBusLocationHistory(selectedBus.id);
        setHistoryPoints(history);
        
        if (history.length > 0 && map.current && historySourceRef.current) {
          // Update the GeoJSON source with new history data
          const historyFeatures = history.map(point => ({
            type: 'Feature' as const, // Type assertion to ensure it's exactly "Feature"
            geometry: {
              type: 'Point' as const, // Type assertion to ensure it's exactly "Point"
              coordinates: [point.longitude, point.latitude]
            },
            properties: {
              time: point.recorded_at,
              status: point.status
            }
          }));
          
          const historySource = map.current.getSource(historySourceRef.current) as mapboxgl.GeoJSONSource;
          if (historySource) {
            historySource.setData({
              type: 'FeatureCollection',
              features: [
                // Line string for the path
                {
                  type: 'Feature' as const, // Type assertion to ensure it's exactly "Feature"
                  geometry: {
                    type: 'LineString' as const, // Type assertion to ensure it's exactly "LineString"
                    coordinates: history.map(point => [point.longitude, point.latitude])
                  },
                  properties: {}
                },
                // Individual points
                ...historyFeatures
              ]
            });
          }
        }
      } catch (error) {
        console.error('Error fetching bus history:', error);
      }
    };
    
    getHistory();
  }, [selectedBus]);

  // Update markers when buses change
  useEffect(() => {
    if (!map.current || mapError) return;

    try {
      // Remove old markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      if (buses.length === 0) return;

      // Calculate bounds to fit all buses
      const bounds = new mapboxgl.LngLatBounds();

      // Check for inactive buses (15 minutes without transmission)
      const currentTime = new Date().getTime();
      const fifteenMinutesInMs = 15 * 60 * 1000;

      // Add new markers
      buses.forEach(bus => {
        const { longitude, latitude } = bus.location;
        bounds.extend([longitude, latitude]);

        // Check if bus is inactive
        const lastUpdateTime = new Date(bus.lastUpdate).getTime();
        const isInactive = currentTime - lastUpdateTime > fifteenMinutesInMs;
        const status = isInactive ? 'inactive' : bus.status;

        // Create marker element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200';
        el.style.backgroundColor = status === 'active' ? '#22c55e' : 
                                  status === 'stopped' ? '#eab308' : '#ef4444';
        el.style.borderColor = selectedBus?.id === bus.id ? '#000' : '#fff';
        el.style.transform = selectedBus?.id === bus.id ? 'scale(1.2)' : 'scale(1)';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${bus.name}</h3>
            <p class="text-sm text-gray-600">Driver: ${bus.driverName}</p>
            <p class="text-sm text-gray-600">Status: ${status}</p>
            <p class="text-sm text-gray-600">Last Update: ${new Date(bus.lastUpdate).toLocaleString()}</p>
            ${isInactive ? '<p class="text-sm text-red-600 font-bold">Not transmitting</p>' : ''}
          </div>
        `);

        // Create and add marker
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          onBusSelect(bus);
        });

        markersRef.current[bus.id] = marker;
      });

      // Fit map to bounds with padding
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } catch (error) {
      console.error('Error updating markers:', error);
      toast.error('Failed to update bus locations on the map');
    }
  }, [buses, selectedBus, mapError]);

  if (mapError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-center p-4">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;

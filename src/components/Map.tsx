
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Bus } from '@/types/bus';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    
    if (!token) {
      const errorMessage = "Mapbox token is missing. Please add it to your Supabase Edge Function Secrets.";
      setMapError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    try {
      // Initialize map
      mapboxgl.accessToken = token;
      
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
    } catch (error) {
      const errorMessage = "Failed to initialize map. Please check your Mapbox token.";
      setMapError(errorMessage);
      toast.error(errorMessage);
      console.error('Map initialization error:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, []);

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

      // Add new markers
      buses.forEach(bus => {
        const { longitude, latitude } = bus.location;
        bounds.extend([longitude, latitude]);

        // Create marker element
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200';
        el.style.backgroundColor = bus.status === 'active' ? '#22c55e' : 
                                  bus.status === 'stopped' ? '#eab308' : '#ef4444';
        el.style.borderColor = selectedBus?.id === bus.id ? '#000' : '#fff';
        el.style.transform = selectedBus?.id === bus.id ? 'scale(1.2)' : 'scale(1)';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${bus.name}</h3>
            <p class="text-sm text-gray-600">Driver: ${bus.driverName}</p>
            <p class="text-sm text-gray-600">Status: ${bus.status}</p>
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

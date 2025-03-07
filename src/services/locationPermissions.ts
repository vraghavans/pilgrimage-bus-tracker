
import { toast } from "sonner";

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

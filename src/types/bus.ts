
export interface Bus {
  id: string;
  name: string;
  driverName: string;
  status: "active" | "stopped" | "offline";
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdate: string;
}

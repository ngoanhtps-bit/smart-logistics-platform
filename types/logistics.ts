export type UserRole = "customer" | "dispatcher" | "admin" | "driver";

export type AccountStatus = "pending" | "approved" | "rejected";

export type ShipmentStatus =
  | "draft"
  | "quoted"
  | "assigned"
  | "pickup"
  | "loaded"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type VehicleType =
  | "container_20ft"
  | "container_40ft"
  | "truck_5t"
  | "truck_15t"
  | "mooc_rao"
  | "mooc_san";

export interface QuoteRequest {
  pickup: string;
  delivery: string;
  cargoType: string;
  weight: string;
  dimensions?: string;
  vehicleType: string;
  shipDate: string;
}

export interface QuoteResponse {
  id: string;
  estimatedPrice: string;
  suggestedVehicle: string;
  transitDays: string;
  eta: string;
  message: string;
}

export interface Shipment {
  code: string;
  customerId?: string;
  route: string;
  pickup: string;
  delivery: string;
  driver: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleType: string;
  status: ShipmentStatus;
  statusLabel: string;
  eta: string;
  cargoType: string;
  weight: string;
  createdAt: string;
}

export interface TrackingPoint {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export interface TrackingSnapshot {
  code: string;
  shipment: Shipment;
  current: TrackingPoint;
  history: TrackingPoint[];
  timeline: { step: string; done: boolean; at?: string }[];
}

export interface FleetVehicle {
  plate: string;
  type: string;
  driver: string;
  location: string;
  status: string;
  utilization: string;
  lat: number;
  lng: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  accountStatus: AccountStatus;
}

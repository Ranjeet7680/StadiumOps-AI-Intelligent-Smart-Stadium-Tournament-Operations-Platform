export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface Stadium {
  stadium_id: number;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

export interface StadiumZone {
  zone_id: number;
  stadium_id: number;
  name: string;
  capacity: number;
  status: string;
  current_count: number;
  risk_level: string;
  risk_score: number;
}

export interface Gate {
  gate_id: number;
  stadium_id: number;
  name: string;
  status: string;
  queue_length: number;
  wait_time: number;
  scan_rate: number;
  staff_count: number;
  capacity: number;
  utilization: number;
  risk_score: number;
}

export interface Incident {
  incident_id: number;
  timestamp: string;
  stadium_id: number;
  zone_id: number;
  incident_type: string;
  severity: string;
  description: string;
  reported_by: string;
  ai_detected: boolean;
  ai_confidence: number;
  assigned_team?: string;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  status: string;
}

export interface AIDecision {
  id: string;
  title: string;
  category: string;
  severity: string;
  confidence: number;
  risk_score: number;
  evidence: string;
  predicted_impact: string;
  recommended_action: string;
  status: string;
  created_at: string;
}

export interface WorkflowStep {
  id: number;
  workflow_id: number;
  step_order: number;
  description: string;
  action_type: string;
  status: string;
  error_message?: string;
}

export interface ParkingLot {
  id: number;
  name: string;
  capacity: number;
  occupied: number;
  available: number;
  entry_rate: number;
  exit_rate: number;
  status: string;
}

export interface Sensor {
  sensor_id: string;
  name: string;
  type: string;
  zone_id: number;
  status: string;
  last_reading: string;
  current_value: number;
  health_score: number;
}

export interface FacilityAsset {
  id: number;
  name: string;
  type: string;
  zone_id: number;
  status: string;
  health_score: number;
  installation_date: string;
  last_maintenance: string;
}

export interface EnergyStats {
  latest: {
    timestamp: string;
    electricity_kwh: number;
    water_liters: number;
    carbon_emissions_kg: number;
    solar_generation_kwh: number;
    temperature_c: number;
  };
  history: Array<{
    timestamp: string;
    electricity_kwh: number;
    water_liters: number;
    carbon_emissions_kg: number;
    solar_generation_kwh: number;
    temperature_c: number;
  }>;
}

export interface LostFoundItem {
  id: number;
  type: string;
  category: string;
  description: string;
  location_lost?: string;
  location_found?: string;
  time_lost?: string;
  time_found?: string;
  status: string;
  matched_item_id?: number;
  match_score: number;
}

export interface NotificationItem {
  id: number;
  timestamp: string;
  title: string;
  message: string;
  severity: string;
  status: string;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string;
  status: string;
}

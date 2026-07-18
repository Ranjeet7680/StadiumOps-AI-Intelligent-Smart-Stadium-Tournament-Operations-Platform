from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    username: str
    email: str
    roles: List[str]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    roles: List[str]

# Stadium & Zone Schemas
class StadiumResponse(BaseModel):
    stadium_id: int
    name: str
    location: str
    capacity: int
    status: str
    class Config:
        from_attributes = True

class ZoneResponse(BaseModel):
    zone_id: int
    stadium_id: int
    name: str
    capacity: int
    status: str
    current_count: int
    risk_level: str
    risk_score: int
    class Config:
        from_attributes = True

class GateResponse(BaseModel):
    gate_id: int
    stadium_id: int
    name: str
    status: str
    queue_length: int
    wait_time: int
    scan_rate: int
    staff_count: int
    capacity: int
    utilization: int
    risk_score: int
    class Config:
        from_attributes = True

# Ticket Schemas
class TicketScanRequest(BaseModel):
    qr_token: str
    gate_id: int
    scanner_id: str

class TicketScanResponse(BaseModel):
    success: bool
    status: str
    message: str
    ticket_id: Optional[int] = None
    fraud_score: Optional[int] = None

# Crowd Schemas
class CrowdReadingResponse(BaseModel):
    timestamp: datetime
    stadium_id: int
    zone_id: int
    current_count: int
    density_percentage: float
    entry_rate_per_minute: int
    exit_rate_per_minute: int
    average_speed_mps: float
    queue_length: int
    average_wait_minutes: int
    match_phase: str
    minutes_to_kickoff: int
    weather_condition: str
    temperature_celsius: float
    active_incidents: int
    risk_score: int
    risk_level: str
    class Config:
        from_attributes = True

class CrowdPredictionResponse(BaseModel):
    zone_id: int
    predicted_15: int
    predicted_30: int
    predicted_60: int
    congestion_probability: float
    risk_score: int

# Incident Schemas
class IncidentCreate(BaseModel):
    stadium_id: int
    zone_id: int
    incident_type: str
    severity: str
    description: str
    reported_by: str

class IncidentUpdateSchema(BaseModel):
    status: str
    update_text: str

class IncidentResponse(BaseModel):
    incident_id: int
    timestamp: datetime
    stadium_id: int
    zone_id: int
    incident_type: str
    severity: str
    description: str
    reported_by: str
    ai_detected: bool
    ai_confidence: float
    assigned_team: Optional[str] = None
    response_time_minutes: Optional[int] = None
    resolution_time_minutes: Optional[int] = None
    status: str
    class Config:
        from_attributes = True

# Lost & Found Schemas
class LostFoundCreate(BaseModel):
    type: str # Lost, Found
    category: str
    description: str
    location_lost: Optional[str] = None
    location_found: Optional[str] = None
    time_lost: Optional[datetime] = None
    time_found: Optional[datetime] = None

class LostFoundResponse(BaseModel):
    id: int
    type: str
    category: str
    description: str
    location_lost: Optional[str] = None
    location_found: Optional[str] = None
    time_lost: Optional[datetime] = None
    time_found: Optional[datetime] = None
    status: str
    matched_item_id: Optional[int] = None
    match_score: float
    class Config:
        from_attributes = True

# AI Schemas
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    summary: str
    evidence: str
    risk: str
    recommendation: str
    suggested_actions: List[str]

# Simulation Control
class SimulationControl(BaseModel):
    action: str # start, pause, resume, reset, speed
    speed: Optional[int] = 1

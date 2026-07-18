from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
import datetime

# Association Table for User and Role
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    login_attempts = Column(Integer, default=0)
    lock_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    notifications = relationship("Notification", back_populates="user")

class Role(Base):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    
    users = relationship("User", secondary=user_roles, back_populates="roles")

class Permission(Base):
    __tablename__ = 'permissions'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)

class Stadium(Base):
    __tablename__ = 'stadiums'
    
    stadium_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String, default="Active")
    
    zones = relationship("StadiumZone", back_populates="stadium")
    gates = relationship("Gate", back_populates="stadium")

class StadiumZone(Base):
    __tablename__ = 'stadium_zones'
    
    zone_id = Column(Integer, primary_key=True, index=True)
    stadium_id = Column(Integer, ForeignKey('stadiums.stadium_id', ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    status = Column(String, default="Active")
    current_count = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")
    risk_score = Column(Integer, default=0)
    
    stadium = relationship("Stadium", back_populates="zones")
    sensors = relationship("Sensor", back_populates="zone")

class Gate(Base):
    __tablename__ = 'gates'
    
    gate_id = Column(Integer, primary_key=True, index=True)
    stadium_id = Column(Integer, ForeignKey('stadiums.stadium_id', ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="Open")
    queue_length = Column(Integer, default=0)
    wait_time = Column(Integer, default=0)
    scan_rate = Column(Integer, default=0)
    staff_count = Column(Integer, default=0)
    capacity = Column(Integer, default=2000)
    utilization = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    
    stadium = relationship("Stadium", back_populates="gates")

class Sensor(Base):
    __tablename__ = 'sensors'
    
    sensor_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    status = Column(String, default="Healthy")
    last_reading = Column(DateTime, default=datetime.datetime.utcnow)
    current_value = Column(Float, default=0.0)
    health_score = Column(Integer, default=100)
    
    zone = relationship("StadiumZone", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor")

class SensorReading(Base):
    __tablename__ = 'sensor_readings'
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, ForeignKey('sensors.sensor_id', ondelete="CASCADE"), nullable=False)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    sensor = relationship("Sensor", back_populates="readings")

class Tournament(Base):
    __tablename__ = 'tournaments'
    
    tournament_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sport = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    format = Column(String, nullable=False)
    status = Column(String, default="Upcoming")
    
    matches = relationship("Match", back_populates="tournament")

class Team(Base):
    __tablename__ = 'teams'
    
    team_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    logo_url = Column(String)
    
    players = relationship("Player", back_populates="team")

class Player(Base):
    __tablename__ = 'players'
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey('teams.team_id', ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    jersey_number = Column(Integer)
    
    team = relationship("Team", back_populates="players")

class Match(Base):
    __tablename__ = 'matches'
    
    match_id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey('tournaments.tournament_id', ondelete="CASCADE"), nullable=False)
    home_team_id = Column(Integer, ForeignKey('teams.team_id'), nullable=False)
    away_team_id = Column(Integer, ForeignKey('teams.team_id'), nullable=False)
    stadium_id = Column(Integer, ForeignKey('stadiums.stadium_id', ondelete="CASCADE"), nullable=False)
    match_time = Column(DateTime, nullable=False)
    status = Column(String, default="Upcoming")
    score = Column(String, default="0/0 - 0/0")
    gate_open_time = Column(DateTime, nullable=False)
    security_level = Column(String, default="Normal")
    
    tournament = relationship("Tournament", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id])
    away_team = relationship("Team", foreign_keys=[away_team_id])
    tickets = relationship("Ticket", back_populates="match")

class Ticket(Base):
    __tablename__ = 'tickets'
    
    ticket_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    match_id = Column(Integer, ForeignKey('matches.match_id', ondelete="CASCADE"), nullable=False)
    seat = Column(String, nullable=False)
    section = Column(String, nullable=False)
    gate_id = Column(Integer, ForeignKey('gates.gate_id', ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    qr_token = Column(String, unique=True, index=True, nullable=False)
    scan_status = Column(String, default="Unscanned")
    scan_time = Column(DateTime, nullable=True)
    fraud_score = Column(Integer, default=0)
    
    match = relationship("Match", back_populates="tickets")
    scans = relationship("TicketScan", back_populates="ticket")

class TicketScan(Base):
    __tablename__ = 'ticket_scans'
    
    scan_id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey('tickets.ticket_id', ondelete="CASCADE"), nullable=False)
    scan_time = Column(DateTime, default=datetime.datetime.utcnow)
    gate_id = Column(Integer, ForeignKey('gates.gate_id', ondelete="CASCADE"), nullable=False)
    scanner_id = Column(String, nullable=False)
    result = Column(String, nullable=False) # Success, Duplicate, Invalid QR, etc.
    details = Column(String)
    
    ticket = relationship("Ticket", back_populates="scans")

class CrowdReading(Base):
    __tablename__ = 'crowd_readings'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    stadium_id = Column(Integer, ForeignKey('stadiums.stadium_id', ondelete="CASCADE"), nullable=False)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    current_count = Column(Integer, default=0)
    density_percentage = Column(Float, default=0.0)
    entry_rate_per_minute = Column(Integer, default=0)
    exit_rate_per_minute = Column(Integer, default=0)
    average_speed_mps = Column(Float, default=0.0)
    queue_length = Column(Integer, default=0)
    average_wait_minutes = Column(Integer, default=0)
    match_phase = Column(String)
    minutes_to_kickoff = Column(Integer, default=0)
    weather_condition = Column(String)
    temperature_celsius = Column(Float)
    active_incidents = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")

class CrowdPrediction(Base):
    __tablename__ = 'crowd_predictions'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    predicted_15 = Column(Integer, default=0)
    predicted_30 = Column(Integer, default=0)
    predicted_60 = Column(Integer, default=0)
    congestion_probability = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)

class Incident(Base):
    __tablename__ = 'incidents'
    
    incident_id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    stadium_id = Column(Integer, ForeignKey('stadiums.stadium_id', ondelete="CASCADE"), nullable=False)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    incident_type = Column(String, nullable=False) # Medical, Security, Crowd, Fire, Facility, Missing Person, Suspicious Activity, Ticket Fraud, Weather
    severity = Column(String, nullable=False) # Low, Medium, High, Critical
    description = Column(String, nullable=False)
    reported_by = Column(String, nullable=False)
    ai_detected = Column(Boolean, default=False)
    ai_confidence = Column(Float, default=0.0)
    assigned_team = Column(String)
    response_time_minutes = Column(Integer)
    resolution_time_minutes = Column(Integer)
    status = Column(String, default="Reported") # Reported, Verified, Assigned, Responding, Monitoring, Resolved, Closed
    
    updates = relationship("IncidentUpdate", back_populates="incident")

class IncidentUpdate(Base):
    __tablename__ = 'incident_updates'
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey('incidents.incident_id', ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    author = Column(String, nullable=False)
    status = Column(String, nullable=False)
    update_text = Column(String, nullable=False)
    
    incident = relationship("Incident", back_populates="updates")

class SecurityAlert(Base):
    __tablename__ = 'security_alerts'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    severity = Column(String, default="Medium")
    status = Column(String, default="Active") # Active, Verified, False Alarm, Handled
    ai_generated = Column(Boolean, default=True)
    verified_by = Column(String)

class Staff(Base):
    __tablename__ = 'staff'
    
    staff_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False) # Security, Medical, Crowd Control, Facilities, Guest Services, Administration
    role = Column(String, nullable=False)
    status = Column(String, default="Active") # Active, On Break, Off Duty
    phone = Column(String)
    certifications = Column(String)
    
    shifts = relationship("Shift", back_populates="staff")
    assignments = relationship("StaffAssignment", back_populates="staff")

class Shift(Base):
    __tablename__ = 'shifts'
    
    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('staff.staff_id', ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="Scheduled") # Scheduled, In Progress, Completed
    role = Column(String)
    
    staff = relationship("Staff", back_populates="shifts")
    assignments = relationship("StaffAssignment", back_populates="shift")

class StaffAssignment(Base):
    __tablename__ = 'staff_assignments'
    
    assignment_id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('staff.staff_id', ondelete="CASCADE"), nullable=False)
    shift_id = Column(Integer, ForeignKey('shifts.id', ondelete="CASCADE"), nullable=False)
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    task_description = Column(String)
    status = Column(String, default="Scheduled") # Scheduled, In Progress, Completed, Absent
    
    staff = relationship("Staff", back_populates="assignments")
    shift = relationship("Shift", back_populates="assignments")

class ParkingLot(Base):
    __tablename__ = 'parking_lots'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    occupied = Column(Integer, default=0)
    available = Column(Integer, default=0)
    entry_rate = Column(Integer, default=0)
    exit_rate = Column(Integer, default=0)
    predicted_full_time = Column(DateTime, nullable=True)
    status = Column(String, default="Open")
    
    readings = relationship("ParkingReading", back_populates="parking_lot")

class ParkingReading(Base):
    __tablename__ = 'parking_readings'
    
    id = Column(Integer, primary_key=True, index=True)
    parking_lot_id = Column(Integer, ForeignKey('parking_lots.id', ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    occupied = Column(Integer, nullable=False)
    entry_rate = Column(Integer, default=0)
    exit_rate = Column(Integer, default=0)
    
    parking_lot = relationship("ParkingLot", back_populates="readings")

class FacilityAsset(Base):
    __tablename__ = 'facility_assets'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # HVAC, Lighting, Elevator, Escalator, Water, Wi-Fi, Scoreboard, Power
    zone_id = Column(Integer, ForeignKey('stadium_zones.zone_id', ondelete="CASCADE"), nullable=False)
    status = Column(String, default="Operational")
    health_score = Column(Integer, default=100)
    installation_date = Column(String)
    last_maintenance = Column(String)
    
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset")

class MaintenanceRecord(Base):
    __tablename__ = 'maintenance_records'
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey('facility_assets.id', ondelete="CASCADE"), nullable=False)
    description = Column(String, nullable=False)
    date = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    technician = Column(String)
    status = Column(String, default="Scheduled") # Scheduled, In Progress, Completed
    
    asset = relationship("FacilityAsset", back_populates="maintenance_records")

class EnergyReading(Base):
    __tablename__ = 'energy_readings'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    electricity_kwh = Column(Float, nullable=False)
    water_liters = Column(Float, nullable=False)
    carbon_emissions_kg = Column(Float, nullable=False)
    solar_generation_kwh = Column(Float, default=0.0)
    temperature_c = Column(Float)

class LostFoundItem(Base):
    __tablename__ = 'lost_found_items'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False) # Lost, Found
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location_lost = Column(String)
    location_found = Column(String)
    time_lost = Column(DateTime)
    time_found = Column(DateTime)
    status = Column(String, default="Lost") # Lost, Found, Matched, Claimed
    matched_item_id = Column(Integer)
    match_score = Column(Float, default=0.0)

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO") # INFO, SUCCESS, WARNING, CRITICAL
    status = Column(String, default="unread") # unread, read
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=True)
    
    user = relationship("User", back_populates="notifications")

class AIDecision(Base):
    __tablename__ = 'ai_decisions'
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False) # crowd, security, facility, emergency
    severity = Column(String, nullable=False) # low, medium, high, critical
    confidence = Column(Float, default=0.0)
    risk_score = Column(Integer, default=0)
    evidence = Column(Text)
    predicted_impact = Column(Text)
    recommended_action = Column(Text)
    status = Column(String, default="pending") # pending, approved, rejected, executed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    workflows = relationship("AIWorkflow", back_populates="decision")

class AIWorkflow(Base):
    __tablename__ = 'ai_workflows'
    
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(String, ForeignKey('ai_decisions.id', ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, default="pending") # pending, executing, completed, failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    decision = relationship("AIDecision", back_populates="workflows")
    steps = relationship("WorkflowStep", back_populates="workflow")

class WorkflowStep(Base):
    __tablename__ = 'workflow_steps'
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey('ai_workflows.id', ondelete="CASCADE"), nullable=False)
    step_order = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    action_type = Column(String, nullable=False) # push_notification, update_signage, deploy_staff, reroute_navigation, verification
    status = Column(String, default="pending") # pending, running, completed, failed
    error_message = Column(String)
    
    workflow = relationship("AIWorkflow", back_populates="steps")
    executions = relationship("WorkflowExecution", back_populates="step")

class WorkflowExecution(Base):
    __tablename__ = 'workflow_executions'
    
    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey('workflow_steps.id', ondelete="CASCADE"), nullable=False)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    result_summary = Column(Text)
    status = Column(String, default="success") # success, failed
    
    step = relationship("WorkflowStep", back_populates="executions")

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    resource_id = Column(String)
    old_value = Column(Text)
    new_value = Column(Text)
    ip_address = Column(String)
    status = Column(String, default="success")

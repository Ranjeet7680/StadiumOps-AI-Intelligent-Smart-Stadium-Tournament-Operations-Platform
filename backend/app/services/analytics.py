from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.models import Incident, Gate, Sensor, Staff, EnergyReading, ParkingLot
from datetime import datetime, timedelta

def calculate_metrics(db: Session, stadium_id: int):
    # 1. Safety Score
    # Base 100, deduct for active incidents by severity
    active_incidents = db.query(Incident).filter(
        Incident.stadium_id == stadium_id,
        Incident.status != "Resolved",
        Incident.status != "Closed"
    ).all()
    
    safety_deduction = 0
    for inc in active_incidents:
        if inc.severity.lower() == "critical":
            safety_deduction += 25
        elif inc.severity.lower() == "high":
            safety_deduction += 15
        elif inc.severity.lower() == "medium":
            safety_deduction += 5
        else:
            safety_deduction += 2
            
    safety_score = max(10.0, 100.0 - safety_deduction)
    
    # 2. Crowd Flow Score
    # Based on gate utilization and queue lengths
    gates = db.query(Gate).filter(Gate.stadium_id == stadium_id).all()
    avg_util = sum([g.utilization for g in gates]) / max(1, len(gates))
    avg_queue = sum([g.queue_length for g in gates]) / max(1, len(gates))
    
    flow_score = 100.0
    if avg_util > 80:
        flow_score -= 20
    elif avg_util > 60:
        flow_score -= 10
        
    flow_score -= min(30.0, avg_queue / 20.0)
    flow_score = max(10.0, flow_score)
    
    # 3. Facility Health Score
    # Average sensor health
    sensors = db.query(Sensor).filter(Sensor.status != "Unknown").all() # filter or aggregate
    # fallback if empty
    facility_health = 95.0
    if sensors:
        facility_health = sum([s.health_score for s in sensors]) / len(sensors)
        
    # 4. Staff Readiness Score
    # Based on staff active vs off duty
    active_staff = db.query(Staff).filter(Staff.status == "Active").count()
    total_staff = db.query(Staff).count()
    staff_readiness = 90.0
    if total_staff > 0:
        staff_readiness = (active_staff / total_staff) * 100.0
        
    # 5. Queue Performance
    # Inversely proportional to average gate wait times
    avg_wait = sum([g.wait_time for g in gates]) / max(1, len(gates))
    queue_perf = max(10.0, 100.0 - (avg_wait * 5.0))
    
    # 6. System Availability
    # Based on percentage of healthy sensors
    healthy_sensors = db.query(Sensor).filter(Sensor.status == "Healthy").count()
    total_sensors = db.query(Sensor).count()
    sys_avail = 98.0
    if total_sensors > 0:
        sys_avail = (healthy_sensors / total_sensors) * 100.0
        
    # Calculate overall Operational Health
    operational_health = (
        (safety_score * 0.30) +
        (flow_score * 0.20) +
        (facility_health * 0.15) +
        (staff_readiness * 0.15) +
        (queue_perf * 0.10) +
        (sys_avail * 0.10)
    )
    
    # Fan Experience Score
    # Deduct for long wait times, critical incidents, parking occupancy
    parking = db.query(ParkingLot).filter(ParkingLot.status == "Open").all()
    avg_parking_util = sum([p.occupied / max(1, p.capacity) for p in parking]) / max(1, len(parking)) * 100.0 if parking else 50.0
    
    fan_experience = max(10.0, 100.0 - (avg_wait * 4.0) - (safety_deduction * 0.5) - (avg_parking_util * 0.15))
    
    # Sustainability Score
    # Based on renewable (solar) vs grid power
    latest_energy = db.query(EnergyReading).order_by(EnergyReading.timestamp.desc()).first()
    sustainability = 75.0
    if latest_energy and (latest_energy.electricity_kwh + latest_energy.solar_generation_kwh) > 0:
        total_energy = latest_energy.electricity_kwh + latest_energy.solar_generation_kwh
        solar_ratio = latest_energy.solar_generation_kwh / total_energy
        sustainability = min(100.0, 50.0 + (solar_ratio * 100.0))
        
    return {
        "operational_health": round(operational_health, 1),
        "safety_score": round(safety_score, 1),
        "crowd_flow": round(flow_score, 1),
        "facility_health": round(facility_health, 1),
        "staff_readiness": round(staff_readiness, 1),
        "queue_performance": round(queue_perf, 1),
        "system_availability": round(sys_avail, 1),
        "fan_experience": round(fan_experience, 1),
        "sustainability": round(sustainability, 1)
    }

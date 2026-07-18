import csv
import os
import sys
from datetime import datetime, timedelta
from passlib.hash import bcrypt

# Add workspace to path to resolve imports correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.models.models import (
    User, Role, Stadium, StadiumZone, Gate, Sensor, SensorReading,
    Tournament, Team, Player, Match, Ticket, TicketScan, CrowdReading,
    CrowdPrediction, Incident, IncidentUpdate, SecurityAlert, Staff,
    Shift, StaffAssignment, ParkingLot, ParkingReading, FacilityAsset,
    MaintenanceRecord, EnergyReading, LostFoundItem, Notification,
    AIDecision, AIWorkflow, WorkflowStep, WorkflowExecution, AuditLog
)

def parse_dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except Exception:
        try:
            return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
        except Exception:
            return None

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Roles
        role_names = [
            "Super Admin", "Stadium Manager", "Tournament Director", 
            "Security Commander", "Emergency Coordinator", 
            "Operations Staff", "Volunteer", "Analyst", "Viewer"
        ]
        roles_dict = {}
        for rname in role_names:
            role = Role(name=rname, description=f"{rname} Role")
            db.add(role)
            db.flush()
            roles_dict[rname] = role
            
        print("Seeded roles.")
        
        # 2. Seed Users
        hashed_pwd = bcrypt.hash("stadium123")
        demo_users = [
            {"username": "admin", "email": "admin@stadiumops.ai", "role": "Super Admin"},
            {"username": "manager", "email": "manager@stadiumops.ai", "role": "Stadium Manager"},
            {"username": "security", "email": "security@stadiumops.ai", "role": "Security Commander"},
            {"username": "staff", "email": "staff@stadiumops.ai", "role": "Operations Staff"},
        ]
        for du in demo_users:
            u = User(
                username=du["username"],
                email=du["email"],
                hashed_password=hashed_pwd,
                is_active=True
            )
            u.roles.append(roles_dict[du["role"]])
            db.add(u)
        db.commit()
        print("Seeded users.")
        
        # 3. Seed Stadiums
        print("Seeding Stadiums...")
        stadiums = []
        with open('data/stadiums.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                stadiums.append({
                    "stadium_id": int(row["stadium_id"]),
                    "name": row["name"],
                    "location": row["location"],
                    "capacity": int(row["capacity"]),
                    "status": row["status"]
                })
        db.bulk_insert_mappings(Stadium, stadiums)
        db.commit()
        
        # 4. Seed Stadium Zones
        print("Seeding Stadium Zones...")
        zones = []
        with open('data/stadium_zones.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                zones.append({
                    "zone_id": int(row["zone_id"]),
                    "stadium_id": int(row["stadium_id"]),
                    "name": row["name"],
                    "capacity": int(row["capacity"]),
                    "status": row["status"],
                    "current_count": int(row["current_count"]),
                    "risk_level": row["risk_level"],
                    "risk_score": int(row["risk_score"])
                })
        db.bulk_insert_mappings(StadiumZone, zones)
        db.commit()

        # 5. Seed Gates
        print("Seeding Gates...")
        gates = []
        with open('data/gates.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                gates.append({
                    "gate_id": int(row["gate_id"]),
                    "stadium_id": int(row["stadium_id"]),
                    "name": row["name"],
                    "status": row["status"],
                    "queue_length": int(row["queue_length"]),
                    "wait_time": int(row["wait_time"]),
                    "scan_rate": int(row["scan_rate"]),
                    "staff_count": int(row["staff_count"]),
                    "capacity": int(row["capacity"]),
                    "utilization": int(row["utilization"]),
                    "risk_score": int(row["risk_score"])
                })
        db.bulk_insert_mappings(Gate, gates)
        db.commit()

        # 6. Seed Tournaments
        print("Seeding Tournaments...")
        tournaments = []
        with open('data/tournaments.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                tournaments.append({
                    "tournament_id": int(row["tournament_id"]),
                    "name": row["name"],
                    "sport": row["sport"],
                    "start_date": row["start_date"],
                    "end_date": row["end_date"],
                    "format": row["format"],
                    "status": row["status"]
                })
        db.bulk_insert_mappings(Tournament, tournaments)
        db.commit()

        # 7. Seed Teams
        print("Seeding Teams...")
        teams = []
        with open('data/teams.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                teams.append({
                    "team_id": int(row["team_id"]),
                    "name": row["name"],
                    "code": row["code"],
                    "logo_url": row["logo_url"]
                })
        db.bulk_insert_mappings(Team, teams)
        db.commit()

        # 8. Seed Matches
        print("Seeding Matches...")
        matches = []
        with open('data/matches.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                matches.append({
                    "match_id": int(row["match_id"]),
                    "tournament_id": int(row["tournament_id"]),
                    "home_team_id": int(row["home_team_id"]),
                    "away_team_id": int(row["away_team_id"]),
                    "stadium_id": int(row["stadium_id"]),
                    "match_time": parse_dt(row["match_time"]),
                    "status": row["status"],
                    "score": row["score"],
                    "gate_open_time": parse_dt(row["gate_open_time"]),
                    "security_level": row["security_level"]
                })
        db.bulk_insert_mappings(Match, matches)
        db.commit()

        # 9. Seed Tickets
        print("Seeding Tickets...")
        tickets = []
        with open('data/tickets.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                tickets.append({
                    "ticket_id": int(row["ticket_id"]),
                    "user_id": int(row["user_id"]),
                    "match_id": int(row["match_id"]),
                    "seat": row["seat"],
                    "section": row["section"],
                    "gate_id": int(row["gate_id"]),
                    "category": row["category"],
                    "qr_token": row["qr_token"],
                    "scan_status": row["scan_status"],
                    "scan_time": parse_dt(row["scan_time"]),
                    "fraud_score": int(row["fraud_score"])
                })
        db.bulk_insert_mappings(Ticket, tickets)
        db.commit()

        # 10. Seed Ticket Scans
        print("Seeding Ticket Scans...")
        ticket_scans = []
        with open('data/ticket_scans.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                ticket_scans.append({
                    "scan_id": int(row["scan_id"]),
                    "ticket_id": int(row["ticket_id"]),
                    "scan_time": parse_dt(row["scan_time"]),
                    "gate_id": int(row["gate_id"]),
                    "scanner_id": row["scanner_id"],
                    "result": row["result"],
                    "details": row["details"]
                })
        db.bulk_insert_mappings(TicketScan, ticket_scans)
        db.commit()

        # 11. Seed Crowd Readings
        print("Seeding Crowd Readings (might take a moment)...")
        readings = []
        with open('data/crowd_readings.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                readings.append({
                    "timestamp": parse_dt(row["timestamp"]),
                    "stadium_id": int(row["stadium_id"]),
                    "zone_id": int(row["zone_id"]),
                    "current_count": int(row["current_count"]),
                    "zone_capacity": int(row["zone_capacity"]),
                    "density_percentage": float(row["density_percentage"]),
                    "entry_rate_per_minute": int(row["entry_rate_per_minute"]),
                    "exit_rate_per_minute": int(row["exit_rate_per_minute"]),
                    "average_speed_mps": float(row["average_speed_mps"]),
                    "queue_length": int(row["queue_length"]),
                    "average_wait_minutes": int(row["average_wait_minutes"]),
                    "match_phase": row["match_phase"],
                    "minutes_to_kickoff": int(row["minutes_to_kickoff"]),
                    "weather_condition": row["weather_condition"],
                    "temperature_celsius": float(row["temperature_celsius"]),
                    "active_incidents": int(row["active_incidents"]),
                    "risk_score": int(row["risk_score"]),
                    "risk_level": row["risk_level"]
                })
        db.bulk_insert_mappings(CrowdReading, readings)
        db.commit()

        # 12. Seed Incidents
        print("Seeding Incidents...")
        incidents = []
        with open('data/incidents.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                incidents.append({
                    "incident_id": int(row["incident_id"]),
                    "timestamp": parse_dt(row["timestamp"]),
                    "stadium_id": int(row["stadium_id"]),
                    "zone_id": int(row["zone_id"]),
                    "incident_type": row["incident_type"],
                    "severity": row["severity"],
                    "description": row["description"],
                    "reported_by": row["reported_by"],
                    "ai_detected": row["ai_detected"] == "True",
                    "ai_confidence": float(row["ai_confidence"]),
                    "assigned_team": row["assigned_team"],
                    "response_time_minutes": int(row["response_time_minutes"]),
                    "resolution_time_minutes": int(row["resolution_time_minutes"]),
                    "status": row["status"]
                })
        db.bulk_insert_mappings(Incident, incidents)
        db.commit()

        # 13. Seed Staff
        print("Seeding Staff...")
        staff_list = []
        with open('data/staff.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                staff_list.append({
                    "staff_id": int(row["staff_id"]),
                    "name": row["name"],
                    "email": row["email"],
                    "department": row["department"],
                    "role": row["role"],
                    "status": row["status"],
                    "phone": row["phone"],
                    "certifications": row["certifications"]
                })
        db.bulk_insert_mappings(Staff, staff_list)
        db.commit()

        # 14. Seed Staff Assignments
        print("Seeding Staff Assignments...")
        assignments = []
        with open('data/staff_assignments.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                assignments.append({
                    "assignment_id": int(row["assignment_id"]),
                    "staff_id": int(row["staff_id"]),
                    "shift_id": int(row["shift_id"]),
                    "zone_id": int(row["zone_id"]),
                    "task_description": row["task_description"],
                    "status": row["status"]
                })
        db.bulk_insert_mappings(StaffAssignment, assignments)
        db.commit()

        # Seed mock Shifts linked to assignments to prevent foreign key issues
        print("Seeding Shifts...")
        shift_ids = set([a["shift_id"] for a in assignments])
        shifts = []
        shift_base_start = datetime(2026, 4, 1, 8, 0)
        for s_idx, sh_id in enumerate(shift_ids):
            shifts.append({
                "id": sh_id,
                "staff_id": (s_idx % 1500) + 1,
                "start_time": shift_base_start,
                "end_time": shift_base_start + timedelta(hours=8),
                "status": "Scheduled",
                "role": "General Steward"
            })
        db.bulk_insert_mappings(Shift, shifts)
        db.commit()

        # 15. Seed Parking
        print("Seeding Parking lots and readings...")
        parking_lots = [
            {"id": 1, "name": "Narendra Modi Lot North", "capacity": 5000, "available": 5000, "occupied": 0, "status": "Open"},
            {"id": 2, "name": "Narendra Modi Lot South", "capacity": 7000, "available": 7000, "occupied": 0, "status": "Open"},
            {"id": 3, "name": "Eden Gardens Main Lot", "capacity": 3000, "available": 3000, "occupied": 0, "status": "Open"},
            {"id": 4, "name": "Wankhede West Lot", "capacity": 1500, "available": 1500, "occupied": 0, "status": "Open"}
        ]
        db.bulk_insert_mappings(ParkingLot, parking_lots)
        db.commit()
        
        parking_readings = []
        with open('data/parking.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                parking_readings.append({
                    "id": int(row["parking_id"]),
                    "parking_lot_id": int(row["parking_lot_id"]),
                    "timestamp": parse_dt(row["timestamp"]),
                    "occupied": int(row["occupied"]),
                    "entry_rate": int(row["entry_rate"]),
                    "exit_rate": int(row["exit_rate"])
                })
        db.bulk_insert_mappings(ParkingReading, parking_readings)
        db.commit()

        # Update parking lot availability from latest reading
        for lot in parking_lots:
            latest = db.query(ParkingReading).filter_by(parking_lot_id=lot["id"]).order_by(ParkingReading.timestamp.desc()).first()
            if latest:
                db_lot = db.query(ParkingLot).get(lot["id"])
                db_lot.occupied = latest.occupied
                db_lot.available = lot["capacity"] - latest.occupied
        db.commit()

        # 16. Seed Facility Sensors & Assets
        print("Seeding facility sensors and assets...")
        sensors = []
        sensor_assets = []
        seen_sensors = set()
        asset_id_counter = 1
        with open('data/facility_sensors.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                s_id = row["sensor_id"]
                if s_id not in seen_sensors:
                    seen_sensors.add(s_id)
                    sensors.append({
                        "sensor_id": s_id,
                        "name": row["name"],
                        "type": row["type"],
                        "zone_id": int(row["zone_id"]),
                        "status": row["status"],
                        "last_reading": parse_dt(row["last_reading"]),
                        "current_value": float(row["current_value"]),
                        "health_score": int(row["health_score"])
                    })
                    
                    # Generate a mock asset for this sensor
                    sensor_assets.append({
                        "id": asset_id_counter,
                        "name": row["name"].replace("Sensor", "System").replace("Controller", "Grid"),
                        "type": row["type"].split()[0], # HVAC, Lighting etc.
                        "zone_id": int(row["zone_id"]),
                        "status": "Operational" if row["status"] == "Healthy" else "Maintenance Required",
                        "health_score": int(row["health_score"]),
                        "installation_date": "2024-01-15",
                        "last_maintenance": "2026-05-10"
                    })
                    asset_id_counter += 1
                    
        db.bulk_insert_mappings(Sensor, sensors)
        db.bulk_insert_mappings(FacilityAsset, sensor_assets)
        db.commit()

        # 17. Seed Energy Readings
        print("Seeding energy readings...")
        energy_readings = []
        with open('data/energy_readings.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                energy_readings.append({
                    "timestamp": parse_dt(row["timestamp"]),
                    "electricity_kwh": float(row["electricity_kwh"]),
                    "water_liters": float(row["water_liters"]),
                    "carbon_emissions_kg": float(row["carbon_emissions_kg"]),
                    "solar_generation_kwh": float(row["solar_generation_kwh"]),
                    "temperature_c": float(row["temperature_c"])
                })
        db.bulk_insert_mappings(EnergyReading, energy_readings)
        db.commit()

        # 18. Seed Lost & Found
        print("Seeding Lost & Found items...")
        lost_items = []
        with open('data/lost_found.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                lost_items.append({
                    "id": int(row["item_id"]),
                    "type": row["type"],
                    "category": row["category"],
                    "description": row["description"],
                    "location_lost": row["location_lost"] if row["type"] == "Lost" else None,
                    "location_found": row["location_found"] if row["type"] == "Found" else None,
                    "time_lost": parse_dt(row["time_lost"]),
                    "time_found": parse_dt(row["time_found"]),
                    "status": row["status"],
                    "matched_item_id": int(row["matched_item_id"]) if row["matched_item_id"] else None,
                    "match_score": float(row["match_score"]) if row["match_score"] else 0.0
                })
        db.bulk_insert_mappings(LostFoundItem, lost_items)
        db.commit()

        # 19. Seed AI Decisions
        print("Seeding AI decisions...")
        dec_list = []
        with open('data/ai_decisions.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                dec_list.append({
                    "id": row["decision_id"],
                    "title": row["title"],
                    "category": row["category"],
                    "severity": row["severity"],
                    "confidence": float(row["confidence"]),
                    "risk_score": int(row["risk_score"]),
                    "evidence": row["evidence"],
                    "predicted_impact": row["predicted_impact"],
                    "recommended_action": row["recommended_action"],
                    "status": row["status"],
                    "created_at": parse_dt(row["created_at"])
                })
        db.bulk_insert_mappings(AIDecision, dec_list)
        db.commit()

        # Seeding a few notifications to show in header
        print("Seeding default notifications...")
        notifications = [
            {"title": "Gate B Congestion Warning", "message": "Gate B queue is approaching critical threshold (wait time > 15m). REDIRECT suggested.", "severity": "WARNING", "status": "unread"},
            {"title": "Unattended Baggage Alert", "message": "CCTV analytics flagged unattended backpack in Concourse A near Gate B. Security dispatched.", "severity": "CRITICAL", "status": "unread"},
            {"title": "Solar Optimization Update", "message": "Solar micro-grid has generated excess energy (450kWh). Excess diverted to storage grid.", "severity": "SUCCESS", "status": "unread"}
        ]
        for n in notifications:
            db.add(Notification(
                title=n["title"],
                message=n["message"],
                severity=n["severity"],
                status=n["status"],
                timestamp=datetime.utcnow()
            ))
        db.commit()

        print("\nDATABASE SUCCESSFULLY SEEDED WITH SYNTHETIC RECORDS.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    seed_database()

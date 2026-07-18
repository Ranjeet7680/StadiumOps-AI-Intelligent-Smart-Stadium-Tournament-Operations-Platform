from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional
from datetime import datetime
import uuid

from backend.app.core.database import get_db
from backend.app.core.security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token,
    get_current_user, RoleChecker
)
from backend.app.models.models import (
    User, Role, Stadium, StadiumZone, Gate, Ticket, TicketScan,
    CrowdReading, CrowdPrediction, Incident, IncidentUpdate,
    SecurityAlert, Staff, StaffAssignment, ParkingLot, ParkingReading,
    FacilityAsset, Sensor, EnergyReading, LostFoundItem, Notification,
    AIDecision, AIWorkflow, WorkflowStep, AuditLog, Tournament, Match
)
from backend.app.schemas import schemas
from backend.app.services.analytics import calculate_metrics
from backend.app.services.lost_found_match import compute_match_score
from backend.app.services.simulation import simulator
from backend.app.websocket.connection_manager import manager

router = APIRouter()

# ----------------- AUTH ENDPOINTS -----------------
@router.post("/auth/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    roles = [role.name for role in user.roles]
    access_token = create_access_token(subject=user.email, roles=roles)
    refresh_token = create_refresh_token(subject=user.email)
    
    # Audit Log
    db.add(AuditLog(
        timestamp=datetime.utcnow(),
        user_email=user.email,
        action="Login",
        resource="User",
        resource_id=str(user.id),
        status="success"
    ))
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "username": user.username,
        "email": user.email,
        "roles": roles
    }

@router.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "roles": [role.name for role in current_user.roles]
    }

# ----------------- STADIUMS & ZONES -----------------
@router.get("/stadiums", response_model=List[schemas.StadiumResponse])
def get_stadiums(db: Session = Depends(get_db)):
    return db.query(Stadium).all()

@router.get("/stadiums/{id}/zones", response_model=List[schemas.ZoneResponse])
def get_stadium_zones(id: int, db: Session = Depends(get_db)):
    return db.query(StadiumZone).filter(StadiumZone.stadium_id == id).all()

@router.get("/stadiums/{id}/gates", response_model=List[schemas.GateResponse])
def get_stadium_gates(id: int, db: Session = Depends(get_db)):
    return db.query(Gate).filter(Gate.stadium_id == id).all()

@router.get("/zones", response_model=List[schemas.ZoneResponse])
def get_all_zones(db: Session = Depends(get_db)):
    return db.query(StadiumZone).all()

@router.get("/gates", response_model=List[schemas.GateResponse])
def get_all_gates(db: Session = Depends(get_db)):
    return db.query(Gate).all()

# ----------------- CROWD INTELLIGENCE -----------------
@router.get("/crowd/current")
def get_crowd_current(stadium_id: int = 1, db: Session = Depends(get_db)):
    zones = db.query(StadiumZone).filter(StadiumZone.stadium_id == stadium_id).all()
    total_occupancy = sum([z.current_count for z in zones])
    total_capacity = sum([z.capacity for z in zones])
    avg_density = (total_occupancy / total_capacity * 100.0) if total_capacity > 0 else 0.0
    
    gates = db.query(Gate).filter(Gate.stadium_id == stadium_id).all()
    avg_wait = sum([g.wait_time for g in gates]) / max(1, len(gates))
    
    return {
        "total_occupancy": total_occupancy,
        "total_capacity": total_capacity,
        "density_percentage": round(avg_density, 1),
        "average_wait_minutes": int(avg_wait)
    }

@router.get("/crowd/zones", response_model=List[schemas.ZoneResponse])
def get_crowd_zones(stadium_id: int = 1, db: Session = Depends(get_db)):
    return db.query(StadiumZone).filter(StadiumZone.stadium_id == stadium_id).all()

@router.get("/crowd/predictions", response_model=List[schemas.CrowdPredictionResponse])
def get_crowd_predictions(stadium_id: int = 1, db: Session = Depends(get_db)):
    zones = db.query(StadiumZone).filter(StadiumZone.stadium_id == stadium_id).all()
    predictions = []
    for z in zones:
        density = z.current_count / max(1, z.capacity)
        # Mock ML extrapolation with noise
        p15 = int(z.current_count * (1.0 + random.uniform(-0.05, 0.15)))
        p30 = int(z.current_count * (1.0 + random.uniform(-0.10, 0.25)))
        p60 = int(z.current_count * (1.0 + random.uniform(-0.20, 0.40)))
        
        prob = min(1.0, max(0.0, density * 1.1))
        risk = int(prob * 100)
        
        predictions.append({
            "zone_id": z.zone_id,
            "predicted_15": min(z.capacity, p15),
            "predicted_30": min(z.capacity, p30),
            "predicted_60": min(z.capacity, p60),
            "congestion_probability": round(prob, 2),
            "risk_score": risk
        })
    return predictions

@router.get("/crowd/heatmap")
def get_crowd_heatmap(stadium_id: int = 1, db: Session = Depends(get_db)):
    zones = db.query(StadiumZone).filter(StadiumZone.stadium_id == stadium_id).all()
    # Mocking coordinates for visual map presentation
    heatmap_coords = []
    for idx, z in enumerate(zones):
        # layout positions in a circle mock
        angle = (idx / len(zones)) * 6.28
        lat = 23.091 + (0.001 * math.sin(angle)) if stadium_id == 1 else (22.564 if stadium_id == 2 else 18.938)
        lng = 72.628 + (0.001 * math.cos(angle)) if stadium_id == 1 else (88.343 if stadium_id == 2 else 72.825)
        
        heatmap_coords.append({
            "zone_id": z.zone_id,
            "name": z.name,
            "lat": lat,
            "lng": lng,
            "density": round((z.current_count / max(1, z.capacity)) * 100, 1),
            "current_count": z.current_count
        })
    return heatmap_coords

# Helper import
import math
import random

# ----------------- AI OPERATIONS AGENT -----------------
@router.get("/ai/decisions")
def get_ai_decisions(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AIDecision)
    if status:
        query = query.filter(AIDecision.status == status)
    return query.order_by(desc(AIDecision.created_at)).all()

@router.get("/ai/decisions/{id}")
def get_ai_decision_by_id(id: str, db: Session = Depends(get_db)):
    dec = db.query(AIDecision).filter(AIDecision.id == id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
        
    wf = db.query(AIWorkflow).filter(AIWorkflow.decision_id == id).first()
    steps = []
    if wf:
        steps = db.query(WorkflowStep).filter(WorkflowStep.workflow_id == wf.id).order_by(WorkflowStep.step_order).all()
        
    return {
        "decision": dec,
        "workflow": wf,
        "steps": steps
    }

@router.post("/ai/decisions/{id}/approve")
def approve_ai_decision(id: str, background_tasks: BackgroundTasks, current_user: User = Depends(RoleChecker(["Super Admin", "Stadium Manager"]))):
    # Run async execution of workflow
    # This runs the simulated step-by-step reduction
    background_tasks.add_task(simulator.execute_approved_workflow, id)
    return {"message": f"Decision {id} approved and execution started."}

import asyncio

@router.post("/ai/decisions/{id}/reject")
def reject_ai_decision(id: str, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["Super Admin", "Stadium Manager"]))):
    dec = db.query(AIDecision).filter(AIDecision.id == id).first()
    if not dec:
        raise HTTPException(status_code=404, detail="Decision not found")
    dec.status = "rejected"
    
    # Audit log
    db.add(AuditLog(
        timestamp=datetime.utcnow(),
        user_email=current_user.email,
        action="Reject Decision",
        resource="AIDecision",
        resource_id=id,
        status="success"
    ))
    db.commit()
    return {"message": f"Decision {id} has been rejected."}

@router.post("/ai/chat", response_model=schemas.ChatResponse)
def ai_copilot_chat(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    msg = request.message.lower()
    
    # 1. Gate B question
    if "gate b" in msg:
        gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
        queue = gate_b.queue_length if gate_b else 0
        wait = gate_b.wait_time if gate_b else 0
        return {
            "summary": f"Gate B is currently congested with a queue length of {queue} and wait time of {wait} minutes.",
            "evidence": f"Scanners at Gate B report entry rate of {gate_b.scan_rate if gate_b else 20} visitors/min with utilization of {gate_b.utilization if gate_b else 80}%.",
            "risk": "HIGH. Congestion may lead to turnstile crush risks and match gate delays.",
            "recommendation": "Initiate visitor re-routing to Gate C immediately and update LED signage grids.",
            "suggested_actions": ["Reroute 20% to Gate C", "Send Push Notification", "Deploy 6 reserve stewards"]
        }
    
    # 2. Risk question
    elif "highest risk" in msg or "risk" in msg:
        highest_zone = db.query(StadiumZone).order_by(desc(StadiumZone.risk_score)).first()
        name = highest_zone.name if highest_zone else "None"
        score = highest_zone.risk_score if highest_zone else 0
        return {
            "summary": f"The zone with the highest risk profile is {name} with a risk score of {score}/100.",
            "evidence": f"Occupancy density in this zone is {score}%, triggering warning alerts on CCTV analytics.",
            "risk": "MODERATE to HIGH depending on egress flow speed.",
            "recommendation": "Station crowd flow controllers at primary entry portals.",
            "suggested_actions": ["Deploy crowd controllers", "Verify exit corridor clearance"]
        }
        
    # 3. Incidents question
    elif "incidents" in msg or "incident" in msg:
        active_cnt = db.query(Incident).filter(Incident.status != "Resolved", Incident.status != "Closed").count()
        critical_cnt = db.query(Incident).filter(Incident.status != "Resolved", Incident.status != "Closed", Incident.severity == "Critical").count()
        return {
            "summary": f"There are currently {active_cnt} active incidents across the stadium premises, with {critical_cnt} flagged as Critical.",
            "evidence": f"Incident registry logs: Medical ({db.query(Incident).filter_by(incident_type='Medical').count()}), Security ({db.query(Incident).filter_by(incident_type='Security').count()}).",
            "risk": "MEDIUM. Active dispatches are in progress for all outstanding events.",
            "recommendation": "Monitor response team dispatches and verify medical stand readiness.",
            "suggested_actions": ["Check medical dispatch status", "Review active safety alerts"]
        }
        
    # Default Copilot Response
    return {
        "summary": "Stadium operations are running within manageable bounds. AI monitors entry gates, concourses, and utility metrics.",
        "evidence": "Total attendance density across the venue is 56%. Average gate wait time is 4.2 minutes.",
        "risk": "LOW. No active critical safety alerts verified at this time.",
        "recommendation": "Maintain standard security posture and operational monitoring.",
        "suggested_actions": ["Review gate queues", "Inspect facility HVAC telemetry"]
    }

# ----------------- INCIDENT MANAGEMENT -----------------
@router.get("/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if search:
        query = query.filter(Incident.description.like(f"%{search}%"))
        
    return query.order_by(desc(Incident.timestamp)).limit(100).all()

@router.get("/incidents/{id}", response_model=schemas.IncidentResponse)
def get_incident_by_id(id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).get(id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/incidents", response_model=schemas.IncidentResponse)
def create_incident(request: schemas.IncidentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    inc = Incident(
        timestamp=datetime.utcnow(),
        stadium_id=request.stadium_id,
        zone_id=request.zone_id,
        incident_type=request.incident_type,
        severity=request.severity,
        description=request.description,
        reported_by=request.reported_by,
        ai_detected=False,
        ai_confidence=0.0,
        status="Reported"
    )
    db.add(inc)
    db.flush()
    
    # Create incident update
    upd = IncidentUpdate(
        incident_id=inc.incident_id,
        timestamp=datetime.utcnow(),
        author=request.reported_by,
        status="Reported",
        update_text="Incident logged in the platform registry."
    )
    db.add(upd)
    
    # Broadcast incident:new
    background_tasks.add_task(manager.broadcast_json, {
        "type": "incident:new",
        "data": {
            "incident_id": inc.incident_id,
            "type": inc.incident_type,
            "severity": inc.severity,
            "description": inc.description
        }
    })
    
    db.commit()
    return inc

@router.patch("/incidents/{id}", response_model=schemas.IncidentResponse)
def update_incident(id: int, request: schemas.IncidentUpdateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    inc = db.query(Incident).get(id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    inc.status = request.status
    upd = IncidentUpdate(
        incident_id=id,
        timestamp=datetime.utcnow(),
        author=current_user.email,
        status=request.status,
        update_text=request.update_text
    )
    db.add(upd)
    
    # Audit log
    db.add(AuditLog(
        timestamp=datetime.utcnow(),
        user_email=current_user.email,
        action=f"Update Incident Status to {request.status}",
        resource="Incident",
        resource_id=str(id),
        status="success"
    ))
    
    db.commit()
    return inc

# ----------------- TOURNAMENT & MATCH -----------------
@router.get("/tournaments")
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).all()

@router.get("/matches")
def get_matches(db: Session = Depends(get_db)):
    return db.query(Match).order_by(Match.match_time).all()

# ----------------- SMART TICKETING & SCAN -----------------
@router.post("/tickets/scan", response_model=schemas.TicketScanResponse)
def scan_ticket(request: schemas.TicketScanRequest, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.qr_token == request.qr_token).first()
    if not ticket:
        return {
            "success": False,
            "status": "Failed",
            "message": "Invalid QR code token.",
            "fraud_score": 95
        }
        
    if ticket.scan_status == "Scanned":
        # Duplicate Scan
        scan = TicketScan(
            ticket_id=ticket.ticket_id,
            scan_time=datetime.utcnow(),
            gate_id=request.gate_id,
            scanner_id=request.scanner_id,
            result="Duplicate Attempt",
            details="Rejected: ticket already scanned"
        )
        db.add(scan)
        ticket.fraud_score = max(ticket.fraud_score, 85)
        db.commit()
        return {
            "success": False,
            "status": "Duplicate",
            "message": "Access denied: duplicate scan attempt flagged.",
            "ticket_id": ticket.ticket_id,
            "fraud_score": ticket.fraud_score
        }
        
    # Success Scan
    ticket.scan_status = "Scanned"
    ticket.scan_time = datetime.utcnow()
    scan = TicketScan(
        ticket_id=ticket.ticket_id,
        scan_time=datetime.utcnow(),
        gate_id=request.gate_id,
        scanner_id=request.scanner_id,
        result="Success",
        details="Access granted"
    )
    db.add(scan)
    db.commit()
    
    return {
        "success": True,
        "status": "Success",
        "message": f"Access granted for Section {ticket.section}, Seat {ticket.seat}.",
        "ticket_id": ticket.ticket_id,
        "fraud_score": ticket.fraud_score
    }

# ----------------- PARKING & FACILITIES -----------------
@router.get("/parking")
def get_parking(db: Session = Depends(get_db)):
    return db.query(ParkingLot).all()

@router.get("/facilities")
def get_facilities(db: Session = Depends(get_db)):
    assets = db.query(FacilityAsset).all()
    sensors = db.query(Sensor).all()
    return {
        "assets": assets,
        "sensors": sensors
    }

@router.get("/energy/stats")
def get_energy_stats(db: Session = Depends(get_db)):
    latest = db.query(EnergyReading).order_by(desc(EnergyReading.timestamp)).first()
    history = db.query(EnergyReading).order_by(desc(EnergyReading.timestamp)).limit(24).all()
    return {
        "latest": latest,
        "history": list(reversed(history))
    }

# ----------------- LOST & FOUND -----------------
@router.get("/lost-found", response_model=List[schemas.LostFoundResponse])
def get_lost_found(db: Session = Depends(get_db)):
    return db.query(LostFoundItem).order_by(desc(LostFoundItem.id)).all()

@router.post("/lost-found", response_model=schemas.LostFoundResponse)
def create_lost_found_item(request: schemas.LostFoundCreate, db: Session = Depends(get_db)):
    item = LostFoundItem(
        type=request.type,
        category=request.category,
        description=request.description,
        location_lost=request.location_lost,
        location_found=request.location_found,
        time_lost=request.time_lost,
        time_found=request.time_found,
        status="Lost" if request.type == "Lost" else "Found",
        matched_item_id=None,
        match_score=0.0
    )
    db.add(item)
    db.flush()
    
    # AI matching engine run
    # Compare with items of opposite type
    opp_type = "Found" if request.type == "Lost" else "Lost"
    candidates = db.query(LostFoundItem).filter(LostFoundItem.type == opp_type, LostFoundItem.status == opp_type).all()
    
    best_match = None
    best_score = 0.0
    for cand in candidates:
        score = compute_match_score(item if request.type == "Lost" else cand, cand if request.type == "Lost" else item)
        if score > best_score:
            best_score = score
            best_match = cand
            
    # If match threshold met (e.g. > 0.60)
    if best_match and best_score >= 0.60:
        item.status = "Matched"
        item.matched_item_id = best_match.id
        item.match_score = best_score
        
        best_match.status = "Matched"
        best_match.matched_item_id = item.id
        best_match.match_score = best_score
        
        # Dispatch notifications
        db.add(Notification(
            title=f"AI Match Found: {item.category}",
            message=f"Lost item similarity matcher flagged a potential match ({int(best_score*100)}% match) for your registry.",
            severity="SUCCESS",
            status="unread"
        ))
        
    db.commit()
    return item

# ----------------- STAFF -----------------
@router.get("/staff")
def get_staff(db: Session = Depends(get_db)):
    return db.query(Staff).all()

@router.get("/staff/recommendations")
def get_staff_recommendations(db: Session = Depends(get_db)):
    # AI recommendations for staffing based on gate queue length
    congested_gates = db.query(Gate).filter(Gate.queue_length > 500).all()
    recommendations = []
    for gate in congested_gates:
        needed_stewards = int(gate.queue_length / 200) - gate.staff_count
        if needed_stewards > 0:
            recommendations.append({
                "gate_id": gate.gate_id,
                "gate_name": gate.name,
                "queue_length": gate.queue_length,
                "current_staff": gate.staff_count,
                "recommended_staff_addition": needed_stewards,
                "reason": f"AI models predict wait times will exceed 15 mins due to high queue size. Deploying {needed_stewards} stewards reduces congestion risk."
            })
    return recommendations

# ----------------- ANALYTICS & HEALTH -----------------
@router.get("/analytics/health")
def get_analytics_health(stadium_id: int = 1, db: Session = Depends(get_db)):
    return calculate_metrics(db, stadium_id)

# ----------------- NOTIFICATIONS -----------------
@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(desc(Notification.timestamp)).limit(30).all()

@router.patch("/notifications/{id}/read")
def read_notification(id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).get(id)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.status = "read"
    db.commit()
    return n

@router.post("/notifications/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter_by(status="unread").update({"status": "read"})
    db.commit()
    return {"message": "All notifications marked as read"}

# ----------------- AUDIT LOGS -----------------
@router.get("/audit")
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(100).all()

# ----------------- SIMULATION CONTROLS -----------------
@router.post("/simulation/control")
async def control_simulation(req: schemas.SimulationControl):
    act = req.action.lower()
    if act == "start":
        await simulator.start()
    elif act == "pause":
        await simulator.pause()
    elif act == "resume":
        await simulator.start()
    elif act == "reset":
        await simulator.reset()
    elif act == "speed":
        await simulator.set_speed(req.speed)
    elif act == "demo":
        await simulator.trigger_demo()
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    return {"status": "success", "action": act}

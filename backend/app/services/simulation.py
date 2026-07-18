import asyncio
import random
import logging
from datetime import datetime, timedelta
from backend.app.core.database import SessionLocal
from backend.app.models.models import (
    Gate, StadiumZone, Sensor, ParkingLot, CrowdReading, CrowdPrediction,
    AIDecision, AIWorkflow, WorkflowStep, AuditLog, Incident, Notification
)
from backend.app.websocket.connection_manager import manager

logger = logging.getLogger(__name__)

class StadiumSimulation:
    def __init__(self):
        self.is_running = False
        self.speed_factor = 1
        self.demo_mode = False
        self.demo_step = 0
        self.demo_max_steps = 4
        self.demo_last_advance = datetime.utcnow()
        self.demo_sec_per_step = 10  # 10 seconds in real-time is 1 minute in the demo
        
        # State variables
        self.gate_b_original = None
        self.gate_c_original = None
        
    async def start(self):
        self.is_running = True
        logger.info("Simulation started.")
        await manager.broadcast_json({"type": "simulation:status", "data": {"is_running": self.is_running, "demo_mode": self.demo_mode, "speed": self.speed_factor}})

    async def pause(self):
        self.is_running = False
        logger.info("Simulation paused.")
        await manager.broadcast_json({"type": "simulation:status", "data": {"is_running": self.is_running, "demo_mode": self.demo_mode, "speed": self.speed_factor}})

    async def reset(self):
        self.demo_mode = False
        self.demo_step = 0
        self.is_running = False
        logger.info("Simulation reset.")
        db = SessionLocal()
        try:
            # Restore Gate B and C to normal if we stored original values
            gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
            if gate_b:
                gate_b.queue_length = 120
                gate_b.wait_time = 4
                gate_b.utilization = 35
                gate_b.status = "Open"
            gate_c = db.query(Gate).filter(Gate.name.like("%Gate C%")).first()
            if gate_c:
                gate_c.queue_length = 80
                gate_c.wait_time = 3
                gate_c.utilization = 30
                gate_c.status = "Open"
            
            # Remove demo decisions
            db.query(AIDecision).filter(AIDecision.id == "AI-DEC-001").delete()
            db.query(AIWorkflow).filter(AIWorkflow.decision_id == "AI-DEC-001").delete()
            db.commit()
        except Exception as e:
            logger.error(f"Error resetting simulation: {e}")
            db.rollback()
        finally:
            db.close()
            
        await manager.broadcast_json({"type": "simulation:status", "data": {"is_running": self.is_running, "demo_mode": self.demo_mode, "speed": self.speed_factor}})
        await manager.broadcast_json({"type": "simulation:reset", "data": True})

    async def trigger_demo(self):
        self.demo_mode = True
        self.demo_step = 0
        self.is_running = True
        self.demo_last_advance = datetime.utcnow()
        logger.info("Demo Mode triggered.")
        await manager.broadcast_json({"type": "simulation:status", "data": {"is_running": self.is_running, "demo_mode": self.demo_mode, "speed": self.speed_factor}})
        await self.execute_demo_step(0)

    async def set_speed(self, speed: int):
        self.speed_factor = speed
        await manager.broadcast_json({"type": "simulation:status", "data": {"is_running": self.is_running, "demo_mode": self.demo_mode, "speed": self.speed_factor}})

    async def execute_demo_step(self, step: int):
        db = SessionLocal()
        try:
            logger.info(f"Executing Demo Step {step}")
            
            gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
            gate_c = db.query(Gate).filter(Gate.name.like("%Gate C%")).first()
            zone_b = db.query(StadiumZone).filter(StadiumZone.name.like("%North Stand%")).first()
            
            if step == 0:
                # Normal operations
                if gate_b:
                    gate_b.queue_length = 350
                    gate_b.wait_time = 4
                    gate_b.utilization = 45
                    gate_b.status = "Open"
                if gate_c:
                    gate_c.queue_length = 150
                    gate_c.wait_time = 2
                    gate_c.utilization = 25
                    gate_c.status = "Open"
                if zone_b:
                    zone_b.current_count = int(zone_b.capacity * 0.45)
                    zone_b.risk_score = 25
                    zone_b.risk_level = "LOW"
                db.commit()
                
                await manager.broadcast_json({"type": "demo:step", "step": 0, "title": "Normal Operations", "desc": "All gates and zones are running at standard capacity. Wait times average under 5 minutes."})
                await manager.broadcast_json({"type": "gate:update", "data": {"gate_b": 350, "gate_c": 150}})

            elif step == 1:
                # Gate B crowd increases rapidly
                if gate_b:
                    gate_b.queue_length = 1240
                    gate_b.wait_time = 18
                    gate_b.utilization = 87
                    gate_b.risk_score = 75
                if gate_c:
                    gate_c.queue_length = 310
                    gate_c.wait_time = 4
                    gate_c.utilization = 51
                if zone_b:
                    zone_b.current_count = int(zone_b.capacity * 0.82)
                    zone_b.risk_score = 80
                    zone_b.risk_level = "HIGH"
                db.commit()
                
                await manager.broadcast_json({"type": "demo:step", "step": 1, "title": "Rapid Congestion", "desc": "Gate B crowd surges to 1,240 people. Wait times climb to 18 minutes. Risk levels rise."})
                await manager.broadcast_json({"type": "gate:update", "data": {"gate_b": 1240, "gate_c": 310}})

            elif step == 2:
                # AI detects anomaly
                # Create the AI Decision record
                existing_dec = db.query(AIDecision).filter(AIDecision.id == "AI-DEC-001").first()
                if not existing_dec:
                    dec = AIDecision(
                        id="AI-DEC-001",
                        title="Gate B Congestion Risk",
                        category="crowd",
                        severity="high",
                        confidence=0.91,
                        risk_score=84,
                        evidence="Queue: 1,240 visitors. Wait time: 18 minutes. Entry rate increased 34%. Density: 87%. Gate C utilization: 51%.",
                        predicted_impact="Queue buildup will cause gate overcrowding, entrance delays, and safety blockages in adjacent zones within 15 minutes.",
                        recommended_action="Redirect 20% of incoming visitors to Gate C. Update digital signs, deploy 6 stewards, send user pushes, adjust guidance.",
                        status="pending",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(dec)
                    
                    # Create workflow associated
                    wf = AIWorkflow(
                        decision_id="AI-DEC-001",
                        name="Gate B Congestion Mitigation Workflow",
                        status="pending",
                        created_at=datetime.utcnow()
                    )
                    db.add(wf)
                    db.flush()
                    
                    steps = [
                        "Update Digital Signage at Gate B Entrance.",
                        "Send push notification to affected ticketholders.",
                        "Deploy six additional stewards from reserve roster.",
                        "Adjust GPS routing guide in Spectator App.",
                        "Recheck congestion dynamics after five minutes."
                    ]
                    for idx, s_desc in enumerate(steps):
                        db.add(WorkflowStep(
                            workflow_id=wf.id,
                            step_order=idx + 1,
                            description=s_desc,
                            action_type="update_signage" if idx==0 else ("push_notification" if idx==1 else ("deploy_staff" if idx==2 else "reroute_navigation")),
                            status="pending"
                        ))
                    
                    # Also create a Security Alert
                    db.add(Notification(
                        title="AI Alert: Critical Congestion Gate B",
                        message="AI Operations Agent flagged critical congestion risk at Gate B. Mitigation workflow queued.",
                        severity="WARNING",
                        status="unread",
                        timestamp=datetime.utcnow()
                    ))
                    db.commit()
                
                await manager.broadcast_json({"type": "demo:step", "step": 2, "title": "AI Detection", "desc": "AI Operations Agent flags the anomaly, calculates an 84% risk score, and queues a mitigation workflow."})
                await manager.broadcast_json({"type": "ai:decision", "data": {
                    "id": "AI-DEC-001",
                    "title": "Gate B Congestion Risk",
                    "status": "pending",
                    "risk_score": 84,
                    "confidence": 0.91
                }})

            elif step == 3:
                # AI predicts critical congestion
                await manager.broadcast_json({"type": "demo:step", "step": 3, "title": "Predictive Forecasting", "desc": "ML models forecast congestion spillover to North Stand concourses in 15 minutes if no action is approved."})
                
            elif step == 4:
                # AI workflow waiting for approval
                await manager.broadcast_json({"type": "demo:step", "step": 4, "title": "Pending Human Approval", "desc": "Multi-step mitigation plan is ready. Waiting for Stadium Manager to click 'Approve & Execute'."})
                
        except Exception as e:
            logger.error(f"Error in demo step: {e}")
            db.rollback()
        finally:
            db.close()

    async def execute_approved_workflow(self, decision_id: str):
        db = SessionLocal()
        try:
            dec = db.query(AIDecision).filter(AIDecision.id == decision_id).first()
            if not dec:
                return False
                
            dec.status = "approved"
            db.commit()
            
            wf = db.query(AIWorkflow).filter(AIWorkflow.decision_id == decision_id).first()
            if not wf:
                return False
                
            wf.status = "executing"
            db.commit()
            
            # Execute steps sequentially
            for step in sorted(wf.steps, key=lambda x: x.step_order):
                step.status = "running"
                db.commit()
                await manager.broadcast_json({"type": "workflow:step_update", "step_id": step.id, "status": "running"})
                await asyncio.sleep(1.0) # simulate execution
                step.status = "completed"
                db.commit()
                await manager.broadcast_json({"type": "workflow:step_update", "step_id": step.id, "status": "completed"})
                
            wf.status = "completed"
            dec.status = "executed"
            
            # Apply impact of execution: congestion reduced by 27%
            gate_b = db.query(Gate).filter(Gate.name.like("%Gate B%")).first()
            gate_c = db.query(Gate).filter(Gate.name.like("%Gate C%")).first()
            zone_b = db.query(StadiumZone).filter(StadiumZone.name.like("%North Stand%")).first()
            
            if gate_b:
                gate_b.queue_length = 905 # 1240 * (1 - 0.27)
                gate_b.wait_time = 9
                gate_b.utilization = 63
                gate_b.risk_score = 30
            if gate_c:
                gate_c.queue_length = 558 # 310 + 248 redirected
                gate_c.wait_time = 7
                gate_c.utilization = 65
            if zone_b:
                zone_b.current_count = int(zone_b.capacity * 0.60)
                zone_b.risk_score = 40
                zone_b.risk_level = "MODERATE"
                
            # Log to Audit Log
            db.add(AuditLog(
                timestamp=datetime.utcnow(),
                user_email="manager@stadiumops.ai",
                action="Approve & Execute",
                resource="AIDecision",
                resource_id=decision_id,
                old_value="pending",
                new_value="executed",
                ip_address="127.0.0.1",
                status="success"
            ))
            
            # Add Success Notification
            db.add(Notification(
                title="Mitigation Complete: Congestion Reduced",
                message="Mitigation plan executed. Gate B queue reduced by 27%. Flow re-stabilized.",
                severity="SUCCESS",
                status="unread",
                timestamp=datetime.utcnow()
            ))
            
            db.commit()
            
            # Broadcast the updated status
            await manager.broadcast_json({"type": "demo:execution_complete", "summary": "Congestion reduced by 27%. Wait times returned to acceptable bounds."})
            await manager.broadcast_json({"type": "gate:update", "data": {"gate_b": 905, "gate_c": 558}})
            return True
            
        except Exception as e:
            logger.error(f"Error executing approved workflow: {e}")
            db.rollback()
            return False
        finally:
            db.close()

    async def run_loop(self):
        while True:
            try:
                if self.is_running:
                    if self.demo_mode:
                        # Handle demo mode steps advancing automatically
                        now = datetime.utcnow()
                        elapsed = (now - self.demo_last_advance).total_seconds()
                        if elapsed >= (self.demo_sec_per_step / self.speed_factor):
                            if self.demo_step < self.demo_max_steps:
                                self.demo_step += 1
                                self.demo_last_advance = now
                                await self.execute_demo_step(self.demo_step)
                    else:
                        # Normal simulation updates
                        db = SessionLocal()
                        try:
                            # 1. Update Gates queues
                            gates = db.query(Gate).all()
                            for g in gates:
                                # Jitter queue
                                delta = random.randint(-15, 15)
                                g.queue_length = max(10, g.queue_length + delta)
                                g.wait_time = max(1, int(g.queue_length / 60))
                                g.utilization = min(100, int((g.queue_length / g.capacity) * 100))
                                g.risk_score = min(100, int(g.utilization * 1.1))
                            
                            # 2. Update Zone counts
                            zones = db.query(StadiumZone).all()
                            for z in zones:
                                delta = random.randint(-20, 20)
                                z.current_count = max(0, min(z.capacity, z.current_count + delta))
                                pct = z.current_count / z.capacity
                                z.risk_score = int(pct * 100)
                                z.risk_level = "LOW" if z.risk_score <= 30 else ("MODERATE" if z.risk_score <= 60 else ("HIGH" if z.risk_score <= 80 else "CRITICAL"))
                                
                            # 3. Update Sensors
                            sensors = db.query(Sensor).all()
                            for s in sensors:
                                if "Temp" in s.type:
                                    s.current_value = round(s.current_value + random.uniform(-0.3, 0.3), 1)
                                elif "Water" in s.type:
                                    s.current_value = max(0.0, round(s.current_value + random.uniform(-1.0, 1.0), 1))
                                elif "Vibration" in s.type:
                                    s.current_value = max(0.001, round(s.current_value + random.uniform(-0.02, 0.02), 3))
                                elif "Wi-Fi" in s.type:
                                    s.current_value = max(0, int(s.current_value + random.randint(-5, 5)))
                                    
                            # 4. Update Parking lots
                            parking = db.query(ParkingLot).all()
                            for p in parking:
                                delta = random.randint(-10, 10)
                                p.occupied = max(0, min(p.capacity, p.occupied + delta))
                                p.available = p.capacity - p.occupied
                                
                            db.commit()
                            
                            # Broadcast real-time updates
                            await manager.broadcast_json({"type": "simulation:tick", "timestamp": datetime.utcnow().isoformat()})
                        except Exception as e:
                            logger.error(f"Error in normal simulation tick: {e}")
                            db.rollback()
                        finally:
                            db.close()
                            
                await asyncio.sleep(2.0)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Simulation loop error: {e}")
                await asyncio.sleep(2.0)

simulator = StadiumSimulation()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.core.security import get_password_hash
from backend.app.models.models import User, Role, Stadium, StadiumZone, Gate, Ticket, AIDecision, Tournament, Match

# Use a test SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_stadiumops.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed test roles
        admin_role = Role(name="Super Admin", description="Admin role")
        manager_role = Role(name="Stadium Manager", description="Manager role")
        db.add_all([admin_role, manager_role])
        db.flush()
        
        # Seed test user
        hashed_pwd = get_password_hash("stadium123")
        admin_user = User(username="testadmin", email="admin@stadiumops.ai", hashed_password=hashed_pwd, is_active=True)
        admin_user.roles.append(admin_role)
        db.add(admin_user)
        
        # Seed stadium, zone, gate
        stadium = Stadium(stadium_id=1, name="Test Modi Stadium", location="Ahmedabad", capacity=10000)
        db.add(stadium)
        db.flush()
        
        zone = StadiumZone(zone_id=1, stadium_id=1, name="North Stand", capacity=2000, current_count=500)
        gate = Gate(gate_id=1, stadium_id=1, name="Gate A", queue_length=150, wait_time=3, utilization=40, capacity=2000)
        db.add_all([zone, gate])
        db.flush()
        
        # Seed ticket
        ticket = Ticket(ticket_id=1, user_id=123, match_id=1, seat="S1", section="Sec1", gate_id=1, category="VIP", qr_token="QR-TEST", scan_status="Unscanned", fraud_score=10)
        db.add(ticket)
        
        # Seed AI decision
        dec = AIDecision(id="AI-DEC-001", title="Test Decision", category="crowd", severity="high", status="pending", risk_score=80)
        db.add(dec)

        # Seed tournament
        tour = Tournament(tournament_id=1, name="IPL 2026 Test", sport="Cricket", start_date="2026-07-01", end_date="2026-07-20", format="T20", status="Active")
        db.add(tour)
        
        db.commit()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if os.path.exists("./test_stadiumops.db"):
            os.remove("./test_stadiumops.db")

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@stadiumops.ai",
        "password": "stadium123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "testadmin"
    assert "Super Admin" in data["roles"]

def test_get_stadiums(client):
    response = client.get("/api/v1/stadiums")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Modi Stadium"

def test_get_crowd_current(client):
    response = client.get("/api/v1/crowd/current?stadium_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["total_occupancy"] == 500
    assert data["density_percentage"] == 25.0

def test_scan_ticket(client):
    response = client.post("/api/v1/tickets/scan", json={
        "qr_token": "QR-TEST",
        "gate_id": 1,
        "scanner_id": "SCN-1"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "Success"

def test_create_incident(client):
    response = client.post("/api/v1/incidents", json={
        "stadium_id": 1,
        "zone_id": 1,
        "incident_type": "Medical",
        "severity": "Medium",
        "description": "Visitor slipped on stairs",
        "reported_by": "Steward #14"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["incident_type"] == "Medical"
    assert data["status"] == "Reported"

def test_get_ai_decisions(client):
    response = client.get("/api/v1/ai/decisions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "AI-DEC-001"

def test_get_tournaments(client):
    response = client.get("/api/v1/tournaments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "IPL 2026 Test"

def test_get_matches(client):
    response = client.get("/api/v1/matches")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

import csv
import random
import os
import uuid
from datetime import datetime, timedelta

def generate_datasets():
    # Setup deterministic seed
    random.seed(42)
    
    os.makedirs('data', exist_ok=True)
    
    # 1. stadiums.csv (3 records)
    stadiums = [
        {"stadium_id": 1, "name": "Narendra Modi Stadium", "location": "Ahmedabad, Gujarat", "capacity": 132000, "status": "Active"},
        {"stadium_id": 2, "name": "Eden Gardens", "location": "Kolkata, West Bengal", "capacity": 66000, "status": "Active"},
        {"stadium_id": 3, "name": "Wankhede Stadium", "location": "Mumbai, Maharashtra", "capacity": 33000, "status": "Active"}
    ]
    with open('data/stadiums.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["stadium_id", "name", "location", "capacity", "status"])
        writer.writeheader()
        writer.writerows(stadiums)
        
    print("Generated stadiums.csv")

    # 2. stadium_zones.csv (40 records total)
    # Narendra Modi: 16 zones, Eden Gardens: 14 zones, Wankhede: 10 zones
    zones = []
    zone_id_counter = 1
    zone_names = [
        "North Stand", "South Stand", "East Stand", "West Stand", 
        "Club Clubhouse", "VIP Lounge North", "VIP Lounge South", "Concourse Lower A",
        "Concourse Lower B", "Concourse Upper A", "Concourse Upper B", "Food Court East", 
        "Food Court West", "Press Box", "Medical Center A", "Restricted Player Zone",
        "South Pavilion", "High Court Stand", "Grand Stand", "Corporate Box A", "Corporate Box B"
    ]
    for std in stadiums:
        std_id = std["stadium_id"]
        num_zones = 16 if std_id == 1 else (14 if std_id == 2 else 10)
        selected_names = list(set(zone_names))
        random.shuffle(selected_names)
        for i in range(num_zones):
            cap = int(std["capacity"] * random.uniform(0.02, 0.08))
            zones.append({
                "zone_id": zone_id_counter,
                "stadium_id": std_id,
                "name": f"{std['name']} - {selected_names[i % len(selected_names)]} {i//len(selected_names) + 1}",
                "capacity": cap,
                "status": "Active",
                "current_count": 0,
                "risk_level": "LOW",
                "risk_score": random.randint(5, 25)
            })
            zone_id_counter += 1
            
    with open('data/stadium_zones.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["zone_id", "stadium_id", "name", "capacity", "status", "current_count", "risk_level", "risk_score"])
        writer.writeheader()
        writer.writerows(zones)
        
    print("Generated stadium_zones.csv")

    # 3. gates.csv (16 records total)
    # Narendra Modi: 6 gates, Eden Gardens: 5 gates, Wankhede: 5 gates
    gates = []
    gate_names = ["Gate A", "Gate B", "Gate C", "Gate D", "Gate E", "Gate F", "Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate G1", "Gate G2", "Gate G3", "Gate G4", "Gate G5"]
    gate_idx = 0
    for std in stadiums:
        std_id = std["stadium_id"]
        num_gates = 6 if std_id == 1 else 5
        for _ in range(num_gates):
            gates.append({
                "gate_id": gate_idx + 1,
                "stadium_id": std_id,
                "name": gate_names[gate_idx],
                "status": "Open",
                "queue_length": random.randint(10, 150),
                "wait_time": random.randint(2, 8),
                "scan_rate": random.randint(15, 30),
                "staff_count": random.randint(4, 10),
                "capacity": 2000,
                "utilization": random.randint(20, 60),
                "risk_score": random.randint(5, 20)
            })
            gate_idx += 1
            
    with open('data/gates.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["gate_id", "stadium_id", "name", "status", "queue_length", "wait_time", "scan_rate", "staff_count", "capacity", "utilization", "risk_score"])
        writer.writeheader()
        writer.writerows(gates)
        
    print("Generated gates.csv")

    # 4. tournaments.csv (5 records)
    tournaments = [
        {"tournament_id": 1, "name": "Indian Premier League 2026", "sport": "Cricket", "start_date": "2026-03-20", "end_date": "2026-05-26", "format": "Group and Knockout", "status": "Ongoing"},
        {"tournament_id": 2, "name": "ICC Men's T20 World Cup 2026", "sport": "Cricket", "start_date": "2026-06-01", "end_date": "2026-06-29", "format": "Group and Knockout", "status": "Completed"},
        {"tournament_id": 3, "name": "Super Soccer Cup 2026", "sport": "Football", "start_date": "2026-08-15", "end_date": "2026-09-20", "format": "Knockout", "status": "Upcoming"},
        {"tournament_id": 4, "name": "Legends Kabaddi League 2026", "sport": "Kabaddi", "start_date": "2026-10-01", "end_date": "2026-11-15", "format": "League", "status": "Upcoming"},
        {"tournament_id": 5, "name": "National Athletic Meet 2026", "sport": "Athletics", "start_date": "2026-12-05", "end_date": "2026-12-12", "format": "League", "status": "Upcoming"}
    ]
    with open('data/tournaments.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["tournament_id", "name", "sport", "start_date", "end_date", "format", "status"])
        writer.writeheader()
        writer.writerows(tournaments)
        
    print("Generated tournaments.csv")

    # 5. teams.csv (32 records)
    team_names = [
        ("Mumbai Indians", "MI"), ("Chennai Super Kings", "CSK"), ("Royal Challengers Bengaluru", "RCB"),
        ("Kolkata Knight Riders", "KKR"), ("Rajasthan Royals", "RR"), ("Delhi Capitals", "DC"),
        ("Punjab Kings", "PBKS"), ("Sunrisers Hyderabad", "SRH"), ("Gujarat Titans", "GT"),
        ("Lucknow Super Giants", "LSG"), ("India", "IND"), ("Australia", "AUS"),
        ("England", "ENG"), ("South Africa", "RSA"), ("New Zealand", "NZ"),
        ("Pakistan", "PAK"), ("Sri Lanka", "SL"), ("West Indies", "WI"),
        ("Bangladesh", "BAN"), ("Afghanistan", "AFG"), ("Bengaluru FC", "BFC"),
        ("Mohun Bagan SG", "MBSG"), ("East Bengal FC", "EBFC"), ("Kerala Blasters FC", "KBFC"),
        ("Patna Pirates", "PP"), ("Bengal Warriors", "BW"), ("Dabang Delhi KC", "DDKC"),
        ("Bengaluru Bulls", "BB"), ("Gujarat Giants", "GG"), ("Telugu Titans", "TT"),
        ("Haryana Steelers", "HS"), ("U Mumba", "UM")
    ]
    teams = []
    for idx, (name, code) in enumerate(team_names):
        teams.append({
            "team_id": idx + 1,
            "name": name,
            "code": code,
            "logo_url": f"/logos/{code.lower()}.png"
        })
    with open('data/teams.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["team_id", "name", "code", "logo_url"])
        writer.writeheader()
        writer.writerows(teams)
        
    print("Generated teams.csv")

    # 6. matches.csv (100 records)
    matches = []
    start_time = datetime(2026, 3, 20, 19, 30)
    for m_id in range(1, 101):
        tour_id = random.choice([1, 2, 3, 4, 5])
        stadium = random.choice(stadiums)
        std_id = stadium["stadium_id"]
        t1, t2 = random.sample(teams, 2)
        match_dt = start_time + timedelta(days=m_id, hours=random.choice([-4, -2, 0, 2, 4]))
        gate_dt = match_dt - timedelta(hours=3)
        status = "Completed" if m_id < 60 else ("Ongoing" if m_id == 60 else "Upcoming")
        score = f"{random.randint(150, 220)}/6 - {random.randint(140, 210)}/8" if status == "Completed" else ("0/0 - 0/0" if status == "Upcoming" else "124/2 (12.3 ov)")
        matches.append({
            "match_id": m_id,
            "tournament_id": tour_id,
            "home_team_id": t1["team_id"],
            "away_team_id": t2["team_id"],
            "stadium_id": std_id,
            "match_time": match_dt.isoformat(),
            "status": status,
            "score": score,
            "gate_open_time": gate_dt.isoformat(),
            "security_level": random.choice(["Normal", "High", "Critical"])
        })
    with open('data/matches.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["match_id", "tournament_id", "home_team_id", "away_team_id", "stadium_id", "match_time", "status", "score", "gate_open_time", "security_level"])
        writer.writeheader()
        writer.writerows(matches)
        
    print("Generated matches.csv")

    # 7. tickets.csv (10,000 records)
    tickets = []
    ticket_categories = ["General", "Premium", "VIP", "Club"]
    ticket_gates = {1: [1, 2, 3, 4, 5, 6], 2: [7, 8, 9, 10, 11], 3: [12, 13, 14, 15, 16]}
    for t_id in range(1, 10001):
        m_id = (t_id % 10) + 55  # link to matches 55-64
        match = matches[m_id - 1]
        std_id = match["stadium_id"]
        allowed_gates = ticket_gates[std_id]
        gate_id = random.choice(allowed_gates)
        cat = random.choice(ticket_categories)
        qr = f"QR-{uuid.uuid4().hex[:12].upper()}"
        scan_status = "Unscanned" if t_id > 8000 else ("Scanned" if t_id % 100 != 0 else "Failed")
        scan_time = ""
        if scan_status in ["Scanned", "Failed"]:
            match_t = datetime.fromisoformat(match["match_time"])
            scan_t = match_t - timedelta(minutes=random.randint(10, 150))
            scan_time = scan_t.isoformat()
        
        fraud_score = random.randint(0, 15)
        if scan_status == "Failed":
            fraud_score = random.randint(70, 99)
            
        tickets.append({
            "ticket_id": t_id,
            "user_id": random.randint(1001, 9999),
            "match_id": m_id,
            "seat": f"S-{random.choice(['A','B','C','D'])}-{random.randint(1,100)}",
            "section": f"Sec-{random.randint(1,20)}",
            "gate_id": gate_id,
            "category": cat,
            "qr_token": qr,
            "scan_status": scan_status,
            "scan_time": scan_time,
            "fraud_score": fraud_score
        })
    with open('data/tickets.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["ticket_id", "user_id", "match_id", "seat", "section", "gate_id", "category", "qr_token", "scan_status", "scan_time", "fraud_score"])
        writer.writeheader()
        writer.writerows(tickets)
        
    print("Generated tickets.csv")

    # 8. ticket_scans.csv (25,000 records)
    ticket_scans = []
    scan_id_counter = 1
    scanned_tickets = [t for t in tickets if t["scan_status"] in ["Scanned", "Failed"]]
    for t in scanned_tickets:
        ticket_scans.append({
            "scan_id": scan_id_counter,
            "ticket_id": t["ticket_id"],
            "scan_time": t["scan_time"],
            "gate_id": t["gate_id"],
            "scanner_id": f"SCN-{t['gate_id']}-{random.randint(1,4)}",
            "result": "Success" if t["scan_status"] == "Scanned" else random.choice(["Duplicate", "Invalid QR", "Suspicious Location"]),
            "details": "Access granted" if t["scan_status"] == "Scanned" else "Access denied - flagged"
        })
        scan_id_counter += 1
        
    while len(ticket_scans) < 25000:
        t = random.choice(tickets)
        match = matches[t["match_id"] - 1]
        match_t = datetime.fromisoformat(match["match_time"])
        scan_t = match_t - timedelta(minutes=random.randint(5, 180))
        res = "Success" if random.random() > 0.05 else random.choice(["Duplicate", "Invalid QR", "Suspicious Transfer"])
        ticket_scans.append({
            "scan_id": scan_id_counter,
            "ticket_id": t["ticket_id"],
            "scan_time": scan_t.isoformat(),
            "gate_id": t["gate_id"],
            "scanner_id": f"SCN-{t['gate_id']}-{random.randint(1,4)}",
            "result": res,
            "details": "Verification passed" if res == "Success" else "flagged by fraud rules"
        })
        scan_id_counter += 1
        
    with open('data/ticket_scans.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["scan_id", "ticket_id", "scan_time", "gate_id", "scanner_id", "result", "details"])
        writer.writeheader()
        writer.writerows(ticket_scans)
        
    print("Generated ticket_scans.csv")

    # 9. crowd_readings.csv (50,000 records)
    crowd_readings = []
    phases = ["Pre-Match", "First Half", "Mid-Match", "Second Half", "Post-Match"]
    weathers = ["Sunny", "Humid", "Partly Cloudy", "Rainy", "Overcast"]
    time_base = datetime(2026, 4, 1, 12, 0)
    
    zone_caps = {z["zone_id"]: z["capacity"] for z in zones}
    
    for i in range(50000):
        zone = zones[i % len(zones)]
        z_id = zone["zone_id"]
        s_id = zone["stadium_id"]
        cap = zone_caps[z_id]
        
        timestamp = time_base + timedelta(minutes=i * 2)
        scenario = random.choices(["Normal", "Anomaly High", "Anomaly Critical"], weights=[0.85, 0.10, 0.05])[0]
        
        if scenario == "Normal":
            density = random.uniform(0.20, 0.65)
            risk_score = int(density * 100) - random.randint(0, 10)
            risk_level = "LOW" if risk_score <= 30 else "MODERATE"
        elif scenario == "Anomaly High":
            density = random.uniform(0.66, 0.80)
            risk_score = int(density * 100) + random.randint(-5, 5)
            risk_level = "HIGH"
        else:
            density = random.uniform(0.81, 1.00)
            risk_score = min(100, int(density * 100) + random.randint(0, 10))
            risk_level = "CRITICAL"
            
        risk_score = max(0, min(100, risk_score))
        curr_count = int(cap * density)
        entry_rate = random.randint(5, 50) if density < 0.8 else random.randint(0, 15)
        exit_rate = random.randint(5, 30) if density > 0.4 else random.randint(0, 10)
        speed = max(0.2, 1.6 - (density * 1.3) + random.uniform(-0.1, 0.1))
        
        crowd_readings.append({
            "timestamp": timestamp.isoformat(),
            "stadium_id": s_id,
            "zone_id": z_id,
            "current_count": curr_count,
            "zone_capacity": cap,
            "density_percentage": round(density * 100, 2),
            "entry_rate_per_minute": entry_rate,
            "exit_rate_per_minute": exit_rate,
            "average_speed_mps": round(speed, 2),
            "queue_length": random.randint(0, 450) if density > 0.5 else random.randint(0, 50),
            "average_wait_minutes": random.randint(1, 15) if density > 0.5 else random.randint(0, 2),
            "match_phase": random.choice(phases),
            "minutes_to_kickoff": random.randint(-120, 120),
            "weather_condition": random.choice(weathers),
            "temperature_celsius": random.randint(28, 38),
            "active_incidents": random.choice([0, 0, 0, 0, 1]),
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        
    with open('data/crowd_readings.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "timestamp", "stadium_id", "zone_id", "current_count", "zone_capacity", "density_percentage",
            "entry_rate_per_minute", "exit_rate_per_minute", "average_speed_mps", "queue_length", 
            "average_wait_minutes", "match_phase", "minutes_to_kickoff", "weather_condition", 
            "temperature_celsius", "active_incidents", "risk_score", "risk_level"
        ])
        writer.writeheader()
        writer.writerows(crowd_readings)
        
    print("Generated crowd_readings.csv")

    # 10. incidents.csv (1,000 records)
    incidents = []
    inc_types = ["Medical", "Security", "Crowd", "Fire", "Facility", "Missing Person", "Suspicious Activity", "Ticket Fraud", "Weather"]
    teams_list = ["First Aid Squad A", "Security Patrol Beta", "Crowd Control Team 1", "Fire Dispatch", "Maintenance Crew Red", "Guest Services Team"]
    statuses = ["Reported", "Verified", "Assigned", "Responding", "Monitoring", "Resolved", "Closed"]
    
    sevs_pool = (["Low"] * 600) + (["Medium"] * 250) + (["High"] * 100) + (["Critical"] * 50)
    random.shuffle(sevs_pool)
    
    for inc_id in range(1, 1001):
        zone = random.choice(zones)
        z_id = zone["zone_id"]
        s_id = zone["stadium_id"]
        inc_type = random.choice(inc_types)
        severity = sevs_pool[inc_id - 1]
        
        if inc_type == "Medical":
            desc = random.choice(["Heat exhaustion reported", "Dehydration in stand", "Minor cuts and bruises", "Sprained ankle on steps", "Visitor complaining of chest pain"])
        elif inc_type == "Security":
            desc = random.choice(["Verbal alteration between fans", "Unauthorized restricted zone access", "Tailgating at outer perimeter", "Unruly fan behavior reported"])
        elif inc_type == "Crowd":
            desc = random.choice(["Congestion near turnstiles", "Stairwell bottlenecks developing", "Gate rush attempts", "Slow moving crowd blockages"])
        elif inc_type == "Fire":
            desc = random.choice(["Smoke detected near food court kitchen", "Small electrical spark in junction box", "Trash bin smoldering", "Heat alarm triggered in generator room"])
        elif inc_type == "Facility":
            desc = random.choice(["HVAC failure in West box", "Water pipe leak in washroom B", "Escalator 2 stopped operating", "Floodlight panel flickering"])
        else:
            desc = f"Reported {inc_type.lower()} event details logged by staff"
            
        reported_by = random.choice(["Sensor Node AI", "Steward #1402", "Spectator App", "CCTV Video Analytics", "Gate Supervisor"])
        ai_det = random.choice(["True", "False"])
        ai_conf = round(random.uniform(0.70, 0.98), 2) if ai_det == "True" else 0.0
        
        res_time = random.randint(5, 30) if severity in ["Low", "Medium"] else random.randint(2, 10)
        res_minutes = random.randint(15, 120) if severity != "Critical" else random.randint(10, 45)
        status = random.choice(statuses) if inc_id < 980 else random.choice(["Reported", "Verified", "Assigned"])
        
        inc_time = time_base + timedelta(minutes=random.randint(10, 10000))
        
        incidents.append({
            "incident_id": inc_id,
            "timestamp": inc_time.isoformat(),
            "stadium_id": s_id,
            "zone_id": z_id,
            "incident_type": inc_type,
            "severity": severity,
            "description": desc,
            "reported_by": reported_by,
            "ai_detected": ai_det,
            "ai_confidence": ai_conf,
            "assigned_team": random.choice(teams_list),
            "response_time_minutes": res_time,
            "resolution_time_minutes": res_minutes,
            "status": status
        })
        
    with open('data/incidents.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            "incident_id", "timestamp", "stadium_id", "zone_id", "incident_type", "severity", "description", 
            "reported_by", "ai_detected", "ai_confidence", "assigned_team", "response_time_minutes", 
            "resolution_time_minutes", "status"
        ])
        writer.writeheader()
        writer.writerows(incidents)
        
    print("Generated incidents.csv")

    # 11. staff.csv (1,500 records)
    staff = []
    departments = ["Security", "Medical", "Crowd Control", "Facilities", "Guest Services", "Administration"]
    roles_pool = {
        "Security": ["Security Commander", "Patrol Officer", "Gate Guard"],
        "Medical": ["Emergency Coordinator", "First Aid Specialist", "Doctor"],
        "Crowd Control": ["Steward", "Zone Lead", "Volunteer Coordinator"],
        "Facilities": ["Maintenance Technician", "HVAC Inspector", "Electrician"],
        "Guest Services": ["Usher", "Information Desk Agent", "Volunteer"],
        "Administration": ["Stadium Manager", "Tournament Director", "Analyst"]
    }
    certifications = {
        "Security": "SIA License, First Responder",
        "Medical": "BLS Certification, Medical Practitioner License",
        "Crowd Control": "Crowd Safety Level 2, Event Management",
        "Facilities": "HVAC Certified, Electrician License",
        "Guest Services": "Customer Service Excellence",
        "Administration": "Sports Management Diploma"
    }
    names_pool = ["Aarav", "Vivaan", "Aditya", "Sai", "Reyansh", "Krishna", "Ishaan", "Shaurya", "Atharv", "Arjun", "Diya", "Aanya", "Pari", "Ananya", "Myra", "Saanvi", "Aadhya", "Riya", "Kavya", "Anika", "Rahul", "Amit", "Rohan", "Pooja", "Vikram", "Sneha", "Karan", "Simran", "Raj", "Neha"]
    surnames_pool = ["Sharma", "Patel", "Verma", "Mehra", "Joshi", "Kumar", "Singh", "Nair", "Reddy", "Gupta", "Sen", "Bose", "Choudhury", "Iyer", "Rao", "Shetty", "Deshmukh", "Pillai", "Das", "Roy"]
    
    for s_id in range(1, 1501):
        name = f"{random.choice(names_pool)} {random.choice(surnames_pool)}"
        dep = random.choice(departments)
        role = random.choice(roles_pool[dep])
        email = f"{name.lower().replace(' ', '.')}.{s_id}@stadiumops.ai"
        status = random.choice(["Active", "On Break", "Off Duty"])
        phone = f"+91 {random.randint(7000000000, 9999999999)}"
        cert = certifications[dep]
        
        staff.append({
            "staff_id": s_id,
            "name": name,
            "email": email,
            "department": dep,
            "role": role,
            "status": status,
            "phone": phone,
            "certifications": cert
        })
        
    with open('data/staff.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["staff_id", "name", "email", "department", "role", "status", "phone", "certifications"])
        writer.writeheader()
        writer.writerows(staff)
        
    print("Generated staff.csv")

    # 12. staff_assignments.csv (5,000 records)
    assignments = []
    for a_id in range(1, 5001):
        s_member = random.choice(staff)
        zone = random.choice(zones)
        z_id = zone["zone_id"]
        shift_id = random.randint(101, 250)
        status = random.choices(["Scheduled", "In Progress", "Completed", "Absent"], weights=[0.10, 0.40, 0.48, 0.02])[0]
        
        assignments.append({
            "assignment_id": a_id,
            "staff_id": s_member["staff_id"],
            "shift_id": shift_id,
            "zone_id": z_id,
            "task_description": f"Perform {s_member['department']} duties in assigned zone area.",
            "status": status
        })
        
    with open('data/staff_assignments.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["assignment_id", "staff_id", "shift_id", "zone_id", "task_description", "status"])
        writer.writeheader()
        writer.writerows(assignments)
        
    print("Generated staff_assignments.csv")

    # 13. parking.csv (10,000 readings)
    parking = []
    parking_lots = [
        {"lot_id": 1, "name": "Narendra Modi Lot North", "stadium_id": 1, "capacity": 5000},
        {"lot_id": 2, "name": "Narendra Modi Lot South", "stadium_id": 1, "capacity": 7000},
        {"lot_id": 3, "name": "Eden Gardens Main Lot", "stadium_id": 2, "capacity": 3000},
        {"lot_id": 4, "name": "Wankhede West Lot", "stadium_id": 3, "capacity": 1500}
    ]
    p_time_base = datetime(2026, 4, 1, 10, 0)
    for p_id in range(1, 10001):
        lot = parking_lots[p_id % len(parking_lots)]
        lot_id = lot["lot_id"]
        cap = lot["capacity"]
        
        timestamp = p_time_base + timedelta(minutes=p_id * 2)
        hour = timestamp.hour
        if 14 <= hour <= 19:
            occ_pct = random.uniform(0.70, 0.98)
            entry = random.randint(15, 60)
            exit_rate = random.randint(1, 10)
        elif 19 <= hour <= 22:
            occ_pct = random.uniform(0.90, 0.99)
            entry = random.randint(0, 5)
            exit_rate = random.randint(0, 5)
        elif 22 <= hour <= 23:
            occ_pct = random.uniform(0.30, 0.85)
            entry = random.randint(0, 2)
            exit_rate = random.randint(80, 150)
        else:
            occ_pct = random.uniform(0.05, 0.30)
            entry = random.randint(1, 10)
            exit_rate = random.randint(1, 10)
            
        occupied = int(cap * occ_pct)
        parking.append({
            "parking_id": p_id,
            "parking_lot_id": lot_id,
            "timestamp": timestamp.isoformat(),
            "occupied": occupied,
            "entry_rate": entry,
            "exit_rate": exit_rate
        })
        
    with open('data/parking.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["parking_id", "parking_lot_id", "timestamp", "occupied", "entry_rate", "exit_rate"])
        writer.writeheader()
        writer.writerows(parking)
        
    print("Generated parking.csv")

    # 14. facility_sensors.csv (25,000 readings)
    sensors_readings = []
    sensor_types = ["HVAC Temp Sensor", "Lighting Controller", "Water Flow Meter", "Backup Generator", "Escalator Vibration Sensor", "Wi-Fi Access Point"]
    
    sensors_list = []
    for s_idx in range(1, 101):
        zone = random.choice(zones)
        stype = random.choice(sensor_types)
        sensors_list.append({
            "sensor_id": f"SEN-{s_idx:03d}",
            "name": f"{zone['name']} - {stype}",
            "type": stype,
            "zone_id": zone["zone_id"],
            "status": "Healthy" if random.random() > 0.04 else "Maintenance Required"
        })
        
    sens_time_base = datetime(2026, 4, 1, 8, 0)
    for r_id in range(1, 25001):
        sensor = sensors_list[r_id % len(sensors_list)]
        timestamp = sens_time_base + timedelta(minutes=r_id * 1)
        
        if "Temp" in sensor["type"]:
            val = round(random.uniform(19.0, 25.0), 1)
        elif "Lighting" in sensor["type"]:
            val = round(random.choice([0.0, 100.0, 80.0, 50.0]), 1)
        elif "Water" in sensor["type"]:
            val = round(random.uniform(5.0, 45.0), 1)
        elif "Generator" in sensor["type"]:
            val = round(random.choice([0.0, 100.0, 12.0]), 1)
        elif "Vibration" in sensor["type"]:
            val = round(random.uniform(0.01, 0.45), 3)
        else:
            val = round(random.randint(10, 250), 1)
            
        health = random.randint(85, 100) if sensor["status"] == "Healthy" else random.randint(20, 60)
        
        sensors_readings.append({
            "sensor_id": sensor["sensor_id"],
            "name": sensor["name"],
            "type": sensor["type"],
            "zone_id": sensor["zone_id"],
            "status": sensor["status"],
            "last_reading": timestamp.isoformat(),
            "current_value": val,
            "health_score": health
        })
        
    with open('data/facility_sensors.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["sensor_id", "name", "type", "zone_id", "status", "last_reading", "current_value", "health_score"])
        writer.writeheader()
        writer.writerows(sensors_readings)
        
    print("Generated facility_sensors.csv")

    # 15. energy_readings.csv (20,000 records)
    energy = []
    e_time_base = datetime(2026, 4, 1, 0, 0)
    for e_id in range(1, 20001):
        timestamp = e_time_base + timedelta(minutes=e_id * 15)
        hour = timestamp.hour
        is_match = (e_id % 96) in [15, 30, 45, 60, 75]
        
        if is_match and 16 <= hour <= 23:
            elec = random.uniform(800.0, 1500.0)
            water = random.uniform(5000.0, 12000.0)
            solar = random.uniform(0.0, 50.0)
        else:
            elec = random.uniform(150.0, 350.0)
            water = random.uniform(800.0, 2500.0)
            solar = random.uniform(100.0, 450.0) if 8 <= hour <= 16 else 0.0
            
        carbon = (elec * 0.85) - (solar * 0.40)
        
        energy.append({
            "timestamp": timestamp.isoformat(),
            "electricity_kwh": round(elec, 2),
            "water_liters": round(water, 2),
            "carbon_emissions_kg": round(max(5.0, carbon), 2),
            "solar_generation_kwh": round(solar, 2),
            "temperature_c": round(random.uniform(25.0, 40.0), 1)
        })
        
    with open('data/energy_readings.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["timestamp", "electricity_kwh", "water_liters", "carbon_emissions_kg", "solar_generation_kwh", "temperature_c"])
        writer.writeheader()
        writer.writerows(energy)
        
    print("Generated energy_readings.csv")

    # 16. lost_found.csv (500 records)
    lost_found = []
    categories = ["Electronics", "Wallets/IDs", "Bags/Backpacks", "Apparel", "Keys", "Other"]
    
    items = []
    for lf_id in range(1, 501):
        item_type = "Lost" if lf_id <= 250 else "Found"
        cat = random.choice(categories)
        zone = random.choice(zones)
        
        if cat == "Electronics":
            desc = random.choice(["Black iPhone 13 in transparent case", "Samsung Galaxy S22 with cracked back", "Apple Airpods Pro in white case", "Red noise-cancelling headphones"])
        elif cat == "Wallets/IDs":
            desc = random.choice(["Brown leather wallet with driver's license", "Black cardholder containing credit cards", "Indian Passport under name Rohit", "Student ID card in blue lanyard"])
        else:
            desc = f"Lost/Found {cat.lower()} item near seat area"
            
        timestamp = time_base + timedelta(minutes=random.randint(60, 50000))
        
        items.append({
            "item_id": lf_id,
            "type": item_type,
            "category": cat,
            "description": desc,
            "location_lost": zone["name"] if item_type == "Lost" else "",
            "location_found": zone["name"] if item_type == "Found" else "",
            "time_lost": timestamp.isoformat() if item_type == "Lost" else "",
            "time_found": timestamp.isoformat() if item_type == "Found" else "",
            "status": "Lost" if item_type == "Lost" else "Found",
            "matched_item_id": "",
            "match_score": 0.0
        })
        
    for i in range(50):
        lost_idx = i
        found_idx = 250 + i
        items[lost_idx]["status"] = "Matched"
        items[found_idx]["status"] = "Matched"
        items[lost_idx]["matched_item_id"] = found_idx + 1
        items[found_idx]["matched_item_id"] = lost_idx + 1
        items[found_idx]["category"] = items[lost_idx]["category"]
        items[found_idx]["description"] = items[lost_idx]["description"].replace("cracked back", "cracked screen").replace("transparent case", "silicone case")
        items[lost_idx]["match_score"] = round(random.uniform(0.72, 0.95), 2)
        items[found_idx]["match_score"] = items[lost_idx]["match_score"]
        
    with open('data/lost_found.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["item_id", "type", "category", "description", "location_lost", "location_found", "time_lost", "time_found", "status", "matched_item_id", "match_score"])
        writer.writeheader()
        writer.writerows(items)
        
    print("Generated lost_found.csv")

    # 17. ai_decisions.csv (1,000 records)
    decisions = []
    categories = ["crowd", "security", "facility", "weather", "emergency"]
    severities = ["low", "medium", "high", "critical"]
    statuses = ["pending", "approved", "rejected", "executed"]
    
    for d_id in range(1, 1001):
        cat = random.choice(categories)
        sev = random.choices(severities, weights=[0.40, 0.35, 0.20, 0.05])[0]
        status = random.choice(statuses) if d_id < 980 else "pending"
        conf = round(random.uniform(0.75, 0.99), 2)
        risk = random.randint(40, 95) if sev in ["high", "critical"] else random.randint(10, 40)
        
        if cat == "crowd":
            title = "Gate B Congestion Re-routing"
            evidence = "Queue exceeding 800 people at Gate B, average wait is 18 minutes. Nearby Gate C is only 30% utilized."
            pred = "Queue build-up will create secondary pressure on turnstiles and escalate safety risks in 15 minutes."
            rec = "Redirect 20% of incoming attendees to Gate C using digital signs and push alerts."
        elif cat == "security":
            title = "Restricted Zone Entry Warning"
            evidence = "Thermal camera detection of individual in Restricted Zone 4 near Player Dressing Room corridor."
            pred = "Unauthorized individual could access secure player areas within 2 minutes."
            rec = "Deploy nearest security team to intercept and verify credentials."
        else:
            title = f"AI Operational Optimization ({cat.upper()})"
            evidence = "Telemetry indicators suggest anomaly patterns in recent logs."
            pred = "System efficiency could decline if no optimization actions are taken."
            rec = "Verify facility configurations and deploy maintenance inspectors."
            
        timestamp = time_base + timedelta(minutes=random.randint(10, 50000))
        
        decisions.append({
            "decision_id": f"AI-DEC-{d_id:03d}",
            "title": title,
            "category": cat,
            "severity": sev,
            "confidence": conf,
            "risk_score": risk,
            "evidence": evidence,
            "predicted_impact": pred,
            "recommended_action": rec,
            "status": status,
            "created_at": timestamp.isoformat()
        })
        
    with open('data/ai_decisions.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["decision_id", "title", "category", "severity", "confidence", "risk_score", "evidence", "predicted_impact", "recommended_action", "status", "created_at"])
        writer.writeheader()
        writer.writerows(decisions)
        
    print("Generated ai_decisions.csv")
    print("ALL CSV DATASETS SUCCESSFULLY GENERATED.")

if __name__ == '__main__':
    generate_datasets()

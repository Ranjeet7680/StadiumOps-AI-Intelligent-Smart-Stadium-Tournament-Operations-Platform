import re
from datetime import datetime

def clean_text(text: str) -> list:
    if not text:
        return []
    # Lowercase and split words, filtering out common short words/stopwords
    text = text.lower()
    words = re.findall(r'\b\w+\b', text)
    stopwords = {'in', 'a', 'the', 'with', 'of', 'and', 'or', 'on', 'at', 'by', 'for', 'an', 'to', 'near', 'under', 'cracked', 'case'}
    return [w for w in words if w not in stopwords]

def calculate_desc_similarity(desc1: str, desc2: str) -> float:
    w1 = set(clean_text(desc1))
    w2 = set(clean_text(desc2))
    if not w1 or not w2:
        return 0.0
    intersection = w1.intersection(w2)
    union = w1.union(w2)
    return len(intersection) / len(union)

def calculate_location_similarity(loc1: str, loc2: str) -> float:
    if not loc1 or not loc2:
        return 0.0
    loc1_clean = loc1.lower().strip()
    loc2_clean = loc2.lower().strip()
    if loc1_clean == loc2_clean:
        return 1.0
    w1 = set(clean_text(loc1))
    w2 = set(clean_text(loc2))
    intersection = w1.intersection(w2)
    if intersection:
        return 0.5
    return 0.0

def calculate_time_similarity(t1: datetime, t2: datetime) -> float:
    if not t1 or not t2:
        return 0.0
    diff = abs((t1 - t2).total_seconds())
    diff_hours = diff / 3600.0
    # Decays over 48 hours
    return max(0.0, 1.0 - (diff_hours / 48.0))

def compute_match_score(lost_item, found_item) -> float:
    # 1. Category Match (0.15)
    cat_match = 1.0 if lost_item.category.lower().strip() == found_item.category.lower().strip() else 0.0
    
    # 2. Location Similarity (0.25)
    loc_sim = calculate_location_similarity(lost_item.location_lost, found_item.location_found)
    
    # 3. Time Similarity (0.20)
    time_sim = calculate_time_similarity(lost_item.time_lost, found_item.time_found)
    
    # 4. Description Similarity (0.40)
    desc_sim = calculate_desc_similarity(lost_item.description, found_item.description)
    
    # Weighted Score
    score = (desc_sim * 0.40) + (loc_sim * 0.25) + (time_sim * 0.20) + (cat_match * 0.15)
    return round(score, 2)

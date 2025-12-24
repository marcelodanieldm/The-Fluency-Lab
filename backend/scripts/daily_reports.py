"""
============================================
THE FLUENCY LAB - DAILY REPORTS GENERATOR
Data Analytics for Business Intelligence
============================================

This script generates comprehensive daily reports for stakeholders including:
- User engagement metrics by role (Free vs Student)
- Most common IT English mistakes (Top 10 heatmap)
- Conversion triggers for automated upgrade offers

Author: Data Lead Team
Dependencies: pandas, sqlite3, matplotlib, seaborn
"""

import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from pathlib import Path
import json
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
from typing import Dict, List, Tuple

# ============================================
# CONFIGURATION
# ============================================

DB_PATH = 'fluency_lab.db'
REPORTS_DIR = 'reports'
CONVERSION_THRESHOLD = {
    'min_sessions': 3,
    'min_confidence_score': 8.0,
    'consecutive_required': True
}

# ============================================
# DATABASE SETUP
# ============================================

def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('free', 'student', 'coach', 'superuser')),
            english_level TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP
        )
    ''')
    
    # Coaching sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS coaching_sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            session_topic TEXT,
            user_level TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ended_at TIMESTAMP,
            duration_seconds INTEGER,
            confidence_score INTEGER CHECK(confidence_score BETWEEN 1 AND 10),
            message_count INTEGER,
            error_count INTEGER,
            phase TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Detected errors table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detected_errors (
            error_id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            error_type TEXT NOT NULL CHECK(error_type IN ('grammar', 'pronunciation', 'vocabulary')),
            error_category TEXT,
            error_text TEXT NOT NULL,
            severity TEXT CHECK(severity IN ('low', 'medium', 'high')),
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES coaching_sessions(session_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # IT-specific errors tracking
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS it_errors (
            error_id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            domain TEXT NOT NULL,
            error_pattern TEXT NOT NULL,
            correct_form TEXT,
            frequency INTEGER DEFAULT 1,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES coaching_sessions(session_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Pricing errors (from dynamic pricing system)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pricing_errors (
            error_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            error TEXT NOT NULL,
            category TEXT,
            domain TEXT NOT NULL,
            session_id TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Lead scores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS lead_scores (
            score_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            lead_status TEXT NOT NULL,
            overall_score REAL,
            readiness_score REAL,
            urgency_score REAL,
            value_score REAL,
            calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    # Conversion triggers
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversion_triggers (
            trigger_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            trigger_type TEXT NOT NULL,
            conditions_met TEXT,
            confidence_scores TEXT,
            triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            offer_sent BOOLEAN DEFAULT FALSE,
            offer_accepted BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully")

# ============================================
# DATA INSERTION (FOR TESTING/DEMO)
# ============================================

def insert_sample_data():
    """Insert sample data for demonstration"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Sample users
    users = [
        ('user001', 'free1@fluencylab.com', 'free', 'B1', '2024-12-01', '2024-12-24'),
        ('user002', 'free2@fluencylab.com', 'free', 'B2', '2024-12-05', '2024-12-24'),
        ('user003', 'free3@fluencylab.com', 'free', 'C1', '2024-12-10', '2024-12-24'),
        ('user004', 'student1@fluencylab.com', 'student', 'B2', '2024-11-15', '2024-12-24'),
        ('user005', 'student2@fluencylab.com', 'student', 'C1', '2024-11-20', '2024-12-24'),
        ('user006', 'student3@fluencylab.com', 'student', 'C2', '2024-12-01', '2024-12-24'),
        ('user007', 'free4@fluencylab.com', 'free', 'B1', '2024-12-15', '2024-12-24'),
        ('user008', 'student4@fluencylab.com', 'student', 'B2', '2024-12-08', '2024-12-24'),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (user_id, email, role, english_level, created_at, last_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', users)
    
    # Sample coaching sessions (with conversion candidates)
    sessions = []
    
    # User002: Free user with 3 consecutive high scores (CONVERSION CANDIDATE)
    for i in range(1, 4):
        sessions.append((
            f'session-user002-{i}',
            'user002',
            'Daily Stand-up',
            'B2',
            f'2024-12-{21+i} 09:00:00',
            f'2024-12-{21+i} 09:10:00',
            600,
            9,  # High confidence score
            8,
            2,
            'closed'
        ))
    
    # User003: Free user with 4 consecutive high scores (CONVERSION CANDIDATE)
    for i in range(1, 5):
        sessions.append((
            f'session-user003-{i}',
            'user003',
            'Code Review',
            'C1',
            f'2024-12-{20+i} 14:00:00',
            f'2024-12-{20+i} 14:10:00',
            600,
            8 if i <= 3 else 10,  # High confidence scores
            10,
            1,
            'closed'
        ))
    
    # User001: Free user but low scores (NOT a candidate)
    for i in range(1, 3):
        sessions.append((
            f'session-user001-{i}',
            'user001',
            'Daily Stand-up',
            'B1',
            f'2024-12-{22+i} 10:00:00',
            f'2024-12-{22+i} 10:10:00',
            600,
            6,  # Lower score
            6,
            5,
            'closed'
        ))
    
    # Student users (active sessions)
    student_sessions = [
        ('session-user004-1', 'user004', 'Technical Presentation', 'B2', '2024-12-23 11:00:00', '2024-12-23 11:10:00', 600, 7, 9, 3, 'closed'),
        ('session-user004-2', 'user004', 'Daily Stand-up', 'B2', '2024-12-24 09:00:00', '2024-12-24 09:10:00', 600, 8, 8, 2, 'closed'),
        ('session-user005-1', 'user005', 'Client Meeting', 'C1', '2024-12-22 15:00:00', '2024-12-22 15:10:00', 600, 9, 12, 1, 'closed'),
        ('session-user005-2', 'user005', 'Team Leadership', 'C1', '2024-12-23 10:00:00', '2024-12-23 10:10:00', 600, 8, 10, 2, 'closed'),
        ('session-user005-3', 'user005', 'Code Review', 'C1', '2024-12-24 14:00:00', '2024-12-24 14:10:00', 600, 9, 11, 1, 'closed'),
        ('session-user006-1', 'user006', 'Technical Presentation', 'C2', '2024-12-20 16:00:00', '2024-12-20 16:10:00', 600, 9, 13, 1, 'closed'),
        ('session-user008-1', 'user008', 'Incident Report', 'B2', '2024-12-21 13:00:00', '2024-12-21 13:10:00', 600, 7, 7, 4, 'closed'),
    ]
    
    sessions.extend(student_sessions)
    
    cursor.executemany('''
        INSERT OR IGNORE INTO coaching_sessions 
        (session_id, user_id, session_topic, user_level, started_at, ended_at, duration_seconds, confidence_score, message_count, error_count, phase)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sessions)
    
    # Sample IT errors (most common mistakes)
    it_errors = [
        # Grammar errors
        ('session-user002-1', 'user002', 'grammar', 'Missing article: "working on system"', 'working on THE system'),
        ('session-user003-1', 'user003', 'grammar', 'Wrong preposition: "responsible of"', 'responsible FOR'),
        ('session-user001-1', 'user001', 'grammar', 'Missing article: "fixing bug"', 'fixing THE bug'),
        ('session-user004-1', 'user004', 'grammar', 'Wrong verb: "make a meeting"', 'HOLD a meeting'),
        ('session-user001-2', 'user001', 'grammar', 'Missing article: "deployed application"', 'deployed THE application'),
        ('session-user002-2', 'user002', 'grammar', 'Wrong preposition: "depends of"', 'depends ON'),
        ('session-user008-1', 'user008', 'grammar', 'Plural error: "informations"', 'information'),
        ('session-user004-2', 'user004', 'grammar', 'Wrong verb: "assist to meeting"', 'ATTEND the meeting'),
        ('session-user003-2', 'user003', 'grammar', 'Missing article: "writing code"', 'writing THE code'),
        ('session-user002-3', 'user002', 'grammar', 'Wrong preposition: "in charge of"', 'responsible FOR'),
        
        # Pronunciation errors
        ('session-user001-1', 'user001', 'pronunciation', 'Mispronounced: library', 'LIE-bruh-ree'),
        ('session-user002-1', 'user002', 'pronunciation', 'Mispronounced: cache', 'CASH'),
        ('session-user003-1', 'user003', 'pronunciation', 'Mispronounced: SQL', 'ESS-cue-ell or SEE-quel'),
        ('session-user004-1', 'user004', 'pronunciation', 'Mispronounced: algorithm', 'AL-go-rith-um'),
        ('session-user005-1', 'user005', 'pronunciation', 'Mispronounced: hierarchy', 'HI-er-ar-kee'),
        ('session-user001-2', 'user001', 'pronunciation', 'Mispronounced: library', 'LIE-bruh-ree'),
        ('session-user008-1', 'user008', 'pronunciation', 'Mispronounced: cache', 'CASH'),
        ('session-user002-2', 'user002', 'pronunciation', 'Mispronounced: integer', 'IN-tuh-jer'),
        ('session-user006-1', 'user006', 'pronunciation', 'Mispronounced: GUI', 'GOO-ee'),
        ('session-user003-2', 'user003', 'pronunciation', 'Mispronounced: deploy', 'dee-PLOY'),
        
        # Vocabulary errors
        ('session-user001-1', 'user001', 'vocabulary', 'Basic phrase: "I am working on"', 'I\'m currently driving'),
        ('session-user002-1', 'user002', 'vocabulary', 'Basic phrase: "I think"', 'In my assessment'),
        ('session-user003-1', 'user003', 'vocabulary', 'Basic phrase: "We have a problem"', 'We\'re facing a challenge'),
        ('session-user004-1', 'user004', 'vocabulary', 'Basic phrase: "I need to do"', 'I\'m prioritizing'),
        ('session-user005-1', 'user005', 'vocabulary', 'Basic phrase: "It works"', 'It performs as expected'),
        ('session-user001-2', 'user001', 'vocabulary', 'Basic phrase: "I fixed"', 'I resolved'),
        ('session-user008-1', 'user008', 'vocabulary', 'Basic phrase: "Good"', 'Solid'),
        ('session-user002-2', 'user002', 'vocabulary', 'Basic phrase: "Fast"', 'Performant'),
        ('session-user003-2', 'user003', 'vocabulary', 'Basic phrase: "I don\'t know"', 'I\'ll need to investigate'),
        ('session-user004-2', 'user004', 'vocabulary', 'Basic phrase: "Big problem"', 'Substantial challenge'),
    ]
    
    for session_id, user_id, error_type, error_text, correct_form in it_errors:
        cursor.execute('''
            INSERT INTO detected_errors (session_id, user_id, error_type, error_category, error_text, severity)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (session_id, user_id, error_type, 'IT_English', error_text, 'medium'))
    
    conn.commit()
    conn.close()
    print("✅ Sample data inserted successfully")

# ============================================
# ENGAGEMENT ANALYSIS
# ============================================

def calculate_engagement_by_role(days=7):
    """
    Calculate engagement metrics grouped by user role
    
    Returns:
        DataFrame with engagement metrics per role
    """
    conn = sqlite3.connect(DB_PATH)
    
    # Calculate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    query = f'''
        SELECT 
            u.role,
            COUNT(DISTINCT u.user_id) as total_users,
            COUNT(DISTINCT cs.session_id) as total_sessions,
            ROUND(AVG(cs.confidence_score), 2) as avg_confidence_score,
            ROUND(AVG(cs.error_count), 2) as avg_errors_per_session,
            ROUND(COUNT(DISTINCT cs.session_id) * 1.0 / COUNT(DISTINCT u.user_id), 2) as sessions_per_user
        FROM users u
        LEFT JOIN coaching_sessions cs ON u.user_id = cs.user_id
        WHERE cs.started_at >= datetime('now', '-{days} days')
        GROUP BY u.role
        ORDER BY 
            CASE u.role 
                WHEN 'free' THEN 1
                WHEN 'student' THEN 2
                WHEN 'coach' THEN 3
                WHEN 'superuser' THEN 4
            END
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df

def get_weekly_session_trends(days=30):
    """Get session trends by week and role"""
    conn = sqlite3.connect(DB_PATH)
    
    query = f'''
        SELECT 
            u.role,
            strftime('%Y-W%W', cs.started_at) as week,
            COUNT(DISTINCT cs.session_id) as sessions,
            COUNT(DISTINCT u.user_id) as active_users,
            ROUND(AVG(cs.confidence_score), 2) as avg_confidence
        FROM users u
        JOIN coaching_sessions cs ON u.user_id = cs.user_id
        WHERE cs.started_at >= datetime('now', '-{days} days')
        GROUP BY u.role, week
        ORDER BY week DESC, u.role
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df

# ============================================
# COMMON MISTAKES ANALYSIS
# ============================================

def get_top_common_mistakes(limit=10):
    """
    Identify the most common IT English mistakes
    
    Returns:
        DataFrame with top mistakes ranked by frequency
    """
    conn = sqlite3.connect(DB_PATH)
    
    query = f'''
        SELECT 
            error_type,
            error_text as mistake,
            COUNT(*) as frequency,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM detected_errors), 2) as percentage,
            GROUP_CONCAT(DISTINCT session_id) as sample_sessions
        FROM detected_errors
        WHERE detected_at >= datetime('now', '-30 days')
        GROUP BY error_type, error_text
        ORDER BY frequency DESC
        LIMIT {limit}
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df

def get_mistakes_heatmap_data():
    """Get data for mistakes heatmap visualization"""
    conn = sqlite3.connect(DB_PATH)
    
    query = '''
        SELECT 
            error_type,
            CASE 
                WHEN error_text LIKE '%article%' THEN 'Articles'
                WHEN error_text LIKE '%preposition%' THEN 'Prepositions'
                WHEN error_text LIKE '%verb%' THEN 'Verbs'
                WHEN error_text LIKE '%Plural%' OR error_text LIKE '%informations%' OR error_text LIKE '%softwares%' THEN 'Plurals'
                WHEN error_text LIKE '%Mispronounced%' THEN 'Pronunciation'
                WHEN error_text LIKE '%Basic phrase%' THEN 'Vocabulary_Upgrade'
                ELSE 'Other'
            END as category,
            COUNT(*) as count
        FROM detected_errors
        WHERE detected_at >= datetime('now', '-30 days')
        GROUP BY error_type, category
        ORDER BY count DESC
    '''
    
    df = pd.read_sql_query(query, conn)
    
    # Pivot for heatmap
    heatmap_df = df.pivot_table(
        index='category', 
        columns='error_type', 
        values='count', 
        fill_value=0
    )
    
    conn.close()
    
    return heatmap_df

# ============================================
# CONVERSION TRIGGER DETECTION
# ============================================

def detect_conversion_candidates():
    """
    Identify Free users ready for upgrade to Executive level
    
    Criteria:
    - Role: Free
    - 3+ consecutive sessions
    - Confidence score > 8/10 in all sessions
    
    Returns:
        DataFrame with conversion candidates
    """
    conn = sqlite3.connect(DB_PATH)
    
    # Get all free users with their recent sessions
    query = '''
        SELECT 
            u.user_id,
            u.email,
            u.english_level,
            cs.session_id,
            cs.confidence_score,
            cs.started_at,
            cs.error_count
        FROM users u
        JOIN coaching_sessions cs ON u.user_id = cs.user_id
        WHERE u.role = 'free'
            AND cs.ended_at IS NOT NULL
            AND cs.started_at >= datetime('now', '-14 days')
        ORDER BY u.user_id, cs.started_at DESC
    '''
    
    df = pd.read_sql_query(query, conn)
    
    # Process each user
    candidates = []
    
    for user_id, user_sessions in df.groupby('user_id'):
        user_sessions = user_sessions.sort_values('started_at', ascending=False)
        
        # Get last 3-5 sessions
        recent_sessions = user_sessions.head(5)
        
        # Check for consecutive high scores
        consecutive_high_scores = 0
        max_consecutive = 0
        scores_list = []
        
        for _, session in recent_sessions.iterrows():
            score = session['confidence_score']
            scores_list.append(score)
            
            if score >= CONVERSION_THRESHOLD['min_confidence_score']:
                consecutive_high_scores += 1
                max_consecutive = max(max_consecutive, consecutive_high_scores)
            else:
                consecutive_high_scores = 0
        
        # Check if meets threshold
        if max_consecutive >= CONVERSION_THRESHOLD['min_sessions']:
            user_info = user_sessions.iloc[0]
            
            candidates.append({
                'user_id': user_id,
                'email': user_info['email'],
                'english_level': user_info['english_level'],
                'consecutive_high_scores': max_consecutive,
                'recent_sessions_count': len(recent_sessions),
                'avg_confidence_score': round(recent_sessions['confidence_score'].mean(), 2),
                'max_confidence_score': recent_sessions['confidence_score'].max(),
                'total_errors': recent_sessions['error_count'].sum(),
                'confidence_scores': scores_list[:max_consecutive],
                'last_session_date': user_info['started_at'],
                'recommendation': 'SEND_EXECUTIVE_OFFER'
            })
    
    candidates_df = pd.DataFrame(candidates)
    
    # Store triggers in database
    if not candidates_df.empty:
        for _, candidate in candidates_df.iterrows():
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO conversion_triggers 
                (user_id, trigger_type, conditions_met, confidence_scores, triggered_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            ''', (
                candidate['user_id'],
                'executive_upgrade',
                f"{candidate['consecutive_high_scores']} consecutive sessions with avg score {candidate['avg_confidence_score']}",
                json.dumps(candidate['confidence_scores'])
            ))
        conn.commit()
    
    conn.close()
    
    return candidates_df

# ============================================
# REPORT GENERATION
# ============================================

def generate_daily_report():
    """Generate comprehensive daily report for stakeholders"""
    
    # Create reports directory
    Path(REPORTS_DIR).mkdir(exist_ok=True)
    
    # Generate timestamp
    report_date = datetime.now().strftime('%Y-%m-%d')
    report_timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    
    print("\n" + "="*60)
    print("📊 FLUENCY LAB - DAILY BUSINESS INTELLIGENCE REPORT")
    print("="*60)
    print(f"Report Date: {report_date}")
    print(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    # ============================================
    # SECTION 1: ENGAGEMENT ANALYSIS
    # ============================================
    print("📈 SECTION 1: USER ENGAGEMENT BY ROLE\n")
    
    engagement_7d = calculate_engagement_by_role(days=7)
    engagement_30d = calculate_engagement_by_role(days=30)
    
    print("Last 7 Days:")
    print(engagement_7d.to_string(index=False))
    print("\n")
    
    # Save to CSV
    engagement_7d.to_csv(f'{REPORTS_DIR}/engagement_7d_{report_timestamp}.csv', index=False)
    
    # Weekly trends
    print("📊 Weekly Session Trends (Last 4 weeks):\n")
    trends = get_weekly_session_trends(days=28)
    print(trends.to_string(index=False))
    print("\n")
    
    trends.to_csv(f'{REPORTS_DIR}/weekly_trends_{report_timestamp}.csv', index=False)
    
    # ============================================
    # SECTION 2: COMMON MISTAKES HEATMAP
    # ============================================
    print("="*60)
    print("🔥 SECTION 2: TOP 10 IT ENGLISH MISTAKES (Marketing Insights)\n")
    
    top_mistakes = get_top_common_mistakes(limit=10)
    
    print("Rank | Error Type      | Mistake                                    | Frequency | %")
    print("-"*100)
    
    for idx, row in top_mistakes.iterrows():
        print(f"{idx+1:4d} | {row['error_type']:15s} | {row['mistake'][:45]:45s} | {row['frequency']:9d} | {row['percentage']:5.2f}%")
    
    print("\n")
    
    # Save to CSV
    top_mistakes.to_csv(f'{REPORTS_DIR}/top_mistakes_{report_timestamp}.csv', index=False)
    
    # Generate heatmap visualization
    print("📊 Generating mistakes heatmap visualization...\n")
    
    heatmap_data = get_mistakes_heatmap_data()
    
    plt.figure(figsize=(10, 6))
    sns.heatmap(heatmap_data, annot=True, fmt='g', cmap='YlOrRd', linewidths=0.5)
    plt.title('IT English Mistakes Heatmap - Last 30 Days', fontsize=14, fontweight='bold')
    plt.xlabel('Error Type', fontsize=12)
    plt.ylabel('Category', fontsize=12)
    plt.tight_layout()
    plt.savefig(f'{REPORTS_DIR}/mistakes_heatmap_{report_timestamp}.png', dpi=300)
    print(f"✅ Heatmap saved: {REPORTS_DIR}/mistakes_heatmap_{report_timestamp}.png\n")
    
    # ============================================
    # SECTION 3: CONVERSION TRIGGERS
    # ============================================
    print("="*60)
    print("🎯 SECTION 3: CONVERSION TRIGGERS (Executive Upgrade Candidates)\n")
    
    candidates = detect_conversion_candidates()
    
    if candidates.empty:
        print("No conversion candidates detected at this time.\n")
    else:
        print(f"Found {len(candidates)} Free users ready for Executive upgrade!\n")
        
        print("User ID  | Email                     | Level | Sessions | Avg Score | Recommendation")
        print("-"*100)
        
        for _, candidate in candidates.iterrows():
            print(f"{candidate['user_id']:8s} | {candidate['email']:25s} | {candidate['english_level']:5s} | {candidate['consecutive_high_scores']:8d} | {candidate['avg_confidence_score']:9.2f} | {candidate['recommendation']}")
        
        print("\n")
        
        # Save to CSV
        candidates.to_csv(f'{REPORTS_DIR}/conversion_candidates_{report_timestamp}.csv', index=False)
        
        # Generate automated offer recommendations
        print("📧 AUTOMATED OFFER RECOMMENDATIONS:\n")
        
        for _, candidate in candidates.iterrows():
            print(f"To: {candidate['email']}")
            print(f"Subject: 🎉 You're Ready for Executive-Level English!")
            print(f"")
            print(f"Hi there,")
            print(f"")
            print(f"We've noticed your exceptional progress! With {candidate['consecutive_high_scores']} consecutive")
            print(f"high-performing sessions (avg score: {candidate['avg_confidence_score']}/10), you're ready to level up.")
            print(f"")
            print(f"🚀 EXCLUSIVE OFFER: Upgrade to Executive English Module")
            print(f"   - Advanced business communication")
            print(f"   - C-level presentation skills")
            print(f"   - Strategic leadership vocabulary")
            print(f"")
            print(f"Special Price: $179 (40% off) - Valid for 48 hours")
            print(f"")
            print(f"Ready to become a technical leader?")
            print(f"")
            print("-"*60 + "\n")
    
    # ============================================
    # SUMMARY REPORT
    # ============================================
    print("="*60)
    print("📋 EXECUTIVE SUMMARY\n")
    
    total_users = engagement_7d['total_users'].sum()
    total_sessions = engagement_7d['total_sessions'].sum()
    avg_score = engagement_7d['avg_confidence_score'].mean()
    
    free_users = engagement_7d[engagement_7d['role'] == 'free']['total_users'].sum() if 'free' in engagement_7d['role'].values else 0
    student_users = engagement_7d[engagement_7d['role'] == 'student']['total_users'].sum() if 'student' in engagement_7d['role'].values else 0
    
    print(f"Total Active Users (7d): {total_users}")
    print(f"  - Free: {free_users}")
    print(f"  - Students: {student_users}")
    print(f"")
    print(f"Total Sessions (7d): {total_sessions}")
    print(f"Average Confidence Score: {avg_score:.2f}/10")
    print(f"")
    print(f"Top Mistake Categories:")
    for idx, row in top_mistakes.head(3).iterrows():
        print(f"  {idx+1}. {row['mistake'][:50]} ({row['frequency']} occurrences)")
    print(f"")
    print(f"Conversion Opportunities: {len(candidates)} Free users ready for upgrade")
    print(f"Estimated Revenue Potential: ${len(candidates) * 179:.2f}")
    print("\n")
    
    # Save summary to JSON
    summary = {
        'report_date': report_date,
        'generated_at': datetime.now().isoformat(),
        'metrics': {
            'total_users_7d': int(total_users),
            'free_users': int(free_users),
            'student_users': int(student_users),
            'total_sessions_7d': int(total_sessions),
            'avg_confidence_score': float(avg_score),
            'conversion_candidates': len(candidates),
            'revenue_potential': float(len(candidates) * 179)
        },
        'top_3_mistakes': top_mistakes.head(3)[['error_type', 'mistake', 'frequency']].to_dict('records'),
        'conversion_candidates': candidates[['user_id', 'email', 'avg_confidence_score']].to_dict('records') if not candidates.empty else []
    }
    
    with open(f'{REPORTS_DIR}/daily_summary_{report_timestamp}.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print("="*60)
    print(f"✅ Report generation complete!")
    print(f"📁 All reports saved to: {REPORTS_DIR}/")
    print("="*60 + "\n")
    
    return summary

# ============================================
# HTML REPORT GENERATION
# ============================================

def generate_html_report():
    """Generate a beautiful HTML report for stakeholders"""
    
    report_timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    
    engagement = calculate_engagement_by_role(days=7)
    mistakes = get_top_common_mistakes(limit=10)
    candidates = detect_conversion_candidates()
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Fluency Lab - Daily Report</title>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
            }}
            .header h1 {{
                margin: 0;
                font-size: 32px;
            }}
            .header p {{
                margin: 10px 0 0 0;
                opacity: 0.9;
            }}
            .section {{
                background: white;
                padding: 25px;
                margin-bottom: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .section h2 {{
                margin-top: 0;
                color: #667eea;
                border-bottom: 2px solid #667eea;
                padding-bottom: 10px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            th, td {{
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }}
            th {{
                background: #667eea;
                color: white;
                font-weight: bold;
            }}
            tr:hover {{
                background: #f5f5f5;
            }}
            .metric {{
                display: inline-block;
                background: #f0f0f0;
                padding: 15px 25px;
                margin: 10px;
                border-radius: 8px;
                text-align: center;
            }}
            .metric-value {{
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
            }}
            .metric-label {{
                font-size: 14px;
                color: #666;
                margin-top: 5px;
            }}
            .candidate {{
                background: #e8f5e9;
                padding: 15px;
                margin: 10px 0;
                border-left: 4px solid #4caf50;
                border-radius: 4px;
            }}
            .candidate strong {{
                color: #2e7d32;
            }}
            .footer {{
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Fluency Lab - Daily Business Report</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="section">
            <h2>📈 Key Metrics (Last 7 Days)</h2>
            <div style="text-align: center;">
                <div class="metric">
                    <div class="metric-value">{engagement['total_users'].sum()}</div>
                    <div class="metric-label">Active Users</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{engagement['total_sessions'].sum()}</div>
                    <div class="metric-label">Total Sessions</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{engagement['avg_confidence_score'].mean():.1f}/10</div>
                    <div class="metric-label">Avg Confidence</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{len(candidates)}</div>
                    <div class="metric-label">Conversion Ready</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>👥 User Engagement by Role</h2>
            <table>
                <tr>
                    <th>Role</th>
                    <th>Users</th>
                    <th>Sessions</th>
                    <th>Avg Confidence</th>
                    <th>Avg Errors</th>
                    <th>Sessions/User</th>
                </tr>
    """
    
    for _, row in engagement.iterrows():
        html += f"""
                <tr>
                    <td><strong>{row['role'].upper()}</strong></td>
                    <td>{row['total_users']}</td>
                    <td>{row['total_sessions']}</td>
                    <td>{row['avg_confidence_score']}/10</td>
                    <td>{row['avg_errors_per_session']}</td>
                    <td>{row['sessions_per_user']}</td>
                </tr>
        """
    
    html += """
            </table>
        </div>
        
        <div class="section">
            <h2>🔥 Top 10 IT English Mistakes (Marketing Content)</h2>
            <table>
                <tr>
                    <th>Rank</th>
                    <th>Type</th>
                    <th>Mistake</th>
                    <th>Frequency</th>
                    <th>Percentage</th>
                </tr>
    """
    
    for idx, row in mistakes.iterrows():
        html += f"""
                <tr>
                    <td>{idx+1}</td>
                    <td>{row['error_type']}</td>
                    <td>{row['mistake']}</td>
                    <td>{row['frequency']}</td>
                    <td>{row['percentage']:.2f}%</td>
                </tr>
        """
    
    html += """
            </table>
        </div>
        
        <div class="section">
            <h2>🎯 Conversion Triggers - Executive Upgrade Candidates</h2>
    """
    
    if candidates.empty:
        html += "<p>No conversion candidates detected at this time.</p>"
    else:
        html += f"<p><strong>{len(candidates)} Free users are ready for Executive upgrade!</strong></p>"
        
        for _, candidate in candidates.iterrows():
            html += f"""
            <div class="candidate">
                <strong>{candidate['email']}</strong> ({candidate['english_level']} level)<br>
                {candidate['consecutive_high_scores']} consecutive sessions | 
                Avg score: {candidate['avg_confidence_score']}/10 | 
                <strong>Recommendation: SEND EXECUTIVE OFFER ($179)</strong>
            </div>
            """
        
        html += f"""
        <p style="margin-top: 20px;">
            <strong>💰 Estimated Revenue Potential: ${len(candidates) * 179:.2f}</strong>
        </p>
        """
    
    html += """
        </div>
        
        <div class="footer">
            <p>🚀 Fluency Lab - Empowering IT Professionals with Executive English</p>
            <p>This report is automatically generated daily. For questions, contact data@fluencylab.com</p>
        </div>
    </body>
    </html>
    """
    
    # Save HTML report
    html_path = f'{REPORTS_DIR}/daily_report_{report_timestamp}.html'
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ HTML report generated: {html_path}")
    
    return html_path

# ============================================
# MAIN EXECUTION
# ============================================

def main():
    """Main execution function"""
    
    print("\n🚀 Fluency Lab - Daily Reports Generator\n")
    
    # Initialize database
    print("1️⃣ Initializing database...")
    init_database()
    
    # Insert sample data (for demonstration)
    print("2️⃣ Inserting sample data...")
    insert_sample_data()
    
    # Generate reports
    print("3️⃣ Generating daily reports...\n")
    summary = generate_daily_report()
    
    # Generate HTML report
    print("4️⃣ Generating HTML report...")
    html_path = generate_html_report()
    
    print("\n✅ All reports generated successfully!")
    print(f"\n📁 Reports saved to: {REPORTS_DIR}/")
    print(f"📊 Open HTML report: {html_path}")
    
    return summary

if __name__ == "__main__":
    # Install required packages if needed
    try:
        import matplotlib
        import seaborn
    except ImportError:
        print("Installing required packages...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'pandas', 'matplotlib', 'seaborn'])
        print("✅ Packages installed!\n")
    
    main()

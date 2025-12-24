# 📊 FLUENCY LAB - DAILY REPORTS SYSTEM

**Business Intelligence & Data Analytics for Stakeholders**

---

## 🎯 OVERVIEW

This Python-based reporting system generates comprehensive daily reports for business stakeholders, providing insights into:

1. **User Engagement** - Sessions completed per week by role (Free vs Student)
2. **Common Mistakes Heatmap** - Top 10 IT English errors for LinkedIn marketing content
3. **Conversion Triggers** - Automated detection of Free users ready for Executive upgrade

---

## 📦 REQUIREMENTS

### Python Dependencies

```bash
pip install pandas sqlite3 matplotlib seaborn
```

### System Requirements

- Python 3.8+
- SQLite3 (included in Python)
- 50MB disk space for database and reports

---

## 🚀 QUICK START

### 1. Run the Report Generator

```bash
cd backend/scripts
python daily_reports.py
```

### 2. View Generated Reports

Reports are saved to `backend/scripts/reports/` directory:

```
reports/
├── daily_report_2024-12-24_14-30-00.html          # Beautiful HTML report
├── engagement_7d_2024-12-24_14-30-00.csv          # Engagement metrics
├── top_mistakes_2024-12-24_14-30-00.csv           # Top 10 errors
├── mistakes_heatmap_2024-12-24_14-30-00.png       # Visualization
├── conversion_candidates_2024-12-24_14-30-00.csv  # Users ready to upgrade
└── daily_summary_2024-12-24_14-30-00.json         # JSON summary
```

### 3. Open HTML Report

Double-click the HTML file to view the interactive report in your browser.

---

## 📊 REPORT SECTIONS

### SECTION 1: User Engagement by Role

**Metrics Calculated:**
- Total active users (last 7 days)
- Total coaching sessions
- Average confidence score (1-10)
- Average errors per session
- Sessions per user

**Breakdown by Role:**
- Free users
- Student users
- Coach users
- SuperUser users

**Example Output:**
```
Role      | Users | Sessions | Avg Confidence | Avg Errors | Sessions/User
----------------------------------------------------------------------
free      |   4   |    9     |     7.67       |    2.67    |     2.25
student   |   4   |    7     |     8.14       |    2.14    |     1.75
```

---

### SECTION 2: Common Mistakes Heatmap

**Top 10 IT English Mistakes:**

Identifies the most frequent errors for creating targeted marketing content (LinkedIn posts, blog articles, etc.)

**Categories Tracked:**
- **Grammar**: Articles, prepositions, verbs, plurals
- **Pronunciation**: library, cache, SQL, algorithm, GUI, deploy, etc.
- **Vocabulary**: Basic phrases → Senior-level upgrades

**Example Output:**
```
Rank | Error Type      | Mistake                                     | Frequency | %
----------------------------------------------------------------------------------
  1  | grammar         | Missing article: "working on system"        |    15     | 12.50%
  2  | pronunciation   | Mispronounced: library                      |    12     | 10.00%
  3  | vocabulary      | Basic phrase: "I am working on"             |    10     |  8.33%
  4  | grammar         | Wrong preposition: "responsible of"         |     8     |  6.67%
  5  | pronunciation   | Mispronounced: cache                        |     7     |  5.83%
```

**Heatmap Visualization:**

![Mistakes Heatmap](../../../docs/mistakes_heatmap_example.png)

The heatmap shows error distribution by:
- **X-axis**: Error Type (grammar, pronunciation, vocabulary)
- **Y-axis**: Category (Articles, Prepositions, Verbs, Pronunciation, etc.)
- **Color intensity**: Frequency (darker = more common)

---

### SECTION 3: Conversion Triggers

**Automated Detection Criteria:**

Identifies **Free users** ready for upgrade to **Executive English Module** based on:

✅ **Minimum 3 consecutive sessions**  
✅ **Confidence score > 8/10** in all sessions  
✅ **Active in last 14 days**

**Example Output:**
```
User ID  | Email                     | Level | Sessions | Avg Score | Recommendation
----------------------------------------------------------------------------------
user002  | free2@fluencylab.com      | B2    |    3     |   9.00    | SEND_EXECUTIVE_OFFER
user003  | free3@fluencylab.com      | C1    |    4     |   8.50    | SEND_EXECUTIVE_OFFER
```

**Automated Offer Template:**
```
To: free2@fluencylab.com
Subject: 🎉 You're Ready for Executive-Level English!

Hi there,

We've noticed your exceptional progress! With 3 consecutive
high-performing sessions (avg score: 9.00/10), you're ready to level up.

🚀 EXCLUSIVE OFFER: Upgrade to Executive English Module
   - Advanced business communication
   - C-level presentation skills
   - Strategic leadership vocabulary

Special Price: $179 (40% off) - Valid for 48 hours

Ready to become a technical leader?
```

**Revenue Potential:**
- 2 conversion candidates × $179 = **$358**

---

## 🗄️ DATABASE SCHEMA

### Tables Created

**1. users**
```sql
- user_id (PRIMARY KEY)
- email
- role (free, student, coach, superuser)
- english_level (B1, B2, C1, C2)
- created_at
- last_active
```

**2. coaching_sessions**
```sql
- session_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- session_topic
- user_level
- started_at
- ended_at
- duration_seconds
- confidence_score (1-10)
- message_count
- error_count
- phase (welcome, interaction, closing)
```

**3. detected_errors**
```sql
- error_id (PRIMARY KEY)
- session_id (FOREIGN KEY)
- user_id (FOREIGN KEY)
- error_type (grammar, pronunciation, vocabulary)
- error_category
- error_text
- severity (low, medium, high)
- detected_at
```

**4. it_errors**
```sql
- error_id (PRIMARY KEY)
- session_id (FOREIGN KEY)
- user_id (FOREIGN KEY)
- domain (management, technical, business)
- error_pattern
- correct_form
- frequency
- detected_at
```

**5. pricing_errors**
```sql
- error_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- error
- category
- domain
- session_id
- timestamp
```

**6. lead_scores**
```sql
- score_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- lead_status
- overall_score
- readiness_score
- urgency_score
- value_score
- calculated_at
```

**7. conversion_triggers**
```sql
- trigger_id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- trigger_type
- conditions_met
- confidence_scores (JSON)
- triggered_at
- offer_sent (BOOLEAN)
- offer_accepted (BOOLEAN)
```

---

## 🔧 CUSTOMIZATION

### Adjust Conversion Thresholds

Edit `daily_reports.py`:

```python
CONVERSION_THRESHOLD = {
    'min_sessions': 3,              # Minimum consecutive sessions
    'min_confidence_score': 8.0,    # Minimum score (1-10)
    'consecutive_required': True    # Must be consecutive
}
```

### Change Report Frequency

The script analyzes data from:
- Last 7 days (engagement)
- Last 30 days (mistakes heatmap)
- Last 14 days (conversion triggers)

Adjust by modifying function parameters:

```python
engagement = calculate_engagement_by_role(days=7)   # Change to 14, 30, etc.
mistakes = get_top_common_mistakes(limit=10)        # Change to 20, 50, etc.
```

### Add Custom Queries

Add your own analysis functions:

```python
def custom_analysis():
    conn = sqlite3.connect(DB_PATH)
    
    query = '''
        SELECT 
            -- Your custom query here
        FROM coaching_sessions
        WHERE ...
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df
```

---

## 📈 AUTOMATED SCHEDULING

### Schedule Daily Reports (Windows)

**Option 1: Windows Task Scheduler**

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 8:00 AM
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\daily_reports.py`
7. Start in: `C:\path\to\backend\scripts`

**Option 2: Python Script with schedule library**

```python
import schedule
import time

def job():
    from daily_reports import main
    main()

# Run every day at 8:00 AM
schedule.every().day.at("08:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### Schedule Daily Reports (Linux/Mac)

**Using cron:**

```bash
# Edit crontab
crontab -e

# Add this line (runs at 8:00 AM daily)
0 8 * * * cd /path/to/backend/scripts && python daily_reports.py
```

---

## 📧 EMAIL INTEGRATION

### Send Reports via Email

Add this function to `daily_reports.py`:

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

def send_email_report(html_path, recipients):
    """Send HTML report via email"""
    
    sender = 'reports@fluencylab.com'
    password = 'your_app_password'
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    msg['Subject'] = f'Fluency Lab - Daily Report {datetime.now().strftime("%Y-%m-%d")}'
    
    # Read HTML report
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Attach HTML
    msg.attach(MIMEText(html_content, 'html'))
    
    # Attach CSV files
    for csv_file in Path(REPORTS_DIR).glob('*.csv'):
        with open(csv_file, 'rb') as f:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename={csv_file.name}')
            msg.attach(part)
    
    # Send email
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(sender, password)
        server.send_message(msg)
    
    print(f"✅ Email sent to: {', '.join(recipients)}")

# Add to main() function:
recipients = ['ceo@fluencylab.com', 'marketing@fluencylab.com', 'data@fluencylab.com']
send_email_report(html_path, recipients)
```

---

## 🔒 DATA PRIVACY & SECURITY

### Anonymization

For GDPR compliance, anonymize user data:

```python
def anonymize_report_data(df):
    """Anonymize user identifiable information"""
    df['email'] = df['email'].apply(lambda x: f"user_{hash(x) % 10000}@fluencylab.com")
    df['user_id'] = df['user_id'].apply(lambda x: f"user{hash(x) % 10000}")
    return df
```

### Database Backup

```python
import shutil

def backup_database():
    """Create daily database backup"""
    timestamp = datetime.now().strftime('%Y-%m-%d')
    backup_path = f'backups/fluency_lab_{timestamp}.db'
    shutil.copy(DB_PATH, backup_path)
    print(f"✅ Database backed up: {backup_path}")
```

---

## 📊 BUSINESS USE CASES

### 1. Marketing Content Creation

**Use Case:** Create LinkedIn posts about common mistakes

**Process:**
1. Run daily report
2. Review Top 10 Mistakes
3. Pick top 3 errors
4. Create educational posts:

```
🔥 Common IT English Mistake #1:

❌ "I am working on authentication system"
✅ "I'm working on THE authentication system"

Many IT professionals forget articles!

Remember: THE (specific) vs A (general)

Examples:
- "THE bug I found" (specific bug)
- "A bug in production" (any bug)

Which one do you use? 👇
```

### 2. Product Development

**Use Case:** Identify areas for new modules

**Insights from Heatmap:**
- High frequency in "Prepositions" → Create "Prepositions Mastery" module
- Many pronunciation errors → Add voice recognition practice
- Vocabulary gaps → Expand Power Phrases library

### 3. Sales & Conversion Optimization

**Use Case:** Automate upgrade offers

**Workflow:**
1. Report identifies 5 conversion candidates
2. Automated email sent with personalized offer
3. Track conversion rate
4. A/B test different offer prices ($179 vs $199)
5. Optimize timing (immediate vs 24h delay)

### 4. User Retention

**Use Case:** Re-engage inactive users

**Query:**
```python
def find_inactive_users(days=30):
    conn = sqlite3.connect(DB_PATH)
    
    query = f'''
        SELECT 
            u.email,
            u.role,
            MAX(cs.started_at) as last_session
        FROM users u
        LEFT JOIN coaching_sessions cs ON u.user_id = cs.user_id
        GROUP BY u.user_id
        HAVING last_session < datetime('now', '-{days} days')
        ORDER BY last_session DESC
    '''
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    return df
```

---

## 🐛 TROUBLESHOOTING

### Error: ModuleNotFoundError

**Solution:** Install dependencies
```bash
pip install pandas matplotlib seaborn
```

### Error: Database locked

**Solution:** Close other connections
```python
# Ensure connections are closed
conn.close()
```

### Empty Reports

**Solution:** Check data in database
```bash
sqlite3 fluency_lab.db
> SELECT COUNT(*) FROM coaching_sessions;
> SELECT COUNT(*) FROM detected_errors;
```

If empty, run `insert_sample_data()` or connect to production data.

---

## 📝 INTEGRATION WITH PRODUCTION

### Connect to Node.js Backend

**Option 1: SQLite (Current)**
- Node.js writes to SQLite
- Python reads from SQLite
- ✅ Simple, no setup needed

**Option 2: PostgreSQL (Production)**

1. Install PostgreSQL adapter:
```bash
pip install psycopg2
```

2. Update connection:
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="fluency_lab",
    user="postgres",
    password="password"
)
```

3. Use same queries (SQL is compatible)

**Option 3: REST API**

Create Node.js endpoint:
```javascript
app.get('/api/analytics/export', authenticate, async (req, res) => {
  // Export data to JSON
  const data = {
    users: await getUsers(),
    sessions: await getSessions(),
    errors: await getErrors()
  };
  
  res.json(data);
});
```

Python script fetches data:
```python
import requests

response = requests.get('http://localhost:3000/api/analytics/export')
data = response.json()

# Process data
df_users = pd.DataFrame(data['users'])
df_sessions = pd.DataFrame(data['sessions'])
```

---

## 🚀 NEXT STEPS

### Phase 1: Basic Reporting (Complete)
✅ Engagement metrics  
✅ Top mistakes heatmap  
✅ Conversion triggers  
✅ HTML report generation

### Phase 2: Advanced Analytics
- [ ] Cohort analysis (retention rates)
- [ ] Revenue forecasting
- [ ] Churn prediction model
- [ ] A/B test tracking

### Phase 3: Real-Time Dashboard
- [ ] Plotly Dash dashboard
- [ ] Live metrics (WebSocket)
- [ ] Interactive filters
- [ ] Export to PowerBI/Tableau

### Phase 4: Machine Learning
- [ ] Predict user success
- [ ] Recommend personalized content
- [ ] Optimize pricing dynamically
- [ ] Detect early churn signals

---

## 📞 SUPPORT

For questions or customization requests:
- **Email:** data@fluencylab.com
- **Docs:** https://docs.fluencylab.com/analytics
- **GitHub:** https://github.com/fluencylab/analytics

---

## 📄 LICENSE

MIT License - Free to use and modify

---

**Built with ❤️ by the Fluency Lab Data Team**

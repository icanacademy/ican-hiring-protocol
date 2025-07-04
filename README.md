# ICAN Hiring Protocol

**Intelligent Coverage Analysis Network**

A comprehensive dashboard for tracking ESL teacher hiring needs and automatically managing recruitment strategies with time-based protocol intelligence.

## Features

### 📊 Weekly Hiring Tracker
- Input target hires and already hired count
- Auto-calculates remaining hires needed
- Tracks referral bonus eligibility (≥5 target hires)
- Monitors emergency alert status (≥70% remaining)

### 📢 Ad Platform Recommendations
Automatically suggests the best platform based on hiring volume:
- **1-5 hires**: Facebook (₱500)
- **6-7 hires**: Indeed ($4/day)
- **8-9 hires**: LinkedIn (₱2,566.33 total)
- **10+ hires**: Jobstreet (₱5,000+)

### 🎯 Referral Bonus System
- Automatically activates when target hires ≥ 5
- Visual badge showing current status

### 🚨 Emergency Alert Protocol
Triggers when remaining hires ≥ 70% of target with action checklist:
- Notify hiring managers
- Prioritize candidate processing
- Re-post job on all platforms
- Push referral incentive message

### 📈 Historical Data
- View all past hiring records
- Track performance over time
- Status indicators for each week

## Usage

1. **Set Week Start Date**: Defaults to next Monday
2. **Enter Target Hires**: Number of ESL teachers needed
3. **Enter Already Hired**: Current count of hired teachers
4. **Save Data**: Store the record in local database
5. **Monitor Alerts**: Watch for referral bonus and emergency triggers

## Technical Implementation

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage for client-side data persistence
- **Responsive**: Mobile-friendly design
- **Real-time**: Instant calculations and updates

## Getting Started

1. Open `index.html` in a web browser
2. Enter your hiring data
3. Monitor recommendations and alerts
4. Use historical data to track trends

## Files Structure

- `index.html` - Main dashboard interface
- `style.css` - Responsive styling and layout
- `script.js` - Dashboard logic and calculations
- `database.js` - Data storage and retrieval
- `README.md` - This documentation

## Logic Flow

```javascript
remaining = target_hires - hired
referral_bonus = target_hires >= 5
emergency_alert = remaining >= (target_hires * 0.7)

// Platform selection based on target hires
if (target_hires <= 5) platform = "Facebook"
else if (target_hires <= 7) platform = "Indeed"
else if (target_hires <= 9) platform = "LinkedIn"
else platform = "Jobstreet"
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Data Storage

All data is stored locally in the browser using LocalStorage. No external database required.
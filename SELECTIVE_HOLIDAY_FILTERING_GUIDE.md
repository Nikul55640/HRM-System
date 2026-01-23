# 🎯 Selective Holiday Filtering System

## Overview

The Selective Holiday Filtering System allows you to choose exactly which holidays to import from Calendarific, rather than importing all holidays. This gives you complete control over your company's holiday calendar.

## ✅ Problem Solved

**Before:** Calendarific returns ALL holidays → You get 50+ holidays including obscure observances
**After:** YOU decide which holidays to import → Clean, relevant holiday calendar

## 🚀 Quick Start

### 1. Get Available Filter Options
```bash
GET /api/admin/calendarific/filters
```

### 2. Preview Holidays with Filters
```bash
POST /api/admin/calendarific/preview-filtered
{
  "country": "IN",
  "year": 2026,
  "festivalsOnly": true,
  "maxHolidays": 10
}
```

### 3. Sync Selected Holidays
```bash
POST /api/admin/calendarific/sync-filtered
{
  "country": "IN",
  "year": 2026,
  "festivalsOnly": true,
  "maxHolidays": 10,
  "dryRun": false
}
```

## 🎛️ Available Filters

### Basic Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `festivalsOnly` | boolean | Only religious/cultural festivals | `true` |
| `nationalOnly` | boolean | Only national/patriotic holidays | `true` |
| `excludeObservances` | boolean | Remove awareness days | `true` |
| `paidOnly` | boolean | Only paid holidays | `true` |
| `maxHolidays` | number | Limit total count | `15` |

### Advanced Filters

| Filter | Type | Description | Example |
|--------|------|-------------|---------|
| `categories` | array | Specific categories | `["national", "religious"]` |
| `importanceLevel` | string | By importance | `"CRITICAL"` |
| `state` | string | State-specific holidays | `"maharashtra"` |
| `includeHolidays` | array | Specific holiday names | `["diwali", "christmas"]` |
| `excludeHolidays` | array | Exclude specific holidays | `["valentine day"]` |
| `companyPolicy` | string | Predefined templates | `"TECH_STARTUP"` |

## 🏢 Company Policy Templates

### Tech Startup Policy
- **Holidays:** 15 max
- **Types:** National + Religious
- **Excludes:** Observances
- **Focus:** Modern, flexible

```json
{
  "companyPolicy": "TECH_STARTUP"
}
```

### Traditional Corporate Policy
- **Holidays:** 12 max
- **Types:** National + Religious
- **Excludes:** Observances
- **Focus:** Conservative, standard

```json
{
  "companyPolicy": "TRADITIONAL_CORPORATE"
}
```

### Government Office Policy
- **Holidays:** 20 max
- **Types:** All types
- **Includes:** Observances
- **Focus:** Comprehensive

```json
{
  "companyPolicy": "GOVERNMENT_OFFICE"
}
```

### Manufacturing Policy
- **Holidays:** 10 max
- **Types:** National only
- **Excludes:** Most festivals
- **Focus:** Essential holidays only

```json
{
  "companyPolicy": "MANUFACTURING"
}
```

## 📋 Common Use Cases

### 1. Festival-Only Calendar
```json
{
  "country": "IN",
  "year": 2026,
  "festivalsOnly": true,
  "excludeObservances": true,
  "maxHolidays": 12
}
```
**Result:** Diwali, Eid, Christmas, Holi, etc.

### 2. National Holidays Only
```json
{
  "country": "IN",
  "year": 2026,
  "nationalOnly": true
}
```
**Result:** Independence Day, Republic Day, Gandhi Jayanti

### 3. Specific Holiday Selection
```json
{
  "country": "IN",
  "year": 2026,
  "includeHolidays": [
    "independence day",
    "republic day", 
    "gandhi jayanti",
    "diwali",
    "christmas",
    "eid"
  ]
}
```
**Result:** Exactly these 6 holidays

### 4. State-Specific Holidays
```json
{
  "country": "IN",
  "year": 2026,
  "state": "maharashtra",
  "categories": ["national", "religious", "public"]
}
```
**Result:** National holidays + Maharashtra-specific holidays

### 5. Paid Holidays Only
```json
{
  "country": "IN",
  "year": 2026,
  "paidOnly": true,
  "maxHolidays": 15
}
```
**Result:** Only holidays that are typically paid

## 🔧 API Endpoints

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/filters` | GET | Get available filter options |
| `/preview-filtered` | POST | Preview with filters |
| `/sync-filtered` | POST | Sync with filters |
| `/festivals` | GET | Festival holidays only |
| `/national` | GET | National holidays only |
| `/apply-policy` | POST | Apply company policy |

### Quick Access Endpoints

```bash
# Get only festivals
GET /api/admin/calendarific/festivals?country=IN&year=2026

# Get only national holidays  
GET /api/admin/calendarific/national?country=IN&year=2026

# Apply tech startup policy
POST /api/admin/calendarific/apply-policy
{
  "policyTemplate": "TECH_STARTUP",
  "dryRun": true
}
```

## 🧪 Testing

Run the test script to see all filtering options in action:

```bash
node test-selective-holiday-filtering.js
```

## 💡 Best Practices

### 1. Always Preview First
```bash
# Preview before syncing
POST /api/admin/calendarific/preview-filtered
{
  "festivalsOnly": true,
  "maxHolidays": 10
}

# Then sync if satisfied
POST /api/admin/calendarific/sync-filtered
{
  "festivalsOnly": true,
  "maxHolidays": 10,
  "dryRun": false
}
```

### 2. Use Company Policies for Consistency
```bash
# Apply consistent policy across years
POST /api/admin/calendarific/apply-policy
{
  "policyTemplate": "TECH_STARTUP",
  "year": 2026
}
```

### 3. Combine Filters for Precision
```json
{
  "festivalsOnly": true,
  "excludeObservances": true,
  "paidOnly": true,
  "maxHolidays": 12,
  "state": "maharashtra"
}
```

### 4. Use Dry Run for Safety
```json
{
  "dryRun": true,
  "overwriteExisting": false
}
```

## 🎯 Filter Examples by Business Type

### Startup (10-15 holidays)
```json
{
  "companyPolicy": "TECH_STARTUP"
}
```

### Corporate (12 holidays)
```json
{
  "nationalOnly": true,
  "festivalsOnly": true,
  "maxHolidays": 12,
  "excludeObservances": true
}
```

### Manufacturing (8 holidays)
```json
{
  "categories": ["national"],
  "maxHolidays": 8,
  "paidOnly": true
}
```

### Government (20+ holidays)
```json
{
  "companyPolicy": "GOVERNMENT_OFFICE"
}
```

## 🔍 Filter Logic

### Festival Detection
Holidays are classified as festivals if they:
- Have category = "religious" OR
- Name contains festival keywords (diwali, eid, christmas, etc.)

### National Holiday Detection  
Holidays are classified as national if they:
- Have category = "national" OR
- Name contains national keywords (independence, republic, gandhi, etc.)

### Importance Levels
- **CRITICAL:** Independence Day, Republic Day, Gandhi Jayanti, Diwali, Eid, Christmas
- **HIGH:** Holi, Dussehra, Durga Puja, Good Friday, Guru Nanak Jayanti  
- **MEDIUM:** Karva Chauth, Raksha Bandhan, Janmashtami
- **LOW:** World Environment Day, International Yoga Day

## 🚀 Advanced Usage

### Custom Filter Combinations
```json
{
  "country": "IN",
  "year": 2026,
  "holidayTypes": "national,religious",
  "categories": ["national", "religious"],
  "importanceLevel": "HIGH",
  "excludeHolidays": ["valentine day", "april fool"],
  "maxHolidays": 15,
  "paidOnly": true
}
```

### Multi-State Support
```json
{
  "state": "maharashtra",
  "includeHolidays": ["gudi padwa", "shivaji jayanti"]
}
```

## ✅ Benefits

1. **Precise Control:** Choose exactly which holidays you want
2. **Cost Effective:** Fewer API calls with smart caching
3. **Business Aligned:** Templates match different business needs  
4. **Flexible:** Combine multiple filters for perfect results
5. **Safe:** Preview before syncing, dry run options
6. **Scalable:** Works for any country/region

## 🎉 Result

Instead of importing 50+ random holidays, you get a clean, curated list that matches your company's needs perfectly!

**Example Output:**
```
✅ Selected 12 holidays for Tech Startup:
   - Independence Day (2026-08-15) - national
   - Republic Day (2026-01-26) - national  
   - Gandhi Jayanti (2026-10-02) - national
   - Diwali (2026-11-01) - religious
   - Christmas (2026-12-25) - religious
   - Eid ul-Fitr (2026-04-18) - religious
   - Holi (2026-03-14) - religious
   - Dussehra (2026-10-22) - religious
   - Good Friday (2026-04-10) - religious
   - Guru Nanak Jayanti (2026-11-19) - religious
   - Karva Chauth (2026-10-31) - religious
   - Raksha Bandhan (2026-08-09) - religious
```

Perfect! 🎯
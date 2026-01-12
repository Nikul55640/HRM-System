# Calendarific API Integration

## Overview

The HRM System now includes integration with the **Calendarific API** to automatically sync holidays from around the world. This integration allows you to:

- 🌍 Fetch holidays for 230+ countries
- 🔄 Automatically sync national, religious, and local holidays
- 📅 Support both one-time and recurring holidays
- 🎯 Bulk sync multiple years at once
- 📊 Get holiday statistics and insights

## Features

### 🔧 Admin Features
- **API Connection Testing**: Verify your API key and connection
- **Holiday Preview**: Preview holidays before syncing to database
- **Selective Sync**: Choose which types of holidays to sync (national, religious, local, observance)
- **Dry Run**: Test sync operations without making changes
- **Bulk Sync**: Sync multiple years at once (SuperAdmin only)
- **Holiday Statistics**: View holiday breakdowns and monthly distributions

### 🎨 Smart Holiday Management
- **Automatic Categorization**: Holidays are automatically categorized by type
- **Color Coding**: Different holiday types get different colors
- **Recurring Detection**: Automatically detects which holidays repeat yearly
- **Conflict Resolution**: Handles existing holidays intelligently
- **Metadata Tracking**: Stores original Calendarific data for reference

## Setup Instructions

### 1. Get Calendarific API Key

1. Visit [Calendarific.com](https://calendarific.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 1,000 API calls per month

### 2. Configure Environment

Add your API key to the backend `.env` file:

```env
# Calendarific API (Holiday Management)
CALENDARIFIC_API_KEY=your-calendarific-api-key-here
```

### 3. Run Database Migration

```bash
cd HRM-System/backend
node run-calendarific-migration.js up
```

### 4. Test the Integration

```bash
cd HRM-System/backend
node test-calendarific-api.js
```

## Usage Guide

### Admin Interface

Navigate to **Admin → Calendar → Calendarific Integration** to access the management interface.

#### 🔍 Testing Connection
1. Click "Test Connection" to verify your API key
2. Green status = API is working
3. Red status = Check your API key

#### 👀 Preview Holidays
1. Select country (default: India)
2. Select year (2020-2030)
3. Choose holiday type (national, religious, local, observance)
4. Click "Load Preview" to see holidays without saving

#### 🔄 Sync Holidays
1. Configure sync settings:
   - **Country**: 2-letter country code (IN, US, GB, etc.)
   - **Year**: Year to sync
   - **Holiday Types**: Select multiple types
   - **Overwrite Existing**: Whether to update existing holidays
2. Click "Dry Run" to test without changes
3. Click "Sync Holidays" to save to database

#### 📊 Bulk Sync (SuperAdmin Only)
1. Set start and end year (max 5 years)
2. Configure country and holiday types
3. Click "Bulk Sync" to process multiple years

#### 📈 Statistics
View holiday statistics including:
- Holiday counts by type (national, religious, local)
- Monthly distribution
- Country-specific insights

### API Endpoints

#### Test Connection
```http
GET /api/admin/calendarific/test-connection
```

#### Get Supported Countries
```http
GET /api/admin/calendarific/countries
```

#### Preview Holidays
```http
GET /api/admin/calendarific/preview?country=IN&year=2024&type=national
```

#### Sync Holidays
```http
POST /api/admin/calendarific/sync
Content-Type: application/json

{
  "country": "IN",
  "year": 2024,
  "overwriteExisting": false,
  "dryRun": false,
  "holidayTypes": "national,religious"
}
```

#### Bulk Sync
```http
POST /api/admin/calendarific/bulk-sync
Content-Type: application/json

{
  "country": "IN",
  "startYear": 2024,
  "endYear": 2026,
  "overwriteExisting": false,
  "holidayTypes": "national,religious"
}
```

#### Get Statistics
```http
GET /api/admin/calendarific/stats?country=IN&year=2024
```

## Supported Countries

The integration supports 230+ countries. Popular ones include:

| Country | Code | Flag |
|---------|------|------|
| India | IN | 🇮🇳 |
| United States | US | 🇺🇸 |
| United Kingdom | GB | 🇬🇧 |
| Canada | CA | 🇨🇦 |
| Australia | AU | 🇦🇺 |
| Germany | DE | 🇩🇪 |
| France | FR | 🇫🇷 |
| Japan | JP | 🇯🇵 |
| Singapore | SG | 🇸🇬 |
| UAE | AE | 🇦🇪 |

## Holiday Types

### 🏛️ National Holidays
- Official government holidays
- Usually paid holidays
- Examples: Independence Day, Republic Day

### 🕉️ Religious Holidays
- Religious observances
- May be paid depending on company policy
- Examples: Diwali, Christmas, Eid

### 🎉 Local Holidays
- Regional or state-specific holidays
- Examples: State formation days, regional festivals

### 📅 Observances
- Special observances and commemorations
- Usually not paid holidays
- Examples: World Environment Day, International Women's Day

## Data Model

### Holiday Fields Added

The integration adds these fields to the `holidays` table:

```sql
-- Calendarific integration fields
calendarific_data JSON NULL COMMENT 'Original Calendarific API data',
calendarific_uuid VARCHAR(100) NULL COMMENT 'Calendarific holiday UUID',
synced_from_calendarific BOOLEAN DEFAULT FALSE COMMENT 'Synced from API',
last_synced_at DATETIME NULL COMMENT 'Last sync timestamp'
```

### Holiday Categories

Calendarific holidays are mapped to our categories:

- `national` → `national`
- `religious` → `religious`
- `local` → `public`
- `observance` → `optional`

## Best Practices

### 🎯 Sync Strategy
1. **Start with National Holidays**: Sync national holidays first as they're most important
2. **Add Religious Holidays**: Include major religious holidays for your region
3. **Review Before Sync**: Always preview holidays before syncing
4. **Use Dry Run**: Test sync operations with dry run first
5. **Bulk Sync Carefully**: Bulk sync is powerful but uses more API quota

### 🔒 Security
- **Role-Based Access**: Only HR and SuperAdmin can access Calendarific features
- **API Key Security**: Store API key securely in environment variables
- **Rate Limiting**: Respect API rate limits (1,000 calls/month on free tier)

### 📊 Monitoring
- **Check API Status**: Regularly test API connection
- **Monitor Quota**: Keep track of API usage
- **Review Synced Data**: Verify synced holidays are correct
- **Update Regularly**: Sync new years as they approach

## Troubleshooting

### Common Issues

#### ❌ API Connection Failed
- **Check API Key**: Verify your Calendarific API key is correct
- **Check Network**: Ensure server can reach calendarific.com
- **Check Quota**: Verify you haven't exceeded API limits

#### ❌ No Holidays Found
- **Check Country Code**: Use correct 2-letter ISO country code
- **Check Year Range**: API supports years 2020-2030
- **Check Holiday Type**: Some countries may not have all holiday types

#### ❌ Sync Failed
- **Database Connection**: Ensure database is accessible
- **Permissions**: Verify user has required roles
- **Data Conflicts**: Check for existing holidays with same names

### Debug Steps

1. **Test API Connection**:
   ```bash
   node test-calendarific-api.js
   ```

2. **Check Logs**:
   ```bash
   tail -f logs/combined.log | grep -i calendarific
   ```

3. **Verify Database**:
   ```sql
   SELECT * FROM holidays WHERE synced_from_calendarific = 1;
   ```

## API Limits

### Free Tier
- **1,000 API calls per month**
- **Rate limit**: 1 request per second
- **All countries supported**
- **All holiday types included**

### Paid Tiers
- **Higher API limits**
- **Faster rate limits**
- **Priority support**
- **Historical data access**

## Integration Benefits

### 🚀 For HR Teams
- **Automated Holiday Management**: No more manual holiday entry
- **Global Coverage**: Support for international offices
- **Always Up-to-Date**: Holidays are current and accurate
- **Consistent Data**: Standardized holiday information

### 💼 For Employees
- **Accurate Calendars**: Reliable holiday information
- **Better Planning**: Know holidays in advance
- **Global Awareness**: See holidays for different locations
- **Leave Planning**: Plan leaves around holidays

### 🏢 For Organizations
- **Compliance**: Ensure all official holidays are recognized
- **Efficiency**: Reduce manual holiday management
- **Scalability**: Easy to add new countries/regions
- **Cost-Effective**: Free tier covers most needs

## Future Enhancements

### Planned Features
- **Multi-Country Support**: Sync holidays for multiple countries
- **Custom Holiday Rules**: Override or customize specific holidays
- **Holiday Notifications**: Notify employees of upcoming holidays
- **Calendar Integration**: Export holidays to external calendars
- **Approval Workflow**: Require approval for synced holidays

### API Enhancements
- **Webhook Support**: Real-time holiday updates
- **Batch Operations**: More efficient bulk operations
- **Custom Categories**: Map to custom holiday categories
- **Historical Data**: Access to past years' holidays

## Support

### Documentation
- [Calendarific API Docs](https://calendarific.com/api-documentation)
- [Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- [Holiday Types Guide](https://calendarific.com/holiday-types)

### Getting Help
1. Check this documentation first
2. Test API connection using the test script
3. Review application logs for errors
4. Contact system administrator if issues persist

---

**🎉 Congratulations!** Your HRM system now has powerful holiday management with global coverage. The Calendarific integration will keep your holiday calendar accurate and up-to-date automatically.
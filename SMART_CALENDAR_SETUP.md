# 🚀 Smart Calendar Setup Guide

## Quick Setup Instructions

### 1. Run Database Migration

**Option A: Using npm (Recommended)**
```bash
cd HRM-System/backend
npm run migrate:smart-calendar
```

**Option B: Using Node directly**
```bash
cd HRM-System/backend
node run-smart-calendar-migration.js
```

**Option C: Using batch file (Windows)**
```bash
cd HRM-System/backend
run-migration.bat
```

### 2. Restart Backend Server

```bash
cd HRM-System/backend
npm run dev
```

### 3. Access Smart Calendar Management

1. Login to your HRM system
2. Go to **Admin Panel**
3. Navigate to **HR Administration → Smart Calendar**
4. Configure your working rules and holidays

## What Gets Created

### Database Tables
- ✅ `working_rules` - Centralized weekend/working day management
- ✅ `holidays` - Enhanced with recurring holiday support

### API Endpoints
- ✅ `/api/calendar/smart/*` - Smart calendar endpoints
- ✅ `/api/admin/working-rules/*` - Working rules management
- ✅ Enhanced holiday APIs with recurring support

### Frontend Components
- ✅ Smart Calendar Management page
- ✅ Working rules configuration
- ✅ Holiday management with recurring support

## Default Configuration

### Working Rule Created
- **Name:** Standard Monday-Friday
- **Working Days:** Monday to Friday (1,2,3,4,5)
- **Weekend Days:** Saturday and Sunday (0,6)
- **Status:** Active and Default

### Holiday Table Enhanced
- Existing holidays converted to "ONE_TIME" type
- Support for "RECURRING" holidays with MM-DD format
- Backward compatibility maintained

## Troubleshooting

### Migration Fails
1. Check database connection in `.env`
2. Ensure database user has CREATE/ALTER permissions
3. Check if tables already exist (migration is safe to re-run)

### Backend Won't Start
1. Restart the backend server after migration
2. Check for any import errors in console
3. Verify all new files are properly created

### Frontend Errors
1. Clear browser cache
2. Check if Smart Calendar route is accessible
3. Verify user has proper permissions

## Testing the System

### 1. Test Working Rules API
```bash
curl "http://localhost:5000/api/admin/working-rules/active"
```

### 2. Test Smart Calendar API
```bash
curl "http://localhost:5000/api/calendar/smart/monthly?year=2025&month=1"
```

### 3. Test Holiday Management
```bash
curl "http://localhost:5000/api/admin/holidays"
```

## Next Steps

1. **Configure Working Rules** - Set up your organization's working days
2. **Add Recurring Holidays** - Set up holidays that repeat every year
3. **Test Leave Validation** - Try applying leave and see smart validation
4. **Explore Calendar Views** - Check the enhanced calendar functionality

## Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify database permissions and connectivity
3. Ensure all files were created properly
4. Restart both backend and frontend servers

The Smart Calendar System is now ready to use! 🎉
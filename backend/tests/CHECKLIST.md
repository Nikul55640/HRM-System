# API Testing Checklist

## Pre-Test Checklist ✅

### Environment Setup
- [ ] Node.js installed (v18+)
- [ ] Dependencies installed (`npm install`)
- [ ] Database is running
- [ ] Database is migrated (`npm run migrate`)
- [ ] Database has seed data (`npm run seed`)

### Configuration
- [ ] `.env` file configured in backend root
- [ ] `.env.test` file reviewed in tests folder
- [ ] Test credentials are valid
- [ ] API URL is correct

### Server Status
- [ ] Backend server is running (`npm run dev`)
- [ ] Server is accessible at configured port
- [ ] No port conflicts
- [ ] Database connection is working

## Running Tests Checklist 🚀

### Quick Health Check
```bash
cd HRM-System/backend
npm test
```
- [ ] Health check passes
- [ ] API responds

### Full Test Suite
```bash
npm run test:api
```
- [ ] Authentication succeeds
- [ ] Token is received
- [ ] Tests execute
- [ ] Results are displayed

## Post-Test Checklist 📊

### Review Results
- [ ] Check pass rate (should be >90%)
- [ ] Review failed tests
- [ ] Check skipped tests
- [ ] Note execution time

### If Tests Fail
- [ ] Read error messages
- [ ] Check server logs
- [ ] Verify database state
- [ ] Check endpoint paths
- [ ] Verify authentication

### Documentation
- [ ] Update test cases if API changed
- [ ] Document any issues found
- [ ] Update README if needed

## Troubleshooting Checklist 🔧

### Connection Issues
- [ ] Server is running
- [ ] Correct port number
- [ ] No firewall blocking
- [ ] Network connectivity

### Authentication Issues
- [ ] Credentials are correct
- [ ] User exists in database
- [ ] User has proper role
- [ ] Token is valid

### Test Failures
- [ ] Endpoint exists
- [ ] Correct HTTP method
- [ ] Required data exists
- [ ] Permissions are correct

## Maintenance Checklist 🛠️

### Regular Tasks
- [ ] Run tests weekly
- [ ] Update tests for new endpoints
- [ ] Review and fix failing tests
- [ ] Update documentation
- [ ] Check test coverage

### When Adding New Endpoints
- [ ] Add test case to suite
- [ ] Test the new endpoint
- [ ] Update documentation
- [ ] Verify all tests still pass

### Before Deployment
- [ ] All tests pass
- [ ] No skipped critical tests
- [ ] Performance is acceptable
- [ ] Documentation is updated

## Quick Reference Commands 📝

```bash
# Start backend server
npm run dev

# Quick health check
npm test

# Full API test suite
npm run test:api

# Run migrations
npm run migrate

# Seed database
npm run seed

# View logs
tail -f logs/combined.log
```

## Success Criteria ✨

### Minimum Requirements
- ✅ Pass rate: >90%
- ✅ Authentication: Working
- ✅ Critical endpoints: All passing
- ✅ Response time: <10 seconds

### Ideal Results
- ✅ Pass rate: >95%
- ✅ Failed tests: 0
- ✅ Skipped tests: <5
- ✅ Response time: <5 seconds

## Notes Section 📌

Use this space to track issues or observations:

```
Date: ___________
Tests Run: ___________
Pass Rate: ___________
Issues Found:
- 
- 
- 

Actions Taken:
- 
- 
- 
```

---

**Ready to test?** Start with the Pre-Test Checklist! ✅

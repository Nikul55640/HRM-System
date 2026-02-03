# HRM System Docker Setup Guide

## Overview

This HRM System uses Docker for containerized deployment with the following services:
- **MySQL 8.0**: Primary database for storing all application data
- **Backend (Node.js)**: Express.js API server with Sequelize ORM
- **Frontend (React + Vite)**: Modern React application served via Nginx
- **Redis** (Optional): For caching and session storage
- **Nginx** (Production): Reverse proxy and load balancer

## Quick Start

### Development Environment

1. **Clone and setup environment**:
   ```bash
   cd HRM-System
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start development environment**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MySQL: localhost:3306

### Production Environment

1. **Setup environment**:
   ```bash
   cp .env.example .env
   # Configure production values in .env
   ```

2. **Start production environment**:
   ```bash
   docker-compose up --build -d
   ```

3. **With Nginx reverse proxy**:
   ```bash
   docker-compose --profile production up --build -d
   ```

## Service Details

### MySQL Database
- **Image**: mysql:8.0
- **Port**: 3306
- **Features**:
  - UTF8MB4 character set for full Unicode support
  - Optimized configuration for HRM workloads
  - Persistent data storage
  - Health checks for reliable startup

### Backend API
- **Base**: Node.js 18 Alpine
- **Port**: 5000
- **Features**:
  - Sequelize ORM for MySQL integration
  - JWT authentication
  - File upload support (documents, profile photos)
  - Email notifications (Mailtrap/Resend)
  - Puppeteer for PDF generation
  - Comprehensive logging
  - Health checks

### Frontend Application
- **Development**: Vite dev server (port 5173)
- **Production**: Nginx serving built assets (port 80)
- **Features**:
  - React 18 with modern hooks
  - Tailwind CSS for styling
  - Zustand for state management
  - Responsive design
  - SPA routing support

### Redis (Optional)
- **Image**: redis:7-alpine
- **Port**: 6379
- **Usage**: Session storage, caching, rate limiting
- **Enable**: Use `--profile with-redis` flag

## Environment Configuration

### Required Environment Variables

```bash
# Database
DB_NAME=hrm2
DB_USER=hrm_user
DB_PASSWORD=secure_password_here

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Email Configuration
EMAIL_PROVIDER=MAILTRAP
MAILTRAP_API_TOKEN=your_mailtrap_token

# External APIs
CALENDARIFIC_API_KEY=your_calendarific_key
```

### Optional Configuration

```bash
# Performance
DB_MAX_POOL_SIZE=10
MAX_FILE_SIZE=10485760

# Security
DOCUMENT_ENCRYPTION_KEY=32-character-encryption-key
AUDIT_LOG_RETENTION_YEARS=7

# Development
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Docker Commands

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Rebuild specific service
docker-compose build backend
docker-compose up backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in containers
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
docker-compose exec mysql mysql -u root -p hrm2
```

### Production Deployment

```bash
# Deploy production stack
docker-compose up -d --build

# Deploy with reverse proxy
docker-compose --profile production up -d --build

# Scale services (if needed)
docker-compose up -d --scale backend=2

# Update specific service
docker-compose up -d --no-deps backend
```

### Maintenance Commands

```bash
# View container status
docker-compose ps

# Check resource usage
docker stats

# Backup database
docker-compose exec mysql mysqldump -u root -p hrm2 > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p hrm2 < backup.sql

# Clean up
docker-compose down -v  # Remove containers and volumes
docker system prune -a  # Clean up unused images
```

## Volume Management

### Persistent Data
- `mysql_data`: Database files
- `./backend/uploads`: User uploaded files
- `./backend/logs`: Application logs

### Development Volumes
- `./backend:/app`: Live code reloading
- `./frontend:/app`: Live code reloading

## Health Checks

All services include health checks:
- **MySQL**: Connection test via mysqladmin
- **Backend**: HTTP health endpoint
- **Frontend**: Nginx status check
- **Redis**: Redis ping command

## Troubleshooting

### Common Issues

1. **Database connection failed**:
   ```bash
   # Check MySQL logs
   docker-compose logs mysql
   
   # Verify environment variables
   docker-compose exec backend env | grep DB_
   ```

2. **Frontend build fails**:
   ```bash
   # Check Node.js version
   docker-compose exec frontend node --version
   
   # Clear npm cache
   docker-compose exec frontend npm cache clean --force
   ```

3. **Permission issues**:
   ```bash
   # Fix upload directory permissions
   sudo chown -R 1001:1001 backend/uploads
   ```

### Performance Optimization

1. **Database tuning**:
   - Adjust `DB_MAX_POOL_SIZE` based on load
   - Monitor connection usage
   - Consider read replicas for high traffic

2. **Memory limits**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

3. **Nginx caching**:
   - Static assets cached for 1 year
   - API responses not cached by default
   - Gzip compression enabled

## Security Considerations

1. **Environment Variables**: Never commit real secrets to version control
2. **Database**: Use strong passwords and limit network access
3. **File Uploads**: Validate file types and sizes
4. **HTTPS**: Use SSL certificates in production
5. **Updates**: Regularly update base images for security patches

## Monitoring

### Logs
```bash
# Centralized logging
docker-compose logs -f

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f mysql
```

### Metrics
- Container resource usage: `docker stats`
- Application metrics: Available via backend health endpoint
- Database metrics: MySQL performance schema

## Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec mysql mysqldump -u root -p$DB_PASSWORD hrm2 > "backup_${DATE}.sql"
tar -czf "hrm_backup_${DATE}.tar.gz" backup_${DATE}.sql backend/uploads/
```

This Docker setup provides a robust, scalable foundation for the HRM System with proper separation of concerns, security best practices, and operational flexibility.
# MySQL Migration Guide

This guide will help you migrate from MongoDB to MySQL with Sequelize.

## Prerequisites

1. **MySQL Server**: Install MySQL 8.0 or higher
2. **Node.js**: Version 18.0.0 or higher
3. **npm**: Latest version

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies:
- `sequelize`: ORM for MySQL
- `mysql2`: MySQL driver for Node.js
- `sequelize-cli`: Command line interface for Sequelize

### 2. Database Setup

#### Create MySQL Database

```sql
CREATE DATABASE hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON hrms.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your MySQL configuration:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hrms
DB_USER=hrms_user
DB_PASSWORD=your_secure_password
```

### 3. Run Migration

Execute the migration script to create tables and default data:

```bash
npm run migrate
```

This will:
- Create all database tables
- Set up relationships
- Create a default admin user (admin@hrms.com / admin123)
- Create a default department

### 4. Start the Server

```bash
npm run dev
```

## Key Changes from MongoDB to MySQL

### 1. Model Structure

**MongoDB (Mongoose):**
```javascript
const userSchema = new Schema({
  email: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Employee'] }
});
```

**MySQL (Sequelize):**
```javascript
User.init({
  email: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Admin', 'Employee') }
});
```

### 2. Queries

**MongoDB:**
```javascript
const user = await User.findOne({ email });
const users = await User.find({ role: 'Employee' });
```

**MySQL (Sequelize):**
```javascript
const user = await User.findOne({ where: { email } });
const users = await User.findAll({ where: { role: 'Employee' } });
```

### 3. Relationships

**MongoDB (Population):**
```javascript
const user = await User.findById(id).populate('department');
```

**MySQL (Sequelize Includes):**
```javascript
const user = await User.findByPk(id, {
  include: [{ association: 'department' }]
});
```

## Database Schema

### Core Tables

1. **users** - User accounts and authentication
2. **departments** - Company departments
3. **employees** - Employee information
4. **attendance_records** - Daily attendance tracking
5. **leave_requests** - Leave applications

### Key Features

- **Auto-incrementing IDs**: Primary keys are integers
- **Foreign Key Constraints**: Proper referential integrity
- **JSON Fields**: For flexible data like custom fields
- **Indexes**: Optimized for common queries
- **Timestamps**: Automatic created_at/updated_at

## Migration Commands

```bash
# Run full migration with default data
npm run migrate

# Sync database schema only
npm run db:sync

# Start development server
npm run dev
```

## Troubleshooting

### Connection Issues

1. Verify MySQL is running:
   ```bash
   sudo systemctl status mysql
   ```

2. Test connection:
   ```bash
   mysql -u hrms_user -p hrms
   ```

3. Check firewall settings for port 3306

### Permission Issues

```sql
GRANT ALL PRIVILEGES ON hrms.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
```

### Schema Issues

If you need to reset the database:

```sql
DROP DATABASE hrms;
CREATE DATABASE hrms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the migration again:

```bash
npm run migrate
```

## Performance Considerations

1. **Indexes**: Added on frequently queried fields
2. **Connection Pooling**: Configured for optimal performance
3. **Query Optimization**: Use includes instead of separate queries
4. **Pagination**: Implement limit/offset for large datasets

## Security Features

1. **SQL Injection Protection**: Sequelize automatically escapes queries
2. **Password Hashing**: bcrypt with salt rounds
3. **Foreign Key Constraints**: Data integrity enforcement
4. **Input Validation**: Joi validation schemas

## Next Steps

1. Update all controllers to use Sequelize models
2. Test all API endpoints
3. Update frontend if needed
4. Set up database backups
5. Configure production environment

For questions or issues, refer to the [Sequelize documentation](https://sequelize.org/docs/v6/).
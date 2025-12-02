# HRM System

A modern Human Resource Management System built with React and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd hrm-system
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

3. **Setup Frontend** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
hrm-system/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite UI
├── docs/            # Documentation
└── PROJECT_GUIDE.md # Detailed guide
```

## 📚 Documentation

- **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** - Complete project guide
- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** - API documentation
- **[docs/SECURITY.md](docs/SECURITY.md)** - Security guidelines

## 🔑 Default Login

After seeding the database:
- Email: `admin@hrm.com`
- Password: `Admin@123`

## 🛠️ Available Scripts

### Backend
```bash
npm run dev      # Start development server
npm start        # Start production server
npm run seed     # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌟 Features

- Employee Management
- Leave Management
- Attendance Tracking
- Payroll Management
- Document Management
- Employee Self-Service Portal
- Role-based Access Control
- Dashboard & Analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 💡 Need Help?

Check **PROJECT_GUIDE.md** for detailed information about:
- Project structure
- How to add new features
- Common issues and fixes
- Import rules and best practices

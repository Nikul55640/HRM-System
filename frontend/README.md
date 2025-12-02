# HRMS Frontend

React frontend application for the HRMS Employee Management module.

## Directory Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Redux store and slices
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── package.json
```

## Features

- React 18 with functional components and hooks
- Redux Toolkit for state management
- React Router v6 for navigation
- Tailwind CSS for styling
- Formik + Yup for forms and validation
- Axios for API communication
- Toast notifications

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues

## Component Structure

Components are organized by feature:

- **components/** - Shared/reusable components
- **pages/** - Page-level components
- **store/slices/** - Redux slices for state management

## Styling

This project uses Tailwind CSS for styling. Custom theme configuration can be found in `tailwind.config.js`.

## Testing

Tests are written using React Testing Library and Jest.

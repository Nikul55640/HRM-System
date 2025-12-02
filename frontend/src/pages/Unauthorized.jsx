import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-8">
          You dont have permission to access this page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

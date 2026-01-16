import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center bg-white shadow-lg rounded-2xl p-6">
        {/* Icon */}
        <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full bg-indigo-100">
          <SearchX className="w-5 h-5 text-indigo-600" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The page you are looking for does not exist or was moved.
        </p>

        {/* Actions */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

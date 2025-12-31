import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteDebugger = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 [ROUTE DEBUG] Current route:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white text-xs p-2 rounded opacity-75 z-50">
      Route: {location.pathname}
    </div>
  );
};

export default RouteDebugger;
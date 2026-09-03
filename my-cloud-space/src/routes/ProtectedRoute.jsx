import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import FullPageSpinner from '../components/common/FullPageSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <FullPageSpinner label="Restoring your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;

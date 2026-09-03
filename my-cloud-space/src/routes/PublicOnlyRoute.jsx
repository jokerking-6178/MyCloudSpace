import { Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import FullPageSpinner from '../components/common/FullPageSpinner';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return <FullPageSpinner />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicOnlyRoute;

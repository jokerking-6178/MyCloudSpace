import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import LoginModal from './components/Login/Login';
import RegisterModal from './components/Register/Register';
import OAuth2RedirectHandler from './components/OauthHandler/OAuth2RedirectHandler';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginModal />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterModal />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </ErrorBoundary>
  );
}

export default App;

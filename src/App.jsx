import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import useStore from '@/store/useStore';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import CreateLink from '@/pages/CreateLink';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';
import Redirect from '@/pages/Redirect';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateLink />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:linkId"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          {/* Route for shortened links */}
          <Route path="/:shortCode" element={<Redirect />} />
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GigsList from './pages/GigList';
import GigDetail from './pages/GigDetail';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import ProjectsList from './pages/ProjectsList';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import { PageLoader } from './components/ui/Loader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main className="min-h-[calc(100vh-64px)]">{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<GuestRoute><Layout><Login /></Layout></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Layout><Register /></Layout></GuestRoute>} />
      <Route path="/gigs" element={<Layout><GigsList /></Layout>} />
      <Route path="/gigs/create" element={<ProtectedRoute><Layout><CreateGig /></Layout></ProtectedRoute>} />
      <Route path="/gigs/:id/edit" element={<ProtectedRoute><Layout><EditGig /></Layout></ProtectedRoute>} />
      <Route path="/gigs/:id" element={<Layout><GigDetail /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsList /></Layout>} />
      <Route path="/projects/create" element={<ProtectedRoute><Layout><CreateProject /></Layout></ProtectedRoute>} />
      <Route path="/projects/:id" element={<Layout><ProjectDetail /></Layout>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/profile/:id" element={<Layout><Profile /></Layout>} />
      <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
      <Route path="/messages/:userId" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1c1c',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0d0d0d' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#0d0d0d' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
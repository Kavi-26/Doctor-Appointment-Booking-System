import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import PatientRegister from './pages/auth/PatientRegister';
import PatientLogin from './pages/auth/PatientLogin';
import DoctorRegister from './pages/auth/DoctorRegister';
import DoctorLogin from './pages/auth/DoctorLogin';
import AdminLogin from './pages/auth/AdminLogin';
import PatientDashboard from './pages/patient/PatientDashboard';
import SearchDoctors from './pages/patient/SearchDoctors';
import DoctorProfile from './pages/patient/DoctorProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientHistory from './pages/patient/PatientHistory';
import PatientNotifications from './pages/patient/PatientNotifications';
import PatientSettings from './pages/patient/PatientSettings';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorNotifications from './pages/doctor/DoctorNotifications';
import DoctorSettings from './pages/doctor/DoctorSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guest Route (redirect if already logged in)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    switch (role) {
      case 'patient': return <Navigate to="/patient/dashboard" replace />;
      case 'doctor': return <Navigate to="/doctor/dashboard" replace />;
      case 'admin': return <Navigate to="/admin/dashboard" replace />;
      default: return children;
    }
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public */}
            <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />

            {/* Auth */}
            <Route path="/patient/register" element={<GuestRoute><PatientRegister /></GuestRoute>} />
            <Route path="/patient/login" element={<GuestRoute><PatientLogin /></GuestRoute>} />
            <Route path="/doctor/register" element={<GuestRoute><DoctorRegister /></GuestRoute>} />
            <Route path="/doctor/login" element={<GuestRoute><DoctorLogin /></GuestRoute>} />
            <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/search-doctors" element={<ProtectedRoute allowedRole="patient"><SearchDoctors /></ProtectedRoute>} />
            <Route path="/patient/doctors/:id" element={<ProtectedRoute allowedRole="patient"><DoctorProfile /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/history" element={<ProtectedRoute allowedRole="patient"><PatientHistory /></ProtectedRoute>} />
            <Route path="/patient/notifications" element={<ProtectedRoute allowedRole="patient"><PatientNotifications /></ProtectedRoute>} />
            <Route path="/patient/settings" element={<ProtectedRoute allowedRole="patient"><PatientSettings /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/availability" element={<ProtectedRoute allowedRole="doctor"><DoctorAvailability /></ProtectedRoute>} />
            <Route path="/doctor/earnings" element={<ProtectedRoute allowedRole="doctor"><DoctorEarnings /></ProtectedRoute>} />
            <Route path="/doctor/notifications" element={<ProtectedRoute allowedRole="doctor"><DoctorNotifications /></ProtectedRoute>} />
            <Route path="/doctor/settings" element={<ProtectedRoute allowedRole="doctor"><DoctorSettings /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><AdminDoctors /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute allowedRole="admin"><AdminPatients /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute allowedRole="admin"><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><AdminSettings /></ProtectedRoute>} />

            {/* 404 Catch All */}
            <Route path="*" element={
              <div className="loading-container" style={{ minHeight: '60vh' }}>
                <div style={{ fontSize: '4rem' }}>🔍</div>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SurveyForm from './pages/SurveyForm';
import Complete from './pages/Complete';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminGuard from './components/AdminGuard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/survey" element={<SurveyForm />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        } />
      </Routes>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';
import ChatWidget from './components/ChatWidget';
import { Home } from './pages/client/Home';
import { SearchStays } from './pages/client/SearchStays';
import { HotelDetail } from './pages/client/HotelDetail';
import { SearchFlights } from './pages/client/SearchFlights';
import { FlightCheckout } from './pages/client/FlightCheckout';
import { HotelCheckout } from './pages/client/HotelCheckout';
import { VNPayReturn } from './pages/client/VNPayReturn';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PartnerOnboarding } from './pages/partner/PartnerOnboarding';
import { PartnerDashboard } from './pages/partner/PartnerDashboard';
import { PartnerProperties } from './pages/partner/PartnerProperties';
import { PartnerFinance } from './pages/partner/PartnerFinance';
import { AccessDenied } from './pages/auth/AccessDenied';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

/** Component điều hướng thông minh cho luồng đối tác (Partner Redirect).
 * Nếu người dùng đã đăng nhập (có token JWT trong localStorage), chuyển hướng thẳng tới Dashboard.
 * Ngược lại, chuyển hướng tới màn hình Onboarding giới thiệu và đăng ký.
 */
function PartnerRedirect() {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/partner/dashboard" replace /> : <Navigate to="/partner/onboarding" replace />;
}

/** Layout wrapper: ẩn Navbar/Footer toàn cục trên các route /partner/* vì partner portal dùng PartnerHeader riêng. */
function AppLayout() {
  const { pathname } = useLocation();
  const isPartnerRoute = pathname.startsWith('/partner');

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-x-hidden">
      {/* Lớp phủ kết cấu nhiễu đá vôi sang trọng đặc trưng từ thiết kế Stitch */}
      <div className="texture-overlay" />

      {/* Thanh điều hướng toàn cục — ẩn cho luồng partner */}
      {!isPartnerRoute && <Navbar />}

      {/* Nội dung chính */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stays" element={<SearchStays />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/flights" element={<SearchFlights />} />
          <Route path="/flights/checkout" element={<FlightCheckout />} />
          <Route path="/booking" element={<HotelCheckout />} />
          <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Partner portal */}
          <Route path="/partner" element={<PartnerRedirect />} />
          <Route path="/partner/onboarding" element={<PartnerOnboarding />} />
          <Route
            path="/partner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Partner']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/properties"
            element={
              <ProtectedRoute allowedRoles={['Partner']}>
                <PartnerProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/finance"
            element={
              <ProtectedRoute allowedRoles={['Partner']}>
                <PartnerFinance />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>


      {/* Chân trang toàn cục — ẩn cho luồng partner */}
      {!isPartnerRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;

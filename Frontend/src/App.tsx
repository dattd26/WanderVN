import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';
import { Home } from './pages/client/Home';
import { SearchStays } from './pages/client/SearchStays';
import { HotelDetail } from './pages/client/HotelDetail';
import { SearchFlights, SearchFlights as FlightDetail } from './pages/client/SearchFlights';
import { FlightCheckout } from './pages/client/FlightCheckout';
import { VNPayReturn } from './pages/client/VNPayReturn';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-x-hidden">
        {/* Lớp phủ kết cấu nhiễu đá vôi sang trọng đặc trưng từ thiết kế Stitch */}
        <div className="texture-overlay" />

        {/* Thanh điều hướng nổi toàn cục */}
        <Navbar />

        {/* Nội dung chính của các Trang */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stays" element={<SearchStays />} />
            <Route path="/hotel/:id" element={<HotelDetail />} />
            <Route path="/flights" element={<SearchFlights />} />
            <Route path="/flights/:offerId" element={<FlightDetail />} />
            <Route path="/flights/checkout" element={<FlightCheckout />} />
            <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>

        {/* Chân trang toàn cục */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;


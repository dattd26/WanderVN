import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { SearchStays } from './pages/SearchStays';
import { HotelDetail } from './pages/HotelDetail';

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
          </Routes>
        </div>

        {/* Chân trang toàn cục */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

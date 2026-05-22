import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function ConsumerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-x-hidden">
      {/* Lớp phủ kết cấu nhiễu đá vôi sang trọng đặc trưng từ thiết kế Stitch */}
      <div className="texture-overlay" />

      {/* Global Consumer Navigation Bar */}
      <Navbar />

      {/* Main Consumer Route Outlet */}
      <div className="flex-grow">
        <Outlet />
      </div>

      {/* Global Consumer Footer */}
      <Footer />
    </div>
  );
}

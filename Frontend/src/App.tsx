import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConsumerLayout } from './components/ConsumerLayout';
import { Home } from './pages/Home';
import { SearchStays } from './pages/SearchStays';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/dashboard/AdminDashboard';
import { AdminUsers } from './pages/admin/users/AdminUsers';
import { AdminPartners } from './pages/admin/partners/AdminPartners';
import { AdminContent } from './pages/admin/content/AdminContent';
import { AdminFinance } from './pages/admin/finance/AdminFinance';

function App() {
  return (
    <Router>
      <Routes>
        {/* Consumer Portal Routes */}
        <Route element={<ConsumerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/stays" element={<SearchStays />} />
        </Route>

        {/* Admin Console Nested Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="finance" element={<AdminFinance />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

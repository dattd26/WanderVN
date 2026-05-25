import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  // 1. Nếu chưa đăng nhập: Chuyển hướng sang trang đăng nhập, kèm đường dẫn redirect quay lại sau khi login thành công
  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Nếu đã đăng nhập nhưng không có vai trò phù hợp: Chuyển hướng sang trang Access Denied (Hạn chế quyền truy cập)
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  // 3. Nếu mọi điều kiện hợp lệ: Cho phép truy cập vào các component con
  return <>{children}</>;
};

export default ProtectedRoute;

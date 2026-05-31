import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component hỗ trợ tự động cuộn lên đầu trang (scroll to top) mỗi khi thay đổi đường dẫn (route).
 * Giải quyết vấn đề đặc trưng của Single Page Application (SPA) khi giữ nguyên vị trí cuộn
 * từ trang trước đó khi người dùng chuyển hướng.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;

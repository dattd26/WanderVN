import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth/authService';

export function ChangePasswordAdmin() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    try {
      await authService.changePassword({ oldPassword, newPassword });
      alert('Cập nhật mật khẩu thành công!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  return (
    <div className="flex-1 p-admin-xl flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white border border-admin-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-admin-lg border-b border-admin-outline-variant bg-admin-surface-container-lowest">
          <h2 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">Đổi mật khẩu</h2>
          <p className="font-admin-sans text-admin-body-md text-admin-on-surface-variant mt-1">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản quản trị của bạn.</p>
        </div>
        <form className="p-admin-lg space-y-admin-lg" onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="space-y-admin-sm">
            <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface" htmlFor="old-password">Mật khẩu hiện tại (Old Password)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline">lock</span>
              <input 
                className="w-full pl-10 pr-12 py-3 bg-white border border-admin-outline-variant rounded-lg focus:border-admin-primary-container focus:ring-2 focus:ring-admin-secondary-container/20 outline-none transition-all font-admin-sans text-admin-body-md" 
                id="old-password" 
                placeholder="••••••••" 
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-outline hover:text-admin-primary transition-colors" 
                onClick={() => setShowOld(!showOld)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showOld ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          {/* New Password */}
          <div className="space-y-admin-sm">
            <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface" htmlFor="new-password">Mật khẩu mới (New Password)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline">lock</span>
              <input 
                className="w-full pl-10 pr-12 py-3 bg-white border border-admin-outline-variant rounded-lg focus:border-admin-primary-container focus:ring-2 focus:ring-admin-secondary-container/20 outline-none transition-all font-admin-sans text-admin-body-md" 
                id="new-password" 
                placeholder="••••••••" 
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-outline hover:text-admin-primary transition-colors" 
                onClick={() => setShowNew(!showNew)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showNew ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          {/* Confirm New Password */}
          <div className="space-y-admin-sm">
            <label className="block font-admin-sans text-admin-body-sm font-bold text-admin-on-surface" htmlFor="confirm-password">Xác nhận mật khẩu mới (Confirm New Password)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-outline">lock</span>
              <input 
                className="w-full pl-10 pr-12 py-3 bg-white border border-admin-outline-variant rounded-lg focus:border-admin-primary-container focus:ring-2 focus:ring-admin-secondary-container/20 outline-none transition-all font-admin-sans text-admin-body-md" 
                id="confirm-password" 
                placeholder="••••••••" 
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-outline hover:text-admin-primary transition-colors" 
                onClick={() => setShowConfirm(!showConfirm)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showConfirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          {/* Password Requirements */}
          <div className="bg-admin-surface-container-low p-admin-md rounded-lg border border-admin-outline-variant/50">
            <h3 className="font-admin-sans text-admin-label-caps font-bold text-admin-on-surface mb-2">Quy định về mật khẩu:</h3>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-admin-secondary">check_circle</span>
                Tối thiểu 8 ký tự
              </li>
              <li className="flex items-center gap-2 font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-admin-secondary">check_circle</span>
                Bao gồm ít nhất một chữ hoa (A-Z)
              </li>
              <li className="flex items-center gap-2 font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-admin-secondary">check_circle</span>
                Bao gồm ít nhất một chữ thường (a-z)
              </li>
              <li className="flex items-center gap-2 font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-admin-secondary">check_circle</span>
                Bao gồm ít nhất một chữ số (0-9)
              </li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-admin-md pt-admin-md">
            <button 
              className="px-admin-xl py-2.5 bg-white border border-admin-primary-container text-admin-primary font-admin-sans text-admin-body-md rounded-lg hover:bg-admin-surface-container-low transition-colors" 
              type="button"
              onClick={() => navigate(-1)}
            >
              Hủy
            </button>
            <button 
              className="px-admin-xl py-2.5 bg-admin-primary-container text-white font-admin-sans text-admin-body-md rounded-lg hover:opacity-90 shadow-md transition-all" 
              type="submit"
            >
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

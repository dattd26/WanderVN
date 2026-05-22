import React, { useState, useEffect } from 'react';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  status: 'Active' | 'Locked';
  avatarUrl?: string;
  initials?: string;
  role?: 'Traveler' | 'Admin';
}

interface UserModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData: UserRecord | null;
  onClose: () => void;
  onSave: (userData: Partial<UserRecord>) => void;
}

export function UserModal({ isOpen, mode, initialData, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Traveler' | 'Admin'>('Traveler');
  const [status, setStatus] = useState<'Active' | 'Locked'>('Active');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
        setRole(initialData.role || 'Traveler');
        setStatus(initialData.status || 'Active');
        setAvatarUrl(initialData.avatarUrl);
      } else {
        setName('');
        setEmail('');
        setPhone('');
        setRole('Traveler');
        setStatus('Active');
        setAvatarUrl(undefined);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    onSave({
      name,
      email,
      phone,
      role,
      status,
      avatarUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-admin-xl py-admin-md border-b border-admin-outline-variant flex items-center justify-between bg-admin-surface-bright select-none">
          <h3 className="font-admin-sans text-admin-headline-md text-admin-primary">
            {mode === 'create' ? 'Thêm Người Dùng Mới' : 'Chỉnh Sửa Người Dùng'}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-admin-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-admin-xl overflow-y-auto custom-scrollbar flex-grow">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-admin-lg">
            {/* Profile Image Upload Placeholder */}
            <div className="flex flex-col items-center gap-admin-sm pb-admin-md border-b border-admin-outline-variant/30 select-none">
              <input 
                type="file" 
                id="modal-avatar-upload" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              <label 
                htmlFor="modal-avatar-upload"
                className="w-24 h-24 rounded-full border-2 border-dashed border-admin-outline-variant flex flex-col items-center justify-center bg-admin-surface-container-low group cursor-pointer hover:border-admin-secondary transition-colors overflow-hidden relative"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-admin-outline group-hover:text-admin-secondary transition-colors">add_a_photo</span>
                    <span className="text-[10px] font-admin-sans text-admin-on-surface-variant font-bold uppercase tracking-wider">TẢI ẢNH</span>
                  </>
                )}
              </label>
              <p className="text-admin-body-sm text-admin-on-surface-variant">Ảnh đại diện (JPG, PNG)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg">
              {/* Full Name */}
              <div className="flex flex-col gap-admin-xs">
                <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">HỌ VÀ TÊN</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nhập tên đầy đủ" 
                  className="px-admin-md py-admin-sm border border-admin-outline-variant rounded-lg text-admin-body-md focus:ring-2 focus:ring-admin-secondary focus:outline-none bg-white text-admin-on-surface transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-admin-xs">
                <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">EMAIL</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@wandervn.com" 
                  className="px-admin-md py-admin-sm border border-admin-outline-variant rounded-lg text-admin-body-md focus:ring-2 focus:ring-admin-secondary focus:outline-none bg-white text-admin-on-surface transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-admin-xs">
                <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">SỐ ĐIỆN THOẠI</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+84 ..." 
                  className="px-admin-md py-admin-sm border border-admin-outline-variant rounded-lg text-admin-body-md focus:ring-2 focus:ring-admin-secondary focus:outline-none bg-white text-admin-on-surface transition-all"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-admin-xs">
                <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">VAI TRÒ</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'Traveler' | 'Admin')}
                  className="px-admin-md py-admin-sm border border-admin-outline-variant rounded-lg text-admin-body-md focus:ring-2 focus:ring-admin-secondary focus:outline-none bg-white text-admin-on-surface transition-all"
                >
                  <option value="Traveler">Traveler</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-admin-xs">
                <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">TRẠNG THÁI</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Locked')}
                  className="px-admin-md py-admin-sm border border-admin-outline-variant rounded-lg text-admin-body-md focus:ring-2 focus:ring-admin-secondary focus:outline-none bg-white text-admin-on-surface transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-admin-xl py-admin-lg border-t border-admin-outline-variant bg-admin-surface-container-low flex justify-end gap-admin-md select-none">
          <button 
            type="button"
            onClick={onClose}
            className="px-admin-lg py-admin-sm border border-admin-outline-variant text-admin-on-surface-variant font-bold rounded-lg hover:bg-admin-surface-container transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="user-form"
            className="px-admin-lg py-admin-sm bg-admin-primary-container text-admin-on-primary font-bold rounded-lg hover:bg-admin-primary shadow-md transition-all active:scale-95"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

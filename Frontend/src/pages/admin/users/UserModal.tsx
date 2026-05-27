import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <-- Đã thêm Portal để sửa triệt để lỗi trắng Header
import { userService, roleService } from '../../../services';
import type { UserDetailsDto, UserHotelDto, RoleDto } from '../../../types';

interface UserModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

interface FormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  isActive: boolean;
  avatarUrl: string;
  password: string;
  confirmPassword: string;
  newPassword: string;
}

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  roleId: 0, // Sẽ được set lại sau khi roles tải xong (mặc định Customer)
  isActive: true,
  avatarUrl: '',
  password: '',
  confirmPassword: '',
  newPassword: '',
};

export function UserModal({ isOpen, userId, onClose, onSaveSuccess }: UserModalProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [hotels, setHotels] = useState<UserHotelDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isEditMode = userId !== null;

  const findRoleIdByName = (list: RoleDto[], roleName?: string): number => {
    const found = list.find((r) => r.name.toLowerCase() === roleName?.toLowerCase());
    return found?.id ?? list.find((r) => r.name.toLowerCase() === 'customer')?.id ?? 0;
  };

  // Tải danh sách Roles động từ backend mỗi khi modal mở (tránh hard-code RoleId)
  useEffect(() => {
    if (!isOpen) return;
    roleService
      .getRoles()
      .then(setRoles)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Không tải được danh sách vai trò')
      );
  }, [isOpen]);

  // Fetch dữ liệu khi ở chế độ chỉnh sửa
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (isEditMode && userId) {
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);
        userService
          .getCustomerById(userId)
          .then((data: UserDetailsDto) => {
            setFormData({
              fullName: data.fullName || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              roleId: findRoleIdByName(roles, data.roleName),
              isActive: data.isActive !== false,
              avatarUrl: data.avatarUrl || '',
              password: '',
              confirmPassword: '',
              newPassword: '',
            });
            setHotels(data.hotels || []);
          })
          .catch((err) =>
            setError(err instanceof Error ? err.message : 'Không thể tải thông tin người dùng')
          )
          .finally(() => setIsLoading(false));
      } else {
        setFormData({ ...initialFormState, roleId: findRoleIdByName(roles, 'Customer') });
        setHotels([]);
        setError(null);
        setSuccessMsg(null);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, userId, isEditMode, roles]);

  if (!isOpen) return null;

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isEditMode) {
      if (!formData.email.trim()) {
        setError('Vui lòng nhập địa chỉ email.');
        return;
      }
      if (!formData.password.trim()) {
        setError('Vui lòng nhập mật khẩu.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Xác nhận mật khẩu không khớp.');
        return;
      }
    }

    if (isEditMode && formData.newPassword && formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && userId) {
        // ---- UPDATE ----
        await userService.updateCustomer(userId, {
          fullName: formData.fullName.trim() || null,
          phoneNumber: formData.phoneNumber.trim() || null,
          avatarUrl: formData.avatarUrl.trim() || null,
          isActive: formData.isActive,
          roleId: formData.roleId,
          password: formData.newPassword.trim() || undefined,
        });
        setSuccessMsg('Cập nhật người dùng thành công!');
      } else {
        // ---- CREATE ----
        await userService.createCustomer({
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.fullName.trim() || undefined,
          phoneNumber: formData.phoneNumber.trim() || undefined,
          avatarUrl: formData.avatarUrl.trim() || undefined,
          isActive: formData.isActive,
        });
        setSuccessMsg('Tạo người dùng mới thành công!');
      }

      if (onSaveSuccess) onSaveSuccess();

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsSaving(false);
    }
  };

  const roleName = roles.find((r) => r.id === formData.roleId)?.name ?? 'Customer';
  const roleLower = roleName.toLowerCase();
  const roleBadgeClass =
    roleLower === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : roleLower === 'partner'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-green-100 text-green-800';

  // ĐÃ SỬA: Sử dụng createPortal để đưa cấu trúc Modal ra hẳn body HTML, giải quyết triệt để lỗi che khuất
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSave}
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-admin-xl py-admin-md border-b border-admin-outline-variant flex items-center justify-between bg-admin-surface-bright select-none shrink-0">
          <h3 className="font-admin-sans text-admin-headline-md text-admin-primary font-bold">
            {isEditMode ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-admin-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-admin-xl overflow-y-auto custom-scrollbar flex-grow">
          {isLoading ? (
            /* Loading skeleton */
            <div className="space-y-admin-lg animate-pulse">
              <div className="flex flex-col items-center gap-admin-sm pb-admin-md border-b border-admin-outline-variant/30">
                <div className="w-24 h-24 rounded-full bg-admin-surface-container-low" />
                <div className="h-5 w-40 bg-admin-surface-container-low rounded" />
                <div className="h-4 w-32 bg-admin-surface-container-low rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 bg-admin-surface-container-low rounded" />
                    <div className="h-5 w-full bg-admin-surface-container-low rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-admin-lg">

              {/* Thông báo lỗi */}
              {error && (
                <div className="flex items-center gap-admin-sm p-admin-md bg-error-container border border-error/20 rounded-lg text-error text-admin-body-sm font-admin-sans animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Thông báo thành công */}
              {successMsg && (
                <div className="flex items-center gap-admin-sm p-admin-md bg-green-50 border border-green-200 rounded-lg text-green-800 text-admin-body-sm font-admin-sans animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Avatar Header */}
              <div className="flex flex-col items-center gap-admin-sm pb-admin-md border-b border-admin-outline-variant/30 select-none">
                {formData.avatarUrl ? (
                  <img
                    src={formData.avatarUrl}
                    alt={formData.fullName || ''}
                    className="w-24 h-24 rounded-full border-2 border-admin-outline-variant object-cover shadow-md"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-2xl shadow-md">
                    {getInitials(formData.fullName)}
                  </div>
                )}
                <h4 className="font-admin-sans text-admin-headline-sm text-admin-primary font-bold">
                  {formData.fullName || '(Chưa có tên)'}
                </h4>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-admin-sm py-0.5 rounded-full font-admin-sans ${roleBadgeClass
                  }`}>
                  {roleName}
                </span>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-admin-lg">
                {/* ĐÃ XOÁ Ô HIỂN THỊ ID NGƯỜI DÙNG Ở ĐÂY */}

                {/* Họ và tên */}
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                    HỌ VÀ TÊN
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                    EMAIL <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={formData.email}
                    disabled={isEditMode}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all ${isEditMode ? 'opacity-60 cursor-not-allowed bg-admin-surface-container' : ''
                      }`}
                  />
                  {isEditMode && (
                    <span className="text-[11px] text-admin-on-surface-variant font-admin-sans">Email không thể thay đổi sau khi tạo</span>
                  )}
                </div>

                {/* Mật khẩu - chỉ hiện khi CREATE */}
                {!isEditMode && (
                  <>
                    <div className="flex flex-col gap-admin-xs">
                      <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                        MẬT KHẨU <span className="text-error">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Tối thiểu 6 ký tự"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-admin-xs">
                      <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                        XÁC NHẬN MẬT KHẨU <span className="text-error">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Đổi mật khẩu - chỉ hiện khi EDIT, optional */}
                {isEditMode && (
                  <div className="flex flex-col gap-admin-xs md:col-span-2">
                    <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                      ĐỔI MẬT KHẨU <span className="text-admin-on-surface-variant font-normal normal-case text-[11px]">(để trống nếu không muốn thay đổi)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới..."
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                    />
                  </div>
                )}

                {/* Số điện thoại */}
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                    SỐ ĐIỆN THOẠI
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                  />
                </div>

                {/* URL Avatar */}
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                    URL ẢNH ĐẠI DIỆN
                  </label>
                  <input
                    type="text"
                    placeholder="https://... (để trống = xóa ảnh)"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all"
                  />
                </div>

                {/* Vai trò */}
                {isEditMode && (
                  <div className="flex flex-col gap-admin-xs">
                    <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                      VAI TRÒ
                    </label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: Number(e.target.value) })}
                      className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all cursor-pointer"
                    >
                      {roles.length === 0 ? (
                        <option value={0} disabled>Đang tải vai trò…</option>
                      ) : (
                        roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))
                      )}
                    </select>
                    <span className="text-[11px] text-admin-on-surface-variant font-admin-sans">
                      ⚠️ Đổi vai trò sẽ chuyển user khỏi danh sách Customer
                    </span>
                  </div>
                )}

                {/* Trạng thái */}
                <div className="flex flex-col gap-admin-xs">
                  <label className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold">
                    TRẠNG THÁI
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="px-admin-md py-admin-sm bg-admin-surface-bright border border-admin-outline-variant/60 rounded-lg text-admin-body-md text-admin-on-surface focus:outline-none focus:border-admin-primary focus:ring-1 focus:ring-admin-primary transition-all cursor-pointer"
                  >
                    <option value="true">✅ Hoạt động (Active)</option>
                    <option value="false">🔒 Khóa (Locked)</option>
                  </select>
                </div>
              </div>

              {/* Khách sạn liên kết */}
              {isEditMode && hotels && hotels.length > 0 && (
                <div className="pt-admin-md border-t border-admin-outline-variant/30">
                  <h5 className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant font-bold mb-admin-md uppercase">
                    Khách sạn liên kết ({hotels.length})
                  </h5>
                  <div className="space-y-admin-sm">
                    {hotels.map((hotel: UserHotelDto) => (
                      <div
                        key={hotel.id}
                        className="flex items-center justify-between p-admin-md bg-admin-surface-container-low border border-admin-outline-variant/50 rounded-lg"
                      >
                        <div className="flex items-center gap-admin-md">
                          <span className="material-symbols-outlined text-admin-primary text-[20px]">hotel</span>
                          <div>
                            <p className="font-admin-sans text-admin-body-md font-bold text-admin-on-surface">
                              {hotel.name}
                            </p>
                            {hotel.address && (
                              <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                                {hotel.address}
                              </p>
                            )}
                          </div>
                        </div>
                        {hotel.starRating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: hotel.starRating }).map((_, i) => (
                              <span
                                key={i}
                                className="material-symbols-outlined text-[16px] text-[#F59E0B]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-admin-xl py-admin-lg border-t border-admin-outline-variant bg-admin-surface-container-low flex justify-end gap-admin-md select-none shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-admin-lg py-admin-sm border border-admin-outline-variant text-admin-on-surface-variant font-bold rounded-lg hover:bg-admin-surface-container transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="px-admin-lg py-admin-sm bg-admin-primary text-white font-bold rounded-lg hover:bg-admin-primary/90 transition-all flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Đang lưu...
              </>
            ) : isEditMode ? (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                Lưu thay đổi
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Tạo người dùng
              </>
            )}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
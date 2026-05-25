import { useCallback, useEffect, useState } from 'react';
import { userService } from '../../../services';
import type { UserDto } from '../../../types';

interface PartnerApplication {
  id: string;
  fullName: string;
  type: 'Stay' | 'Flight';
  time: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  icon: string;
}

export interface ActivePartner {
  id: string;
  fullName: string;
  type: 'Stay' | 'Flight';
  location: string;
  joined: string;
  revenue: string;
  active: boolean;
  initials: string;
  initialsBg: string;
  initialsText: string;
  totalRevenue: number;
}

export function AdminPartners() {
  const [activeTab, setActiveTab] = useState<'pending' | 'list'>('pending');
  const [partners, setPartners] = useState<UserDto[]>([]);
  const [applications, setApplications] = useState<any[]>([]); // Giả sử mày có API cho đơn đăng ký riêng
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Hàm fetch danh sách Partner từ API Backend
  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi hàm từ userService
      const result = await userService.getPartners({
        pageNumber: 1,
        pageSize: 10,
        roleName: 'Partner',
      });

      // result ở đây chính là PagedResult<UserDto>
      setPartners(result.items);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách partner:", error);
      // Mày có thể dùng toast để báo lỗi ở đây
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API khi chuyển sang tab 'list'
  useEffect(() => {
    if (activeTab === 'list') {
      loadPartners();
    }
  }, [activeTab, loadPartners]);

  // 3. Hàm xử lý Duyệt (Approve) - Gọi API Update Status
  // const handleApprove = async (id: string) => {
  //   try {
  //     // Giả sử mày có endpoint update trạng thái user/application
  //     await axios.put(`api/v1/users/partners/${id}/approve`);
  //     // Sau khi duyệt thành công, load lại danh sách hoặc cập nhật local state
  //     setApplications(prev => prev.filter(app => app.id !== id));
  //     fetchPartners(); // Refresh lại tab list
  //   } catch (error) {
  //     alert("Không thể duyệt đối tác này!");
  //   }
  // };

  // 4. Hàm xử lý Bật/Tắt trạng thái hoạt động (Toggle Active)
  const handleTogglePartner = async (id: number, currentStatus: boolean) => {
    try {
      await userService.toggleActive(id, !currentStatus);

      // Cập nhật lại UI local cho nhanh
      setPartners(prev =>
        prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (error) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  // ... (Phần Return JSX giữ nguyên như cũ, chỉ thay đổi phần map dữ liệu)

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-admin-xl space-y-admin-lg max-w-admin-container-max mx-auto w-full">
      {/* Statistics Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            TOTAL PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">1,284</span>
            <span className="text-xs text-admin-secondary font-bold">+12%</span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-tertiary-fixed-dim shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            PENDING APPROVAL
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {applications.filter(app => app.status === 'Pending').length}
            </span>
            <span className="text-xs text-admin-on-tertiary-fixed-variant font-bold">Urgent</span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-secondary-container shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            STAY PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {partners.filter(p => p.roleName === 'Partner').length + 853}
            </span>
          </div>
        </div>
        <div className="bg-white p-admin-lg border border-admin-outline-variant rounded-lg border-t-4 border-t-admin-primary shadow-sm">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-xs uppercase">
            FLIGHT PARTNERS
          </p>
          <div className="flex items-baseline gap-admin-sm">
            <span className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {partners.filter(p => p.roleName === 'Partner').length + 427}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-lg border border-admin-outline-variant shadow-sm overflow-hidden">
        <div className="flex border-b border-admin-outline-variant px-admin-lg bg-admin-surface-container-lowest select-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${activeTab === 'pending'
              ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
              : 'text-admin-on-surface-variant hover:text-admin-primary'
              }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-admin-xl py-admin-lg font-admin-sans text-admin-body-md transition-all ${activeTab === 'list'
              ? 'border-b-2 border-admin-primary text-admin-primary font-bold'
              : 'text-admin-on-surface-variant hover:text-admin-primary'
              }`}
          >
            Partner List
          </button>
        </div>

        {/* Tab 1: Pending Approval Content */}
        {activeTab === 'pending' && (
          <div className="p-admin-lg">
            <div className="space-y-admin-md">
              {applications.length > 0 ? (
                applications.map((app) => {
                  const isApproved = app.status === 'Approved';
                  const isRejected = app.status === 'Rejected';

                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-admin-lg border border-admin-outline-variant rounded-lg hover:shadow-md transition-all bg-white group"
                      style={{ opacity: isApproved || isRejected ? 0.6 : 1 }}
                    >
                      <div className="flex items-center gap-admin-lg">
                        <div className="w-16 h-16 rounded bg-admin-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-admin-secondary scale-125">
                            {app.icon}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-admin-sm">
                            <h3 className="font-admin-sans text-admin-body-lg font-bold text-admin-primary">
                              {app.name}
                            </h3>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${app.type === 'Stay' ? 'bg-admin-surface-variant text-admin-on-surface' : 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant'
                              }`}>
                              {app.type}
                            </span>
                          </div>
                          <p className="text-admin-body-sm text-admin-on-surface-variant mt-1 font-admin-sans">
                            Application ID: <span className="font-admin-mono">{app.id}</span> • {app.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-admin-md font-admin-sans select-none">
                        {app.status === 'Pending' ? (
                          <>
                            <button className="px-admin-md py-admin-sm font-body-md font-bold text-admin-secondary hover:bg-admin-secondary-container/10 rounded transition-colors">
                              View Profile
                            </button>
                            <button
                              onClick={() => { }}
                              className="px-admin-md py-admin-sm bg-admin-primary text-white font-bold rounded hover:bg-admin-on-background transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { }}
                              className="px-admin-md py-admin-sm border border-error text-error font-bold rounded hover:bg-error-container transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`px-admin-lg py-admin-sm font-bold text-sm ${isApproved ? 'text-green-600' : 'text-error'
                            }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-admin-lg text-center text-admin-on-surface-variant font-admin-sans">
                  No applications pending approval.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Partner List Content */}
        {activeTab === 'list' && (
          <div className="p-0 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">PARTNER NAME</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">TYPE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">LOCATIONS</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">JOINED DATE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">REVENUE</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-center">STATUS</th>
                    <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-outline-variant">
                  {partners.map((partner) => (
                    <tr
                      key={partner.id}
                      className={`hover:bg-admin-surface-container-lowest transition-colors ${!partner.isActive ? 'opacity-75' : ''
                        }`}
                    >
                      <td className="px-admin-lg py-admin-lg">
                        <div className="flex items-center gap-admin-md">
                          <div className={`w-8 h-8 rounded-full ${partner.avatarUrl || 'bg-blue-100'} flex items-center justify-center ${partner.avatarUrl || 'text-blue-600'} font-bold text-xs`}>
                            {partner.avatarUrl}
                          </div>
                          <span className="font-admin-sans text-admin-body-md font-bold text-admin-primary">
                            {partner.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-admin-lg py-admin-lg">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wider ${partner.roleName === 'Stay Partner' ? 'bg-admin-surface-variant text-admin-on-surface' : 'bg-admin-secondary-fixed text-admin-on-secondary-fixed-variant'
                          }`}>
                          {partner.roleName}
                        </span>
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-sm text-admin-on-surface-variant">
                        {partner.phoneNumber}
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-mono text-xs text-admin-on-surface-variant">
                        {partner.createdAt?.split('T')[0]}
                      </td>
                      <td className="px-admin-lg py-admin-lg font-admin-sans text-admin-body-md font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(partner.totalRevenue || 0)}
                      </td>
                      <td className="px-admin-lg py-admin-lg">
                        <div className="flex items-center justify-center select-none">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={partner.isActive}
                              onChange={() => handleTogglePartner(partner.id, partner.isActive)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-admin-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-secondary"></div>
                          </label>
                        </div>
                      </td>
                      <td className="px-admin-lg py-admin-lg text-right">
                        <button className="p-2 text-admin-on-surface-variant hover:text-admin-secondary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Footer (Floating Style) */}
        <div className="flex justify-between items-center bg-white p-admin-lg border-t border-admin-outline-variant select-none">
          <div className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
            Showing <span className="font-bold text-admin-primary">
              1 - {activeTab === 'pending' ? applications.length : partners.length}
            </span> of {activeTab === 'pending' ? `${applications.length} pending` : `${partners.length} total`} partners
          </div>
          <div className="flex items-center gap-admin-sm">
            <button className="p-2 hover:bg-admin-surface-container rounded-lg text-admin-on-surface-variant disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-1 font-admin-sans">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-admin-secondary text-white font-bold text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-admin-surface-container text-admin-on-surface font-bold text-xs">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-admin-surface-container text-admin-on-surface font-bold text-xs">3</button>
            </div>
            <button className="p-2 hover:bg-admin-surface-container rounded-lg text-admin-on-surface-variant">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

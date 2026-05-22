import { useState } from 'react';
import { UserModal, type UserRecord } from './UserModal';

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'USR-8821',
      name: 'Alex Rivera',
      email: 'arivera.explorer@gmail.com',
      phone: '+84 901 223 445',
      joined: 'Jan 2024',
      status: 'Active',
      role: 'Traveler',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArlEx4ssbvjLDy8LOPGOMEK3yAlcpXUZCin2XXbvLY7b76_wTVYcsXI7Z7JkLOm0v1wWyA_T8H5qoIV_X_YCtpogrP9NOtxz5NIM4kPTGs5PXzjqj9hCxce4r1uJbimu1Bqr0QOK2dMfDDFzXQOJBwCoUh2ekE2TdG5bZnENbMAWdtYMLEKJ0T-yUt1AtYAcyq-NoMfG5KDf-cHxBRkSuXAQhqHLGiPXL-R-FBlNkitPJqWiPZqjwSfrgb7uRV_NGhs-JKO2ik5WY',
    },
    {
      id: 'USR-7643',
      name: 'Elena Vance',
      email: 'elena.vance@workmail.io',
      phone: '+84 934 556 778',
      joined: 'Dec 2023',
      status: 'Locked',
      role: 'Traveler',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_Q-Igo_MKQJ3eVdEI03B_AS6bO5qRdJWMmZ1gae2S7S5NC3bsKPouX1Mo6jt2xTwSa2SdmyWzJal4MpxFzM9JW8FQ4TrOqB64OHdwPH1S4W_jIyNQBGVwsgFMzTa39VVu_OxIRzRj0W7o3cevnL3HRhccUHkBa6dlXsIUn3vW7wtgmnbMPMDaNT_FFyrUHraucVjA43TXMGTy3Y3QlGpXw57BQichOupkgfjahBKnkdjifVa_g-RVuDF-4krGOZ_7u2L0YYd0xMU',
    },
    {
      id: 'USR-9004',
      name: 'Marcus Bennett',
      email: 'm.bennett@traveler.com',
      phone: '+84 902 111 222',
      joined: 'Feb 2024',
      status: 'Active',
      role: 'Traveler',
      initials: 'MB',
    },
    {
      id: 'USR-8120',
      name: 'Sarah Connor',
      email: 's.connor@future.net',
      phone: '+84 988 776 554',
      joined: 'Jan 2024',
      status: 'Active',
      role: 'Admin',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5Akr_xwijSns2d8z95Vy8enOzX2dB4wZ0DVIWaEp7A1D_wfKSZiruWs4UL5NXA1_ojt_NGxWx9zGM9Hz3iXnTPWPcDLkSlL6gViMIA9f5SoAwbpe3u8poulz-VjnMR3irz_opd_4hU5BRbpqUYhReWcA2kxEsWgMnIOgArpSM19Fq_R5Grl5kmJoO6NxE9oosqvT50noeOZ3jlVjnsbULwHzIcy855aK6lBVlzsjNRy5tlXtxU_J7odNnkAf7ypMUeepU_V7ZHG8',
    },
  ]);

  const handleToggleStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          return { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserRecord) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<UserRecord>) => {
    if (modalMode === 'create') {
      const newUser: UserRecord = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        status: userData.status || 'Active',
        role: userData.role || 'Traveler',
        avatarUrl: userData.avatarUrl || undefined,
        initials: !userData.avatarUrl ? getInitials(userData.name || '') : undefined,
      };
      setUsers(prev => [newUser, ...prev]);
    } else if (modalMode === 'edit' && selectedUser) {
      setUsers(prev =>
        prev.map(u => {
          if (u.id === selectedUser.id) {
            const updatedInitials = !userData.avatarUrl ? getInitials(userData.name || '') : undefined;
            return {
              ...u,
              ...userData,
              initials: updatedInitials,
            };
          }
          return u;
        })
      );
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-admin-xl space-y-admin-xl max-w-admin-container-max mx-auto w-full">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-admin-lg">
        <div>
          <h3 className="font-admin-sans text-admin-display-lg text-admin-primary mb-admin-xs">
            Customer Directory
          </h3>
          <p className="text-admin-on-surface-variant font-admin-sans text-admin-body-md">
            Manage and monitor verified traveler accounts across the platform.
          </p>
        </div>
        <div className="flex items-center gap-admin-md select-none">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-admin-sm px-admin-lg py-admin-sm bg-admin-primary-container text-admin-on-primary border border-admin-primary-container hover:bg-admin-primary transition-all duration-200 rounded-lg shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Add New User</span>
          </button>
          <button className="flex items-center gap-admin-sm px-admin-md py-admin-sm bg-admin-surface-container-lowest text-admin-on-surface border border-admin-outline-variant hover:border-admin-primary transition-all duration-200 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span className="font-admin-sans text-admin-body-md font-bold">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bento Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-admin-lg select-none">
        <div className="bg-white border-l-4 border-[#002B5B] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            TOTAL USERS
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">{users.length + 12838}</h4>
            <span className="text-admin-secondary text-[12px] font-bold mb-1">+4.2%</span>
          </div>
        </div>
        <div className="bg-white border-l-4 border-[#10B981] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            ACTIVE NOW
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {users.filter(u => u.status === 'Active').length + 838}
            </h4>
            <span className="text-[#10B981] text-[12px] font-bold mb-1">Live</span>
          </div>
        </div>
        <div className="bg-white border-l-4 border-[#F59E0B] p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            LOCKED ACCOUNTS
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">
              {users.filter(u => u.status === 'Locked').length + 30}
            </h4>
            <span className="text-admin-on-surface-variant text-[12px] font-bold mb-1">-2.1%</span>
          </div>
        </div>
        <div className="bg-white border-l-4 border-admin-primary p-admin-lg border-t border-r border-b border-admin-outline-variant shadow-sm rounded-r-lg">
          <p className="font-admin-sans text-admin-label-caps text-admin-on-surface-variant mb-admin-base uppercase">
            NEW THIS WEEK
          </p>
          <div className="flex items-end gap-admin-sm">
            <h4 className="font-admin-sans text-admin-headline-md font-bold text-admin-primary">156</h4>
            <span className="text-admin-secondary text-[12px] font-bold mb-1">Steady</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-admin-outline-variant rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        {/* Table Filters */}
        <div className="p-admin-md bg-admin-surface-bright border-b border-admin-outline-variant flex flex-wrap items-center justify-between gap-admin-md">
          <div className="flex items-center gap-admin-md flex-grow">
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-admin-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-admin-md py-admin-sm bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm focus:ring-1 focus:ring-admin-secondary focus:outline-none text-admin-on-surface"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-admin-outline-variant rounded-lg text-admin-body-sm py-admin-sm px-admin-md focus:outline-none text-admin-on-surface"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>
          </div>
          <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
            Showing <span className="font-bold text-admin-primary">{filteredUsers.length}</span> of <span className="font-bold text-admin-primary">{users.length}</span> users
          </p>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-admin-surface-container-low border-b border-admin-outline-variant select-none">
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">ID</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">User</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Contact info</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase">Status</th>
                <th className="px-admin-lg py-admin-md font-admin-sans text-admin-label-caps text-admin-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-outline-variant/30">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-admin-surface-container-low transition-colors group">
                    <td className="px-admin-lg py-admin-md font-admin-mono text-admin-data-mono text-admin-on-surface-variant">
                      {user.id}
                    </td>
                    <td className="px-admin-lg py-admin-md">
                      <div className="flex items-center gap-admin-md">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className={`w-10 h-10 rounded-full border border-admin-outline-variant object-cover shadow-sm ${user.status === 'Locked' ? 'grayscale opacity-80' : ''
                              }`}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-admin-primary-container flex items-center justify-center text-admin-on-primary font-bold text-sm">
                            {user.initials}
                          </div>
                        )}
                        <div>
                          <p className={`font-admin-sans text-admin-body-md font-bold ${user.status === 'Locked' ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'
                            }`}>
                            {user.name}
                          </p>
                          <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                            Joined {user.joined}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-admin-lg py-admin-md">
                      <p className={`font-admin-sans text-admin-body-md ${user.status === 'Locked' ? 'text-admin-on-surface-variant' : 'text-admin-on-surface'
                        }`}>
                        {user.email}
                      </p>
                      <p className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">
                        {user.phone}
                      </p>
                    </td>
                    <td className="px-admin-lg py-admin-md">
                      {user.status === 'Active' ? (
                        <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold border border-green-200 uppercase tracking-wider font-admin-sans">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-admin-xs px-admin-sm py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold border border-error/20 uppercase tracking-wider font-admin-sans">
                          <span className="w-1.5 h-1.5 bg-error rounded-full"></span>
                          Locked
                        </span>
                      )}
                    </td>
                    <td className="px-admin-lg py-admin-md">
                      <div className="flex justify-end gap-admin-sm opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1 hover:bg-admin-surface-container-high rounded-lg text-admin-primary transition-colors"
                          title="Edit Profile"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-1 hover:bg-admin-surface-container-high rounded-lg transition-colors ${user.status === 'Active' ? 'text-admin-on-surface-variant' : 'text-error'
                            }`}
                          title={user.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{ fontVariationSettings: user.status === 'Locked' ? "'FILL' 1" : undefined }}
                          >
                            {user.status === 'Active' ? 'lock_open' : 'lock'}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 hover:bg-error-container hover:text-error rounded-lg text-admin-on-surface-variant transition-colors"
                          title="Delete User"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-admin-lg py-admin-xl text-center text-admin-on-surface-variant font-admin-sans">
                    No travelers matched your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-admin-xl py-admin-md bg-admin-surface-bright border-t border-admin-outline-variant flex items-center justify-between select-none">
          <div className="flex items-center gap-admin-md">
            <span className="text-admin-body-sm text-admin-on-surface-variant font-admin-sans">Rows per page:</span>
            <select className="bg-transparent border-none text-admin-body-sm font-bold focus:ring-0 cursor-pointer text-admin-primary">
              <option>15</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>
          <div className="flex items-center gap-admin-sm">
            <button
              className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
              disabled
            >
              <span className="material-symbols-outlined">first_page</span>
            </button>
            <button
              className="p-1 rounded-lg hover:bg-admin-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-admin-primary"
              disabled
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center px-admin-md font-admin-sans">
              <span className="text-admin-body-sm font-bold text-admin-primary">1</span>
              <span className="text-admin-body-sm text-admin-on-surface-variant px-admin-md">/</span>
              <span className="text-admin-body-sm text-admin-on-surface-variant">856</span>
            </div>
            <button className="p-1 rounded-lg hover:bg-admin-surface-container-high transition-colors text-admin-primary">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button className="p-1 rounded-lg hover:bg-admin-surface-container-high transition-colors text-admin-primary">
              <span className="material-symbols-outlined">last_page</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Governance Card */}
      <div className="bg-admin-primary-container p-admin-xl rounded-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-admin-xl">
          <div className="max-w-xl">
            <h4 className="font-admin-sans text-admin-headline-sm text-admin-on-primary mb-admin-sm">
              Automated Governance Active
            </h4>
            <p className="text-admin-on-primary-container text-admin-body-md opacity-90 leading-relaxed font-admin-sans">
              The WanderVN system is currently monitoring user behavior patterns. 3 active alerts regarding suspicious login attempts are being investigated. You can review automated locks in the Security Dashboard.
            </p>
          </div>
          <button className="px-admin-xl py-admin-md bg-white text-admin-primary font-bold rounded-lg shadow-xl hover:bg-admin-surface-bright transition-all whitespace-nowrap font-admin-sans">
            Review Security Alerts
          </button>
        </div>
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* User modal popup */}
      <UserModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
}

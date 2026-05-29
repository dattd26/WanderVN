import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  Clock, 
  Percent, 
  RefreshCw, 
  Info
} from 'lucide-react';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { PartnerSidebar } from '../../components/partner/PartnerSidebar';

// Định nghĩa Interface dòng đối soát
interface PayoutRecord {
  id: string;
  period: string;
  grossAmount: number;
  commissionFee: number;
  netPayout: number;
  status: 'Paid' | 'Processing';
  paidDate: string;
}

export const PartnerFinance: React.FC = () => {
  const [reconciling, setReconciling] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // State quản lý số liệu tài chính để có thể thay đổi động khi đối soát xong
  const [financials, setFinancials] = useState({
    totalRevenue: 145200000,
    pendingPayout: 32500000,
    lastPayoutDate: '01/11/2024',
    commissionRate: 10
  });

  // Dữ liệu Lịch sử đối soát chi tiết
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    { id: 'RC-9048', period: '16/10/2024 - 31/10/2024', grossAmount: 48000000, commissionFee: 4800000, netPayout: 43200000, status: 'Paid', paidDate: '01/11/2024' },
    { id: 'RC-8492', period: '01/10/2024 - 15/10/2024', grossAmount: 52000000, commissionFee: 5200000, netPayout: 46800000, status: 'Paid', paidDate: '16/10/2024' },
    { id: 'RC-7938', period: '16/09/2024 - 30/09/2024', grossAmount: 45200000, commissionFee: 4520000, netPayout: 40680000, status: 'Paid', paidDate: '01/10/2024' }
  ]);

  // Dữ liệu biểu đồ Doanh thu (6 tháng gần đây)
  const chartData = [
    { month: 'Tháng 12', revenue: 38000000, fee: 3800000, net: 34200000 },
    { month: 'Tháng 1', revenue: 42000000, fee: 4200000, net: 37800000 },
    { month: 'Tháng 2', revenue: 49000000, fee: 4900000, net: 44100000 },
    { month: 'Tháng 3', revenue: 45200000, fee: 4520000, net: 40680000 },
    { month: 'Tháng 4', revenue: 52000000, fee: 5200000, net: 46800000 },
    { month: 'Tháng 5', revenue: 48000000, fee: 4800000, net: 43200000 }
  ];

  // State lưu trữ cột biểu đồ được chọn khi hover xem tooltip
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Yêu cầu đối soát nhanh (Giả lập chu kỳ đối soát thực tế)
  const handleRequestReconciliation = () => {
    if (financials.pendingPayout === 0) return;
    
    setReconciling(true);
    setTimeout(() => {
      const today = new Date();
      const formattedToday = today.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Tạo dòng đối soát mới từ số tiền đang chờ
      const newGross = financials.pendingPayout;
      const newFee = newGross * (financials.commissionRate / 100);
      const newNet = newGross - newFee;

      const newRecord: PayoutRecord = {
        id: `RC-${Math.floor(1000 + Math.random() * 9000)}`,
        period: '01/11/2024 - 15/11/2024',
        grossAmount: newGross,
        commissionFee: newFee,
        netPayout: newNet,
        status: 'Processing',
        paidDate: 'Đang xử lý ngân hàng'
      };

      setPayouts(prev => [newRecord, ...prev]);
      setFinancials(prev => ({
        ...prev,
        totalRevenue: prev.totalRevenue + newGross,
        pendingPayout: 0,
        lastPayoutDate: formattedToday
      }));

      setReconciling(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4500);
    }, 2000);
  };

  // Trình dựng receipt giả lập để đối tác có thể tải báo cáo PDF/Excel
  const handleDownloadReceipt = (payoutId: string) => {
    alert(`Đang khởi tạo tải xuống chứng từ đối soát giao dịch ${payoutId} phong cách di sản... Báo cáo tài chính chi tiết dạng PDF đã được lưu về máy.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-body-md text-[#1C1C19] relative">
      
      {/* Sidebar cố định phía bên trái */}
      <PartnerSidebar hotelName="Hanoi Boutique Hotel" />

      {/* Vùng nội dung quản trị tài chính bên phải */}
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Header trên cùng dành riêng cho Partner */}
        <PartnerHeader exitTo="/" />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-margin-mobile md:px-gutter py-10 md:py-12 space-y-8 z-10 animate-fade-up">
          
          {/* Tiêu đề & Action bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-5 border-b border-[#E6E2DD]">
            <div className="space-y-1.5">
              <h1 className="font-display-lg text-headline-lg text-[#1C1C19] flex items-center gap-3">
                Tài chính &amp; Đối soát
                <span className="font-label-md text-[10px] bg-[#735C00]/10 text-[#735C00] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Bản kê minh bạch
                </span>
              </h1>
              <p className="font-body-md text-[#444748] text-sm max-w-xl">
                Kiểm soát dòng tiền, theo dõi doanh thu thực nhận, chiết khấu hoa hồng của hệ thống và lập yêu cầu đối soát số tiền tích lũy định kỳ.
              </p>
            </div>
            
            {/* Manual Reconciliation Trigger */}
            <button
              onClick={handleRequestReconciliation}
              disabled={reconciling || financials.pendingPayout === 0}
              className={`font-label-md text-xs uppercase tracking-widest px-5 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 font-bold ${
                financials.pendingPayout === 0
                  ? 'bg-[#E6E2DD] text-[#444748]/55 cursor-not-allowed border border-[#E6E2DD]'
                  : 'bg-[#1C1C19] text-[#FAF6F0] hover:bg-[#735C00] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {reconciling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#B59A5A]" />
                  Đang lập yêu cầu...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 text-[#B59A5A]" />
                  Yêu cầu đối soát ngay
                </>
              )}
            </button>
          </div>

          {/* Toast Notification */}
          {showSuccessToast && (
            <div className="fixed top-20 right-8 z-50 flex items-center gap-3 bg-[#EBF7EE] text-[#1E5C2F] border border-[#A7E2B7] px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 transform scale-100">
              <CheckCircle2 className="h-5.5 w-5.5 text-[#1E5C2F] shrink-0" />
              <div>
                <p className="font-label-md text-xs font-bold tracking-wide uppercase">Yêu cầu đối soát thành công!</p>
                <p className="font-body-md text-[10px] text-[#1E5C2F]/90 mt-0.5">Số tiền đối soát đang được chuyển tới ngân hàng liên kết.</p>
              </div>
            </div>
          )}

          {/* Financial Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Tổng doanh thu */}
            <div className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="p-4 rounded-xl bg-[#735C00]/10 text-[#735C00]">
                <TrendingUp className="h-6.5 w-6.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Tổng doanh thu lũy kế</span>
                <div className="font-mono text-2xl font-bold text-[#1C1C19] truncate">₫{financials.totalRevenue.toLocaleString('vi-VN')}</div>
                <span className="text-[10px] text-green-700 flex items-center gap-0.5 font-bold">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +12.4% so với tháng trước
                </span>
              </div>
            </div>

            {/* Card 2: Đang chờ thanh toán */}
            <div className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-[#B59A5A]/15 px-3 py-1 rounded-bl-lg font-label-md text-[9px] uppercase tracking-widest font-bold text-[#735C00]">
                Tích lũy hiện tại
              </div>
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E6E2DD] text-[#735C00] shadow-inner">
                <Wallet className="h-6.5 w-6.5 text-[#735C00]" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Chờ thanh toán đối soát</span>
                <div className="font-mono text-2xl font-bold text-[#735C00] truncate">₫{financials.pendingPayout.toLocaleString('vi-VN')}</div>
                <span className="text-[10px] text-[#444748] flex items-center gap-1.5 font-semibold">
                  <Clock className="h-3.5 w-3.5 text-[#B59A5A]" />
                  Chiết khấu hoa hồng hệ thống: {financials.commissionRate}%
                </span>
              </div>
            </div>

            {/* Card 3: Lần đối soát gần nhất */}
            <div className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform duration-300 hover:translate-y-[-2px]">
              <div className="p-4 rounded-xl bg-[#EBF7EE] text-[#1E5C2F] border border-[#A7E2B7]">
                <CheckCircle2 className="h-6.5 w-6.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Đợt thanh toán gần nhất</span>
                <div className="font-mono text-lg font-bold text-[#1C1C19]">{financials.lastPayoutDate}</div>
                <span className="text-[10px] text-[#1E5C2F] font-bold uppercase tracking-wider bg-[#EBF7EE] px-2 py-0.5 rounded inline-block mt-0.5 border border-[#A7E2B7]">
                  Đã chuyển khoản
                </span>
              </div>
            </div>

          </section>

          {/* Interactive Payouts SVG/CSS Chart & Commission Details */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Cột Trái (Biểu đồ doanh thu - 8/12) */}
            <div className="col-span-12 lg:col-span-8 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-6 shadow-sm flex flex-col justify-between">
              
              <div className="flex justify-between items-center border-b border-[#E6E2DD]/60 pb-3 mb-6">
                <div>
                  <h3 className="font-display-lg text-md text-[#1C1C19] font-bold">Biến động Doanh thu đối soát</h3>
                  <p className="font-body-md text-[#444748] text-xs">Biểu đồ thể hiện chi tiết doanh thu gộp (Gross) và thực nhận (Net) 6 tháng qua.</p>
                </div>
                <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold bg-[#F1EDE8] px-2.5 py-1 rounded border border-[#E6E2DD]">
                  Đơn vị: VNĐ
                </span>
              </div>

              {/* Chart visualization */}
              <div className="relative w-full h-[220px] flex items-end justify-between pt-6 px-4">
                
                {/* Y-axis helper lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none text-[10px] text-[#444748]/55 font-mono">
                  <div className="border-b border-[#E6E2DD]/40 w-full pt-1">50M</div>
                  <div className="border-b border-[#E6E2DD]/40 w-full pt-1">30M</div>
                  <div className="border-b border-[#E6E2DD]/40 w-full pt-1">10M</div>
                  <div className="border-b border-[#E6E2DD]/20 w-full">0M</div>
                </div>

                {/* Bars */}
                {chartData.map((d, index) => {
                  const maxVal = 60000000;
                  const grossHeight = (d.revenue / maxVal) * 100;
                  const netHeight = (d.net / maxVal) * 100;
                  const isHovered = hoveredBarIndex === index;

                  return (
                    <div 
                      key={index} 
                      className="flex-grow flex flex-col items-center justify-end relative h-full group px-2 cursor-pointer z-10"
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Dual Bar (Gross / Net) */}
                      <div className="flex items-end gap-1.5 w-full max-w-[48px] h-full justify-center relative">
                        {/* Gross Revenue bar */}
                        <div 
                          className="w-4.5 bg-[#FAF6F0] border border-[#E6E2DD] group-hover:border-[#735C00] transition-all rounded-t duration-500" 
                          style={{ height: `${grossHeight}%` }}
                        />
                        {/* Net Revenue bar */}
                        <div 
                          className="w-4.5 bg-[#735C00] group-hover:bg-[#1C1C19] transition-all rounded-t duration-500 shadow-sm" 
                          style={{ height: `${netHeight}%` }}
                        />
                      </div>

                      {/* X-axis label */}
                      <span className="font-label-md text-[10px] text-[#444748] mt-3 font-semibold">{d.month}</span>

                      {/* Custom premium tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-[230px] z-50 bg-[#1C1C19] text-[#FAF6F0] p-3 rounded-lg shadow-xl border border-[#B59A5A]/30 w-[180px] pointer-events-none text-left space-y-1.5 animate-fade-up">
                          <h5 className="font-label-md text-[10px] uppercase font-bold text-[#B59A5A] border-b border-[#FAF6F0]/20 pb-1">{d.month}</h5>
                          <div className="text-[10px] font-mono flex justify-between">
                            <span>Doanh thu gộp:</span>
                            <span className="font-bold">₫{d.revenue.toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="text-[10px] font-mono flex justify-between text-yellow-500">
                            <span>Hoa hồng hệ thống:</span>
                            <span className="font-bold">-₫{d.fee.toLocaleString('vi-VN')}</span>
                          </div>
                          <div className="text-[10.5px] font-mono flex justify-between border-t border-[#FAF6F0]/15 pt-1 text-green-400 font-bold">
                            <span>Thực tế thực nhận:</span>
                            <span>₫{d.net.toLocaleString('vi-VN')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Cột Phải (Chi tiết điều khoản & phân tích - 4/12) */}
            <div className="col-span-12 lg:col-span-4 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-6 shadow-sm flex flex-col justify-between">
              
              <div className="space-y-4">
                <h3 className="font-display-lg text-md text-[#1C1C19] border-b border-[#E6E2DD]/60 pb-2.5 flex items-center gap-2 font-bold">
                  <Percent className="h-4.5 w-4.5 text-[#735C00]" />
                  Biểu phí &amp; Chiết khấu
                </h3>
                
                <div className="space-y-4 font-body-md text-xs text-[#444748]">
                  <p className="leading-relaxed">
                    Hệ thống WanderVN áp dụng mức phí hoa hồng cố định cực tốt cho đối tác di sản lưu trú:
                  </p>
                  
                  <div className="bg-[#F1EDE8] p-4 rounded-xl border border-[#E6E2DD] space-y-2">
                    <div className="flex justify-between items-center border-b border-[#E6E2DD]/60 pb-1.5">
                      <span className="font-bold text-[#1C1C19]">Mức chiết khấu hoa hồng</span>
                      <strong className="text-xl text-[#735C00] font-mono font-bold">10%</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span>Phí duy trì cổng quản trị</span>
                      <span className="text-[#1C1C19] font-semibold">Miễn phí trọn đời</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>Phí tạo cổng thanh toán</span>
                      <span className="text-[#1C1C19] font-semibold">Đã bao gồm trong 10%</span>
                    </div>
                  </div>

                  <div className="flex gap-2.5 bg-[#735C00]/5 p-3 rounded-lg border border-[#735C00]/20 text-[11px]">
                    <Info className="h-4.5 w-4.5 text-[#735C00] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Lưu ý:</strong> Chu kỳ đối soát mặc định được tính tự động từ ngày <strong>1 đến 15</strong> và ngày <strong>16 đến cuối tháng</strong>. Khoản thực nhận sẽ được chuyển khoản trực tiếp sau 24 giờ hoàn tất đối soát.
                    </p>
                  </div>
                </div>
              </div>

              <a 
                href="#"
                className="mt-6 font-label-md text-[10px] uppercase tracking-widest text-[#735C00] hover:text-[#1C1C19] font-bold flex items-center gap-1 self-start transition-colors"
              >
                Xem thỏa thuận hợp tác di sản <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

            </div>

          </div>

          {/* Reconciliation History Section */}
          <section className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl shadow-sm overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0] flex justify-between items-center">
              <div>
                <h3 className="font-display-lg text-md text-[#1C1C19] font-bold">Lịch sử Đối soát &amp; Thanh toán</h3>
                <p className="font-body-md text-[#444748] text-xs">Danh sách các khoản đối soát tài chính định kỳ được minh bạch hóa từ hệ thống.</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body-md text-xs">
                <thead>
                  <tr className="bg-[#F1EDE8] border-b border-[#E6E2DD]">
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Mã đối soát</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Chu kỳ thanh toán</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Doanh thu gộp</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Phí hoa hồng (10%)</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Thực nhận chuyển khoản</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Trạng thái</th>
                    <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold text-center">Chứng từ</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((record) => {
                    const isPaid = record.status === 'Paid';
                    return (
                      <tr key={record.id} className="border-b border-[#E6E2DD]/40 hover:bg-[#F1EDE8]/30">
                        <td className="p-4 font-mono font-bold text-[#735C00]">{record.id}</td>
                        <td className="p-4 text-[#1C1C19] font-semibold">{record.period}</td>
                        <td className="p-4 font-mono text-[#444748]">₫{record.grossAmount.toLocaleString('vi-VN')}</td>
                        <td className="p-4 font-mono text-red-700">-₫{record.commissionFee.toLocaleString('vi-VN')}</td>
                        <td className="p-4 font-mono font-bold text-[#1C1C19]">₫{record.netPayout.toLocaleString('vi-VN')}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPaid 
                              ? 'bg-[#EBF7EE] text-[#1E5C2F]' 
                              : 'bg-[#FEF9EC] text-[#8F6B00] border border-[#FBE3A4]'
                          }`}>
                            {isPaid ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-[#1E5C2F]" />
                                Đã chuyển khoản
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 text-[#8F6B00] animate-pulse" />
                                Đang xử lý
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDownloadReceipt(record.id)}
                            className="font-label-md text-[9px] uppercase tracking-widest text-[#735C00] hover:text-[#1C1C19] font-bold flex items-center justify-center gap-1.5 mx-auto border border-[#E6E2DD] px-3 py-1.5 rounded bg-[#FAF6F0] hover:bg-[#F1EDE8] transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Tải chứng từ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </section>

        </main>

        {/* Lớp phủ họa tiết thạch anh di sản thô mộc */}
        <div className="texture-overlay" />
      </div>

    </div>
  );
};

export default PartnerFinance;

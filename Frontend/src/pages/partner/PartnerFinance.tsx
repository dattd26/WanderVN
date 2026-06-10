import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Percent,
  RefreshCw,
  Banknote,
  ChevronDown,
  ChevronRight,
  Landmark,
  FileText
} from 'lucide-react';
import { PartnerHeader } from '../../components/partner/PartnerHeader';
import { PartnerSidebar } from '../../components/partner/PartnerSidebar';
import { payoutService } from '../../services/payoutService';
import type { PartnerPayoutSummaryDto, PayoutDto, PartnerBatchDto, PayoutStatus } from '../../types';
import { PAYOUT_STATUS_LABEL } from '../../types';
import { UpdateBankInfoModal } from '../../components/partner/UpdateBankInfoModal';

export const PartnerFinance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PartnerPayoutSummaryDto | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<PayoutDto[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<PayoutStatus | ''>('');
  const [transPage, setTransPage] = useState(1);
  const [transTotal, setTransTotal] = useState(0);

  const [batches, setBatches] = useState<PartnerBatchDto[]>([]);
  const [batchPage] = useState(1);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await payoutService.getPartnerSummary();
      setSummary(res);
    } catch (error) {
      console.error('Failed to fetch summary', error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await payoutService.getPartnerTransactions({
        status: transactionStatus,
        pageNumber: transPage,
        pageSize: 15
      });
      setTransactions(res.items);
      setTransTotal(res.totalItems);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  }, [transactionStatus, transPage]);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await payoutService.getPartnerBatches({
        pageNumber: batchPage,
        pageSize: 10
      });
      setBatches(res.items);
    } catch (error) {
      console.error('Failed to fetch batches', error);
    }
  }, [batchPage]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTransactions(), fetchBatches()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchSummary, fetchTransactions, fetchBatches]);

  const toggleBatch = (id: number) => {
    if (expandedBatchId === id) setExpandedBatchId(null);
    else setExpandedBatchId(id);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex font-body-md text-[#1C1C19] relative">
      <PartnerSidebar />
      <div className="flex-grow flex flex-col min-h-screen relative overflow-x-hidden">
        <PartnerHeader exitTo="/" />

        <main className="flex-1 w-full max-w-[1240px] mx-auto px-margin-mobile md:px-gutter py-10 space-y-10 z-10 animate-fade-up">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 pb-5 border-b border-[#E6E2DD]">
            <div>
              <h1 className="font-display-lg text-headline-lg text-[#1C1C19] flex items-center gap-3">
                Doanh thu &amp; Chi trả
              </h1>
              <p className="font-body-md text-[#444748] text-sm max-w-xl mt-1">
                Kiểm soát dòng tiền, theo dõi doanh thu thực nhận, phí hoa hồng và lịch sử các đợt đối soát.
              </p>
            </div>
            {summary && (
              <div className="flex items-center gap-3 bg-[#1C1C19] text-[#FAF6F0] px-4 py-2.5 rounded-lg shadow-md">
                <Percent className="h-4.5 w-4.5 text-[#B59A5A]" />
                <span className="font-label-md text-xs tracking-wider uppercase font-bold">Hoa hồng hiện tại: {summary.commissionRate * 100}%</span>
              </div>
            )}
          </div>

          {loading && !summary ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-6 w-6 text-[#735C00] animate-spin" />
            </div>
          ) : (
            <>
              {/* SECTION 1: Summary Cards */}
              {summary && (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Hàng trên lớn */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-5 shadow-sm flex items-center gap-5 transition-transform hover:translate-y-[-2px]">
                    <div className="p-3 rounded-xl bg-[#735C00]/10 text-[#735C00]">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Tổng doanh thu gộp</span>
                      <div className="font-mono text-2xl font-bold text-[#1C1C19]">₫{summary.grossTotal.toLocaleString('vi-VN')}</div>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#1C1C19] text-[#FAF6F0] rounded-xl p-5 shadow-md flex items-center gap-5 transition-transform hover:translate-y-[-2px]">
                    <div className="p-3 rounded-xl bg-[#FAF6F0]/10 text-[#B59A5A]">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-label-md text-[10px] uppercase tracking-wider text-[#FAF6F0]/70 font-bold block">Tổng thực nhận</span>
                      <div className="font-mono text-2xl font-bold text-[#B59A5A]">₫{summary.netTotal.toLocaleString('vi-VN')}</div>
                    </div>
                  </div>

                  {/* Hàng dưới nhỏ */}
                  <div className="col-span-1 md:col-span-2 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-5 shadow-sm">
                    <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Đã chi trả tháng này</span>
                    <div className="font-mono text-xl font-bold text-green-700 mt-1">₫{summary.paidThisMonth.toLocaleString('vi-VN')}</div>
                  </div>

                  <div className="col-span-1 md:col-span-2 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#B59A5A]/15 px-2 py-0.5 rounded-bl font-label-md text-[8px] uppercase tracking-widest text-[#735C00] font-bold">Chờ xử lý</div>
                    <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Số dư chờ chi trả</span>
                    <div className="font-mono text-xl font-bold text-[#735C00] mt-1">₫{summary.pendingBalance.toLocaleString('vi-VN')}</div>
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl p-5 shadow-sm">
                    <span className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold block">Tổng hoa hồng ({summary.commissionRate * 100}%)</span>
                    <div className="font-mono text-xl font-bold text-red-700 mt-1">-₫{summary.commissionTotal.toLocaleString('vi-VN')}</div>
                  </div>
                </section>
              )}

              {/* SECTION 2: Transactions by Booking */}
              <section className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E6E2DD] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-display-lg text-md text-[#1C1C19] font-bold">Giao dịch theo Đặt phòng</h3>
                    <p className="font-body-md text-[#444748] text-xs">Chi tiết từng khoản mục trước khi gom thành đợt thanh toán.</p>
                  </div>

                  {/* Status Filters */}
                  <div className="flex flex-wrap gap-2">
                    {['', 'Pending', 'Processing', 'Paid', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => { setTransactionStatus(st as PayoutStatus | ''); setTransPage(1); }}
                        className={`px-3 py-1.5 rounded-full font-label-md text-[10px] uppercase tracking-wider border transition-colors ${transactionStatus === st
                          ? 'bg-[#1C1C19] text-[#FAF6F0] border-[#1C1C19]'
                          : 'bg-transparent text-[#444748] border-[#E6E2DD] hover:bg-[#F1EDE8]'
                          }`}
                      >
                        {st === '' ? 'Tất cả' : PAYOUT_STATUS_LABEL[st as PayoutStatus]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-body-md text-xs">
                    <thead>
                      <tr className="bg-[#F1EDE8] border-b border-[#E6E2DD]">
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Mã Đặt Phòng</th>
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold">Ngày tạo</th>
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold text-right">Tổng tiền</th>
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold text-right">Hoa hồng</th>
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold text-right">Thực nhận</th>
                        <th className="p-4 font-label-md text-[10px] uppercase tracking-wider text-[#1C1C19] font-bold text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-[#E6E2DD]/40 hover:bg-[#F1EDE8]/30">
                          <td className="p-4 font-mono font-bold text-[#735C00]">{t.bookingCode}</td>
                          <td className="p-4 text-[#444748]">{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td className="p-4 font-mono text-[#444748] text-right">₫{t.grossAmount.toLocaleString('vi-VN')}</td>
                          <td className="p-4 font-mono text-red-700 text-right">-₫{t.commissionAmount.toLocaleString('vi-VN')}</td>
                          <td className="p-4 font-mono font-bold text-[#1C1C19] text-right">₫{t.netAmount.toLocaleString('vi-VN')}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.status === 'Paid' ? 'bg-[#EBF7EE] text-[#1E5C2F]' :
                              t.status === 'Pending' ? 'bg-[#FEF9EC] text-[#8F6B00]' :
                                t.status === 'Processing' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                                  'bg-[#FEE2E2] text-[#991B1B]'
                              }`}>
                              {PAYOUT_STATUS_LABEL[t.status as PayoutStatus] || t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#444748]">Không có giao dịch nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Simplified */}
                {transTotal > 15 && (
                  <div className="p-4 border-t border-[#E6E2DD] flex justify-center gap-4">
                    <button
                      disabled={transPage === 1}
                      onClick={() => setTransPage(p => p - 1)}
                      className="text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <span className="text-xs text-[#444748]">Trang {transPage}</span>
                    <button
                      disabled={transPage * 15 >= transTotal}
                      onClick={() => setTransPage(p => p + 1)}
                      className="text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </section>

              {/* SECTION 3: Payout Batches (Accordion) */}
              <section className="bg-[#FAF6F0] border border-[#E6E2DD] rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E6E2DD] bg-[#FAF6F0]">
                  <h3 className="font-display-lg text-md text-[#1C1C19] font-bold">Lịch sử Đợt Chi Trả (Batches)</h3>
                  <p className="font-body-md text-[#444748] text-xs">Các booking được hệ thống gom lại thành từng đợt để thanh toán chuyển khoản.</p>
                </div>

                <div className="divide-y divide-[#E6E2DD]">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex flex-col">
                      {/* Batch Header Row */}
                      <div
                        onClick={() => toggleBatch(batch.id)}
                        className="flex items-center justify-between p-4 hover:bg-[#F1EDE8]/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <button className="p-1 rounded hover:bg-[#E6E2DD] text-[#735C00]">
                            {expandedBatchId === batch.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                          <div>
                            <div className="font-mono font-bold text-[#1C1C19]">{batch.batchCode}</div>
                            <div className="text-[11px] text-[#444748] mt-0.5">{batch.bookingCount} bookings &bull; {new Date(batch.createdAt).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg text-[#1C1C19]">₫{batch.totalNet.toLocaleString('vi-VN')}</div>
                            {batch.status === 'Paid' && batch.paidAt && (
                              <div className="text-[10px] text-green-700">Đã chi trả: {new Date(batch.paidAt).toLocaleDateString('vi-VN')}</div>
                            )}
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${batch.status === 'Paid' ? 'bg-[#EBF7EE] text-[#1E5C2F]' :
                            batch.status === 'Processing' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                              'bg-[#FEE2E2] text-[#991B1B]'
                            }`}>
                            {batch.status === 'Paid' ? 'Đã chi trả' : batch.status === 'Processing' ? 'Đang xử lý' : 'Đã hủy'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Content: Payouts List */}
                      {expandedBatchId === batch.id && batch.payouts && (
                        <div className="bg-[#F1EDE8]/30 p-4 pl-12 border-t border-[#E6E2DD]/50">
                          <h4 className="font-label-md text-[10px] uppercase tracking-wider text-[#444748] font-bold mb-3 flex items-center gap-2">
                            <FileText size={14} /> Chi tiết các khoản trong đợt
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {batch.payouts.map(p => (
                              <div key={p.id} className="bg-white border border-[#E6E2DD] p-3 rounded-lg shadow-sm flex justify-between items-center">
                                <span className="font-mono text-xs font-bold text-[#735C00]">{p.bookingCode}</span>
                                <span className="font-mono text-xs font-bold text-[#1C1C19]">₫{p.netAmount.toLocaleString('vi-VN')}</span>
                              </div>
                            ))}
                          </div>
                          {batch.transactionReference && (
                            <div className="mt-4 text-xs font-mono text-[#444748]">
                              Mã GD Ngân hàng: <span className="font-bold text-[#1C1C19]">{batch.transactionReference}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {batches.length === 0 && (
                    <div className="p-8 text-center text-[#444748] text-sm">Không có đợt chi trả nào.</div>
                  )}
                </div>
              </section>

              {/* SECTION 4: Bank Account Info */}
              <section className="bg-[#1C1C19] text-[#FAF6F0] border border-[#1C1C19] rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Landmark className="w-32 h-32" />
                </div>
                <div className="z-10">
                  <h3 className="font-display-lg text-lg font-bold flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-[#B59A5A]" />
                    Tài khoản Ngân hàng Liên kết
                  </h3>
                  <p className="font-body-md text-[#FAF6F0]/70 text-sm mt-1 max-w-lg">
                    Doanh thu sẽ được chuyển khoản định kỳ tự động vào tài khoản đối tác đã cấu hình dưới đây.
                  </p>

                  {summary?.bankName && summary?.bankAccountNumber && summary?.bankAccountName ? (
                    <div className="mt-6 flex flex-col gap-1">
                      <div className="text-[10px] uppercase tracking-widest text-[#B59A5A] font-bold">Chủ tài khoản</div>
                      <div className="font-mono text-lg font-bold uppercase">{summary.bankAccountName}</div>

                      <div className="text-[10px] uppercase tracking-widest text-[#B59A5A] font-bold mt-3">Ngân hàng &amp; Số tài khoản</div>
                      <div className="font-mono text-xl font-bold tracking-widest uppercase">
                        {summary.bankName} &bull; {summary.bankAccountNumber}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 rounded-lg bg-[#FAF6F0]/10 border border-[#FAF6F0]/20 text-xs text-[#FAF6F0]/80">
                      Chưa liên kết tài khoản ngân hàng. Vui lòng thiết lập tài khoản để hệ thống đối soát và chi trả doanh thu cho bạn.
                    </div>
                  )}
                </div>

                <div className="z-10 self-start md:self-center">
                  <button
                    onClick={() => setIsBankModalOpen(true)}
                    className="bg-[#FAF6F0] text-[#1C1C19] font-label-md text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-lg shadow-md hover:bg-[#B59A5A] hover:text-[#1C1C19] transition-colors"
                  >
                    {summary?.bankName ? 'Yêu cầu thay đổi' : 'Liên kết ngay'}
                  </button>
                </div>
              </section>

            </>
          )}

        </main>
      </div>

      {summary && (
        <UpdateBankInfoModal
          isOpen={isBankModalOpen}
          onClose={() => setIsBankModalOpen(false)}
          onSuccess={fetchSummary}
          initialBankName={summary.bankName}
          initialBankAccountNumber={summary.bankAccountNumber}
          initialBankAccountName={summary.bankAccountName}
        />
      )}
    </div>
  );
};

export default PartnerFinance;

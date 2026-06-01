// TypeScript interfaces cho Admin Dashboard statistics — map 1:1 với backend DTOs

export interface AdminDashboardStatsDto {
  // KPI Cards
  totalUsers: number;
  userGrowthPercent: number;
  totalRevenue: number;
  revenueGrowthPercent: number;
  activePartners: number;
  newBookings: number;
  bookingGrowthPercent: number;

  // Revenue Growth Chart (12 tháng)
  monthlyRevenue: MonthlyRevenueDto[];

  // Revenue Distribution
  staysRevenuePercent: number;
  flightsRevenuePercent: number;

  // Recent Activity
  recentActivities: RecentActivityDto[];
}

export interface MonthlyRevenueDto {
  month: string;     // "JAN", "FEB"...
  amount: number;
}

export interface RecentActivityDto {
  type: string;      // "partner", "booking", "payout"
  title: string;
  detail: string;
  time: string;      // ISO datetime string
}

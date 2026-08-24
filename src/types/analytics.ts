export type AnalyticsSummary = {
  revenue: number;
  revenueGrowth: number;

  orders: number;
  orderGrowth: number;

  customers: number;
  customerGrowth: number;

  averageOrderValue: number;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
};

export type TopProduct = {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type AnalyticsData = {
  summary: AnalyticsSummary;

  revenueChart: RevenuePoint[];

  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: unknown;
    status: string;
    createdAt: Date;

    customer: {
      id: string;
      name: string;
      email: string | null;
    };
  }>;

  topProducts: TopProduct[];
};
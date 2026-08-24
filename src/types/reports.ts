export type ReportSummary = {
  revenue: number;
  revenueGrowth: number;

  orders: number;
  ordersGrowth: number;

  customers: number;
  customersGrowth: number;

  averageOrderValue: number;
};

export type OrderStatusBreakdown = {
  status: string;
  count: number;
};

export type CustomerReport = {
  newCustomers: number;
  returningCustomers: number;
};

export type ProductReport = {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type ReportData = {
  summary: ReportSummary;

  orderStatus: OrderStatusBreakdown[];

  customers: CustomerReport;

  products: ProductReport[];

  revenueByDay: {
    date: string;
    revenue: number;
  }[];
};
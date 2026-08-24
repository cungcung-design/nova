import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  Download,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  UsersRound,
} from "lucide-react";

export const mainNavigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileBarChart,
      },
      {
        title: "Exports",
        href: "/dashboard/exports",
        icon: Download,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
      },
      {
        title: "Products",
        href: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart,
      },
      {
        title: "Transactions",
        href: "/dashboard/transactions",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Team",
        href: "/dashboard/settings/team",
        icon: UsersRound,
      },
      {
        title: "Activity",
        href: "/dashboard/activity",
        icon: Activity,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Audit Logs",
        href: "/dashboard/audit-logs",
        icon: FileText,
      },
      {
        title: "Billing",
        href: "/dashboard/settings/billing",
        icon: CreditCard,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

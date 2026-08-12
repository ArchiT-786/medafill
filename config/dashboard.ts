// File: config/sidebar.ts

import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "@/types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      // {
      //   href: "/admin",
      //   icon: "laptop",
      //   title: "Admin Panel",
      //   authorizeOnly: UserRole.ADMIN,
      // },
      // {
      //   href: "/dashboard",
      //   icon: "dashboard",
      //   title: "Dashboard",
      // },
      {
        href: "/patients",
        icon: "user",
        title: "Patients",
      },
      {
        href: "/logs",
        icon: "messages",
        title: "WhatsApp Logs",
      },
      {
        href: "/schedules",
        icon: "messages",
        title: "WhatsApp Schedules",
      },
      // {
      //   href: "/dashboard/billing",
      //   icon: "billing",
      //   title: "Billing",
      //   authorizeOnly: UserRole.USER,
      // },
      // {
      //   href: "/dashboard/charts",
      //   icon: "lineChart",
      //   title: "Charts",
      // },
      // {
      //   href: "/admin/orders",
      //   icon: "package",
      //   title: "Orders",
      //   badge: 2,
      //   authorizeOnly: UserRole.ADMIN,
      // },
      // {
      //   href: "#/dashboard/posts",
      //   icon: "post",
      //   title: "User Posts",
      //   authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
  {
    title: "OPTIONS",
    items: [
      {
        href: "/dashboard/settings",
        icon: "settings",
        title: "Settings",
      },
      {
        href: "/",
        icon: "home",
        title: "Homepage",
      },
      // {
      //   href: "/docs",
      //   icon: "bookOpen",
      //   title: "Documentation",
      // },
      // {
      //   href: "#",
      //   icon: "messages",
      //   title: "Support",
      //   authorizeOnly: UserRole.USER,
      //   disabled: true,
      // },
    ],
  },
];
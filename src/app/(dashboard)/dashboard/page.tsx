"use client";

import { useEffect, useState } from "react";
import { CreditCard, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, ordersRes, cashierRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/dashboard/order?limit=1000"), // get all for calc
          fetch("/api/cashier/orders"),
        ]);

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();
        const cashierData = await cashierRes.json();
        
        let totalRevenue = 0;
        let totalOrders = 0;

        if (ordersData.success) {
           totalRevenue += ordersData.data.reduce((acc: number, order: any) => acc + (order.total_price || 0), 0);
           totalOrders += ordersData.pagination?.total || 0;
        }
        
        if (cashierData.success) {
           totalRevenue += cashierData.data.reduce((acc: number, order: any) => acc + (order.total_price || 0), 0);
           totalOrders += cashierData.data.length || 0;
        }

        if (productsData.success) {
          setStats({
            totalProducts: productsData.total || productsData.data?.length || 0,
            totalOrders,
            totalRevenue,
          });
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner Section matching the "Sharpen Your Skills" design */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <h1 className="mb-4 text-3xl font-bold">Welcome back, Admin!</h1>
          <p className="mb-6 text-indigo-100">
            Manage your pre-order automation system efficiently. Track orders,
            manage inventory, and analyze your sales performance all in one
            place.
          </p>
          <Button
            asChild
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-none"
          >
            <Link href="/dashboard/orders">View New Orders</Link>
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Currently active products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Orders Overview Chart Component Placeholder */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full bg-slate-50 flex items-center justify-center rounded border border-dashed text-muted-foreground">
              Chart Placeholder
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions or Other Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/dashboard/products">
                  <ShoppingCart className="h-4 w-4" /> Manage Products
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/dashboard/orders">
                  <Package className="h-4 w-4" /> Manage Orders
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <TrendingUp className="h-4 w-4" /> View Reports (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

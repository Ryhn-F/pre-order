"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, PackageSearch, CreditCard, CalendarDays, Receipt, Trash2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  type: "product" | "package";
  item_id: number;
  name: string;
};

type Order = {
  order_id: number;
  customer_name: string;
  total_price: number;
  payment_method: string;
  created_at: string;
  status: "in progress" | "completed";
  items: OrderItem[];
};

export default function CashierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in progress");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cashier/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const markCompleted = async (orderId: number) => {
    try {
      const res = await fetch(`/api/cashier/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order marked as completed!");
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: "completed" } : o));
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch {
      toast.error("Network error during update");
    }
  };

  const openDeleteModal = (orderId: number) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    try {
      const res = await fetch(`/api/cashier/orders/${orderToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order deleted successfully!");
        setOrders(prev => prev.filter(o => o.order_id !== orderToDelete));
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch {
      toast.error("Network error during deletion");
    } finally {
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const inProgressOrders = orders.filter(o => o.status === "in progress");
  const completedOrders = orders.filter(o => o.status === "completed");

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-2 h-full ${order.status === 'completed' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
      <CardHeader className="pb-3 border-b border-dashed border-slate-200 dark:border-zinc-800">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Receipt className="h-5 w-5 text-muted-foreground" />
               Order #{order.order_id}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
               <CalendarDays className="h-3.5 w-3.5" />
               {new Date(order.created_at).toLocaleString("id-ID")}
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center flex-col items-end">
            <Badge variant={order.status === "completed" ? "default" : "secondary"} className={order.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"}>
              {order.status.toUpperCase()}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => openDeleteModal(order.order_id)} className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 p-0 relative z-10">
               <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-sm space-y-4">
        <div>
           <p className="text-muted-foreground mb-1">Customer</p>
           <p className="font-medium text-base">{order.customer_name || "Guest"}</p>
        </div>
        
        <div>
           <p className="text-muted-foreground mb-2 flex items-center justify-between border-b pb-1">
             <span>Items</span>
             <span>Qty</span>
           </p>
           <div className="space-y-2">
             {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="w-[70%]">
                     <p className="font-medium line-clamp-1">{item.name}</p>
                     <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-xs mt-0.5">x{item.quantity}</span>
                </div>
             ))}
           </div>
        </div>
        
      </CardContent>
      <CardFooter className="border-t bg-slate-50 dark:bg-zinc-950 flex justify-between items-center px-6 py-4">
        <div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Payment: {order.payment_method.toUpperCase()}
          </p>
          <p className="font-bold text-lg mt-1">Rp {order.total_price.toLocaleString("id-ID")}</p>
        </div>
        {order.status === "in progress" && (
          <Button 
            onClick={() => markCompleted(order.order_id)}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 font-medium"
          >
            <CheckCircle className="h-4 w-4" /> Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Active Orders</h2>
        <p className="text-muted-foreground max-w-2xl">
          Manage your live POS orders here. Orders are split by status. Once an order is handed to the customer, mark it as completed.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="in progress" className="relative">
            In Progress
            {inProgressOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                {inProgressOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="in progress" className="m-0 border-none p-0 outline-none">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : inProgressOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-zinc-950 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
               <div className="h-16 w-16 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                 <PackageSearch className="h-8 w-8" />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No In-Progress Orders</h3>
               <p className="text-slate-500 mt-1 max-w-sm">You&apos;re all caught up! New POS orders will appear here automatically.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {inProgressOrders.map(order => <OrderCard key={order.order_id} order={order} />)}
             </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="m-0 border-none p-0 outline-none">
          {isLoading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
          ) : completedOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-center bg-white dark:bg-zinc-950 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800">
               <div className="h-16 w-16 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                 <CheckCircle className="h-8 w-8" />
               </div>
               <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">No Completed Orders</h3>
               <p className="text-slate-500 mt-1 max-w-sm">Orders marked as completed will be archived here.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {completedOrders.map(order => <OrderCard key={order.order_id} order={order} />)}
             </div>
          )}
        </TabsContent>
        
      </Tabs>
      
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete Order #{orderToDelete} and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

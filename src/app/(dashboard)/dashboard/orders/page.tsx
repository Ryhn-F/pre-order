"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Pencil, Trash2, Search, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Order {
  id: string; // uuid
  nama: string;
  kelas: string;
  no_telp: string;
  product_id?: number | null;
  package_id?: number | null;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  is_package?: boolean;
}

interface Product {
  product_id: number;
  name: string;
  price: number;
}

interface Package {
  package_id: number;
  name: string;
  price: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [orderMode, setOrderMode] = useState<"product" | "package">("product");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    no_telp: "",
    item_id: "",
    quantity: "",
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchPackages();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/dashboard/order?limit=1000"); // Fetch all for client-side filtering
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Error fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (data.success) {
        setPackages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch packages");
    }
  };

  const getPrice = (id: string, mode: "product" | "package") => {
    if (mode === "product") {
      const prod = products.find(p => p.product_id.toString() === id);
      return prod ? prod.price : 0;
    } else {
      const pkg = packages.find(p => p.package_id.toString() === id);
      return pkg ? pkg.price : 0;
    }
  };

  const currentPrice = getPrice(formData.item_id, orderMode);
  const calculatedTotal = currentPrice * (parseInt(formData.quantity) || 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quantity = parseInt(formData.quantity);
      const price = getPrice(formData.item_id, orderMode);
      
      const payload: any = {
        nama: formData.nama,
        kelas: formData.kelas,
        no_telp: formData.no_telp,
        quantity,
        total_price: price * quantity,
      };

      if (orderMode === "product") {
        payload.product_id = parseInt(formData.item_id);
      } else {
        payload.package_id = parseInt(formData.item_id);
      }

      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order created successfully");
        fetchOrders();
        setIsAddOpen(false);
        setFormData({
          nama: "",
          kelas: "",
          no_telp: "",
          item_id: "",
          quantity: "",
        });
      } else {
        toast.error(data.message || "Failed to create order");
      }
    } catch (error) {
      toast.error("Error creating order");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const quantity = parseInt(formData.quantity);
      const price = getPrice(formData.item_id, orderMode);
      const payload = {
        nama: formData.nama,
        kelas: formData.kelas,
        no_telp: formData.no_telp,
        quantity,
        total_price: price * quantity,
      };

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order updated successfully");
        fetchOrders();
        setIsEditOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(data.message || "Failed to update order");
      }
    } catch (error) {
      toast.error("Error updating order");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order deleted successfully");
        fetchOrders();
        setIsDeleteOpen(false);
        setSelectedOrder(null);
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      toast.error("Error deleting order");
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    const isPackage = order.is_package;
    setOrderMode(isPackage ? "package" : "product");
    setFormData({
      nama: order.nama,
      kelas: order.kelas,
      no_telp: order.no_telp,
      item_id: isPackage ? order.package_id?.toString() || "" : order.product_id?.toString() || "",
      quantity: order.quantity.toString(),
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteOpen(true);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.kelas.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const exportToExcel = () => {
    if (orders.length === 0) {
      toast.error("No orders to export");
      return;
    }

    const exportData = orders.map((order, index) => ({
      No: index + 1,
      Name: order.nama,
      Class: order.kelas,
      Phone: order.no_telp,
      Item: order.product_name,
      Type: order.is_package ? "Package" : "Product",
      Quantity: order.quantity,
      "Total Price": order.total_price,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(
      workbook,
      `Orders_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    toast.success("Exported to Excel successfully");
  };

  // Extract shared form to avoid duplication
  const OrderForm = ({ mode }: { mode: "add" | "edit" }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-mode`} className="text-right">Order Type</Label>
        <div className="col-span-3 flex p-1 space-x-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              orderMode === "product"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => { setOrderMode("product"); setFormData({ ...formData, item_id: "" }); }}
            disabled={mode === "edit"}
          >
            Product
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              orderMode === "package"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-900"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={() => { setOrderMode("package"); setFormData({ ...formData, item_id: "" }); }}
            disabled={mode === "edit"}
          >
            Package
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-nama`} className="text-right">Name</Label>
        <Input
          id={`${mode}-nama`}
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-kelas`} className="text-right">Class</Label>
        <Input
          id={`${mode}-kelas`}
          value={formData.kelas}
          onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-no_telp`} className="text-right">Phone</Label>
        <Input
          id={`${mode}-no_telp`}
          value={formData.no_telp}
          onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-item`} className="text-right">Item</Label>
        <div className="col-span-3">
          <Select
            value={formData.item_id}
            onValueChange={(val) => setFormData({ ...formData, item_id: val })}
            required
            disabled={mode === "edit"}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select a ${orderMode}`} />
            </SelectTrigger>
            <SelectContent>
              {orderMode === "product" && products.map((p) => (
                <SelectItem key={p.product_id} value={p.product_id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
              {orderMode === "package" && packages.map((p) => (
                <SelectItem key={p.package_id} value={p.package_id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor={`${mode}-quantity`} className="text-right">Quantity</Label>
        <div className="col-span-3 flex items-center gap-4">
          <Input
            id={`${mode}-quantity`}
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full"
            required
            autoComplete="off"
          />
        </div>
      </div>
      <div className="grid grid-cols-4 items-center gap-4 mt-2 border-t pt-4">
        <Label className="text-right font-semibold">Total Price</Label>
        <div className="col-span-3">
          <span className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Rp {(calculatedTotal || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage your customer orders here.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="gap-2" disabled={orders.length === 0}>
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          <Button onClick={() => { setOrderMode("product"); setFormData({ nama: "", kelas: "", no_telp: "", item_id: "", quantity: "" }); setIsAddOpen(true); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Create Order
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Item Purchased</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order, index) => (
                <TableRow key={order.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium text-black dark:text-white">{order.nama}</TableCell>
                  <TableCell>{order.kelas}</TableCell>
                  <TableCell>{order.no_telp}</TableCell>
                  <TableCell>
                    {order.product_name}
                    {order.is_package && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Package
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Rp {order.total_price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(order)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteModal(order)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Order Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>Enter customer and order details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <OrderForm mode="add" />
            <DialogFooter>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Order Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>Update order details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <OrderForm mode="edit" />
            <DialogFooter>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                Update Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order for &quot;{selectedOrder?.nama}&quot; and remove it from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubmit} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

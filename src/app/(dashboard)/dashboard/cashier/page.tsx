"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, ShoppingCart, Loader2, Package as PackageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
  product_id: number;
  name: string;
  stock: number;
  price: number;
  image_url?: string;
  description?: string;
}

interface Package {
  package_id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  package_items?: any[];
}

type CartItem = {
  id: number;
  type: "product" | "package";
  name: string;
  price: number;
  quantity: number;
};

export default function CashierPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, packRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/packages")
      ]);
      const prodData = await prodRes.json();
      const packData = await packRes.json();

      if (prodData.success) {
        setProducts(prodData.data);
      }
      if (packData.success) {
        setPackages(packData.data);
      }
    } catch (err) {
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const getProductStock = (p: Product) => p.stock;
  
  const getPackageStock = (pkg: Package) => {
    if (!pkg.package_items || pkg.package_items.length === 0) return 0;
    let minStock = Infinity;
    for (const item of pkg.package_items) {
      if (!item.products) continue;
      const p = Array.isArray(item.products) ? item.products[0] : item.products;
      const possibleSets = Math.floor((p.stock || 0) / item.quantity);
      if (possibleSets < minStock) minStock = possibleSets;
    }
    return minStock === Infinity ? 0 : minStock;
  };

  const getAvailableStock = (item: any, type: "product" | "package") => {
    const totalStock = type === "product" ? getProductStock(item) : getPackageStock(item);
    const id = type === "product" ? item.product_id : item.package_id;
    const cartItem = cart.find(c => c.id === id && c.type === type);
    const inCart = cartItem ? cartItem.quantity : 0;
    return Math.max(0, totalStock - inCart);
  };

  const addToCart = (item: any, type: "product" | "package") => {
    const available = getAvailableStock(item, type);
    if (available <= 0) {
      toast.error("Not enough stock available");
      return;
    }

    const id = type === "product" ? item.product_id : item.package_id;
    setCart(prev => {
      const existing = prev.find(c => c.id === id && c.type === type);
      if (existing) {
        return prev.map(c => c.id === id && c.type === type ? { ...c, quantity: c.quantity + 1 } : c);
      } else {
        return [...prev, { id, type, name: item.name, price: item.price, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, type: "product" | "package", delta: number) => {
    setCart(prev => {
      const nextCart = prev.map(c => {
        if (c.id === id && c.type === type) {
          const newQ = c.quantity + delta;
          if (delta > 0) {
            const itemOriginal = type === "product" ? products.find(p => p.product_id === id) : packages.find(p => p.package_id === id);
            if (itemOriginal && getAvailableStock(itemOriginal, type) <= 0) {
               toast.error("Not enough stock available");
               return c;
            }
          }
          return { ...c, quantity: newQ };
        }
        return c;
      });
      return nextCart.filter(c => c.quantity > 0);
    });
  };

  const removeFromCart = (id: number, type: "product" | "package") => {
    setCart(prev => prev.filter(c => !(c.id === id && c.type === type)));
  };

  const submitOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cashier/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          payment_method: paymentMethod,
          items: cart
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order created successfully!");
        setCart([]);
        setCustomerName("");
        fetchData(); // refresh stock
      } else {
        toast.error(data.message || "Failed to submit order");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartTotal = cart.reduce((acc, c) => acc + (c.price * c.quantity), 0);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPackages = packages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Left side: Items */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border shadow-sm dark:bg-zinc-950">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Point of Sale</h2>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Search items..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="products" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="products" className="flex-1 overflow-y-auto p-4 m-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {filteredProducts.map(p => {
                  const available = getAvailableStock(p, "product");
                  const outOfStock = available <= 0;
                  return (
                  <Card key={p.product_id} className={`cursor-pointer transition-colors flex flex-col ${outOfStock ? 'opacity-60 grayscale' : 'hover:border-indigo-500'}`} onClick={() => !outOfStock && addToCart(p, "product")}>
                    <CardHeader className="p-4 pb-2">
                       {p.image_url ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                         <img src={p.image_url} alt={p.name} className="w-full h-24 object-cover rounded-md mb-2" />
                       ) : (
                         <div className="w-full h-24 bg-slate-100 dark:bg-zinc-800 rounded-md mb-2 flex items-center justify-center text-slate-400">No Image</div>
                       )}
                       <CardTitle className="text-sm line-clamp-1">{p.name}</CardTitle>
                       <CardDescription className="text-xs">Stock: {p.stock}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 mt-auto flex items-center justify-between">
                       <p className="font-semibold text-indigo-600 dark:text-indigo-400">Rp {p.price.toLocaleString("id-ID")}</p>
                       {outOfStock && <span className="text-xs text-red-500 font-bold">Out of Stock</span>}
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="packages" className="flex-1 overflow-y-auto p-4 m-0">
             {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {filteredPackages.map(p => {
                  const available = getAvailableStock(p, "package");
                  const outOfStock = available <= 0;
                  return (
                  <Card key={p.package_id} className={`cursor-pointer transition-colors flex flex-col ${outOfStock ? 'opacity-60 grayscale' : 'hover:border-purple-500'}`} onClick={() => !outOfStock && addToCart(p, "package")}>
                    <CardHeader className="p-4 pb-2">
                       {p.image_url ? (
                         /* eslint-disable-next-line @next/next/no-img-element */
                         <img src={p.image_url} alt={p.name} className="w-full h-24 object-cover rounded-md mb-2" />
                       ) : (
                         <div className="w-full h-24 bg-slate-100 dark:bg-zinc-800 rounded-md mb-2 flex items-center justify-center text-slate-400"><PackageIcon className="h-8 w-8 opacity-50"/></div>
                       )}
                       <CardTitle className="text-sm line-clamp-1">{p.name}</CardTitle>
                       <CardDescription className="text-xs">Stock limit: {getPackageStock(p)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 mt-auto flex items-center justify-between">
                       <p className="font-semibold text-purple-600 dark:text-purple-400">Rp {p.price.toLocaleString("id-ID")}</p>
                       {outOfStock && <span className="text-xs text-red-500 font-bold">Out of Stock</span>}
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right side: Cart Checkout */}
      <div className="w-80 lg:w-96 flex flex-col bg-slate-50 border rounded-xl shadow-sm dark:bg-zinc-900 overflow-hidden">
        <div className="p-4 border-b bg-white dark:bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            Current Order
          </div>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-200">
            {cart.reduce((a, b) => a + b.quantity, 0)} items
          </span>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto p-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 mt-20">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-lg border shadow-sm">
                  <div className="flex-1 min-w-0 pr-2">
                     <p className="text-sm font-semibold truncate">{item.name}</p>
                     <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="h-6 w-6 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 rounded flex items-center justify-center" onClick={() => updateQuantity(item.id, item.type, -1)}>
                       <Minus className="h-3 w-3" />
                     </button>
                     <span className="text-sm w-4 text-center">{item.quantity}</span>
                     <button className="h-6 w-6 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 rounded flex items-center justify-center" onClick={() => updateQuantity(item.id, item.type, 1)}>
                       <Plus className="h-3 w-3" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-zinc-950 border-t p-4 space-y-4 shrink-0">
           <div className="space-y-2">
             <Label htmlFor="custName">Customer Name (Optional)</Label>
             <Input id="custName" placeholder="e.g. John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
           </div>
           <div className="space-y-2">
             <Label htmlFor="payment">Payment Method</Label>
             <Select value={paymentMethod} onValueChange={setPaymentMethod}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="cash">Cash</SelectItem>
                 <SelectItem value="qris">QRIS / E-Wallet</SelectItem>
                 <SelectItem value="transfer">Bank Transfer</SelectItem>
                 <SelectItem value="card">Credit / Debit Card</SelectItem>
               </SelectContent>
             </Select>
           </div>
           
           <div className="border-t pt-4 flex items-center justify-between font-bold text-lg">
             <span>Total</span>
             <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
           </div>
           
           <Button 
             className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-semibold text-white" 
             onClick={submitOrder} 
             disabled={cart.length === 0 || isSubmitting}
           >
             {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto"/> : "Complete Charge"}
           </Button>
        </div>
      </div>
    </div>
  );
}

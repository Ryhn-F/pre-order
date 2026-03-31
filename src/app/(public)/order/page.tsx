"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
  product_id: number;
  name: string;
  price: number;
}

function OrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProductId = searchParams.get("product_id");

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    no_telp: "",
    product_id: defaultProductId || "",
    quantity: "1",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          // Auto select if product_id from query is not found but there are products
          if (!defaultProductId && data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              product_id: data.data[0].product_id.toString(),
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [defaultProductId]);

  const selectedProduct = products.find(
    (p) => p.product_id.toString() === formData.product_id,
  );
  const totalPrice = selectedProduct
    ? selectedProduct.price * parseInt(formData.quantity || "0")
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
          kelas: formData.kelas,
          no_telp: formData.no_telp,
          product_id: parseInt(formData.product_id),
          quantity: parseInt(formData.quantity),
          total_price: totalPrice,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error("Network error, failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md w-full mx-auto bg-black/40 backdrop-blur-md border-white/10 text-white shadow-2xl p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mb-2">
          Order Confirmed!
        </CardTitle>
        <CardDescription className="text-gray-400 mb-8">
          Thank you, {formData.nama}. Your order for {formData.quantity}x{" "}
          {selectedProduct?.name} has been placed successfully.
        </CardDescription>
        <Link href="/">
          <Button className="w-full bg-[#6c5dd3] hover:bg-[#5b4ec2] text-white">
            Return to Home
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg w-full mx-auto bg-black/40 backdrop-blur-md border-white/10 text-white shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Place Your Pre-Order
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Fill out the details below to complete your order.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-gray-200">
              Full Name
            </Label>
            <Input
              id="nama"
              placeholder="Enter your name"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kelas" className="text-gray-200">
                Class
              </Label>
              <Input
                id="kelas"
                placeholder="e.g. XII Tel 13"
                required
                value={formData.kelas}
                onChange={(e) =>
                  setFormData({ ...formData, kelas: e.target.value })
                }
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no_telp" className="text-gray-200">
                Phone Number
              </Label>
              <Input
                id="no_telp"
                placeholder="WhatsApp Number"
                required
                value={formData.no_telp}
                onChange={(e) =>
                  setFormData({ ...formData, no_telp: e.target.value })
                }
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product" className="text-gray-200">
              Select Product
            </Label>
            {loadingProducts ? (
              <div className="flex h-10 items-center px-3 bg-black/50 border border-white/10 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500 mr-2" />
                <span className="text-sm text-gray-400">
                  Loading products...
                </span>
              </div>
            ) : (
              <Select
                value={formData.product_id}
                onValueChange={(val) =>
                  setFormData({ ...formData, product_id: val })
                }
                required
              >
                <SelectTrigger className="bg-black/50 border-white/10 text-white focus:ring-purple-500">
                  <SelectValue placeholder="Select a product to order" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {products.map((p) => (
                    <SelectItem
                      key={p.product_id}
                      value={p.product_id.toString()}
                      className="focus:bg-purple-900/50 focus:text-white"
                    >
                      {p.name} - Rp {p.price.toLocaleString("id-ID")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-gray-200">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="bg-black/50 border-white/10 text-white focus-visible:ring-purple-500"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-gray-300">Total Price:</span>
            <span className="text-2xl font-bold text-white">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-[#6c5dd3] hover:bg-[#5b4ec2] text-white shadow-lg shadow-purple-900/30 h-12 text-lg"
            disabled={submitting || loadingProducts || !formData.product_id}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Pre-Order"
            )}
          </Button>
          <Link href="/" className="w-full">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Go Back
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-[#0f0c29] text-white selection:bg-purple-500 selection:text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full">
        <div className="mb-8 text-center flex justify-center items-center gap-3">
          <div className="text-2xl font-bold tracking-tighter hover:text-purple-400 transition-colors">
            <Link href="/">XII Tel 13</Link>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          }
        >
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}

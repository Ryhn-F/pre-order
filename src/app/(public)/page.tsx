"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
  product_id: number;
  name: string;
  stock: number;
  price: number;
  image_url?: string;
  description: string;
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scrollToProducts = () => {
    const element = document.getElementById("products-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] text-white selection:bg-purple-500 selection:text-white">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-purple-900/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-900/30 blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between p-6">
          <div className="text-xl font-bold tracking-tighter">XII Tel 13</div>
          <div className="flex items-center gap-8">
            <button
              onClick={scrollToProducts}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Products
            </button>
            <Link href="/login">
              <Button
                size="sm"
                className="bg-black hover:bg-zinc-800 text-white border border-zinc-700/50"
              >
                Pre-Order
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto flex min-h-[80vh] flex-col-reverse items-center justify-center gap-12 px-6 lg:flex-row lg:justify-between">
          <div className="flex flex-1 flex-col items-start gap-6 text-center lg:text-left">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-400">
              Welcome To XII Tel 13 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Pre-order Portal !
              </span>
            </h1>
            <p className="max-w-xl text-lg text-gray-400 sm:text-xl">
              Where delicious foods & beverages belongs. Experience the taste of
              joy in every bite.
            </p>
            <Button
              onClick={scrollToProducts}
              className="group h-12 gap-2 rounded-full bg-black/50 px-8 text-base backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              See Products Below !
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </Button>
          </div>

          <div className="relative flex flex-1 items-center justify-center">
            {/* 3D Food Image */}
            <div className="relative w-full max-w-[600px] aspect-square animate-float">
              <Image
                src="/Hero_bg.png"
                alt="Delicious 3D Food"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            {/* Background glow for image */}
            <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 blur-[60px] rounded-full" />
          </div>
        </section>

        {/* Products Section */}
        <section
          id="products-section"
          className="container mx-auto min-h-screen px-6 py-24"
        >
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Our Products !
            </h2>
            <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
              {products.map((product) => (
                <Card
                  key={product.product_id}
                  className="group overflow-hidden border-0 bg-black/40 backdrop-blur-sm shadow-xl transition-all hover:scale-[1.02] hover:bg-black/60 hover:shadow-purple-900/10 p-0"
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-white/5 to-white/10">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          <ShoppingCart className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="mb-2 text-lg font-bold text-white">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-400 line-clamp-2">
                      {product.description
                        ? product.description
                        : "Default Placeholder"}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Price
                      </span>
                      <span className="text-base font-bold text-white">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <Link href="/login">
                      <Button
                        size="sm"
                        className="bg-[#6c5dd3] hover:bg-[#5b4ec2] text-white shadow-lg shadow-purple-900/30 h-8 text-xs px-3"
                      >
                        Order Now
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}

              {/* Fallback if no products */}
              {!loading && products.length === 0 && (
                <div className="col-span-full text-center text-gray-500">
                  No products available at the moment.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/20 py-8 text-center text-sm text-gray-500 backdrop-blur-sm">
        <p>&copy; 2026 XII Tel 13. All rights reserved.</p>
      </footer>
    </div>
  );
}

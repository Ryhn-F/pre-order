import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kelas, no_telp, product_id, package_id, quantity, total_price } = body;

    // Validate required fields
    if (
      !nama ||
      !kelas ||
      !no_telp ||
      (!product_id && !package_id) ||
      !quantity ||
      !total_price
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required: nama, kelas, no_telp, product_id/package_id, quantity, price",
        },
        { status: 400 },
      );
    }

    // Validate quantity is a positive number
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Quantity must be a positive number" },
        { status: 400 },
      );
    }

    // Processing logic
    if (package_id) {
      // Check if package exists and has sufficient stock
      const { data: pkg, error: pkgError } = await supabase
        .from("packages")
        .select("*, package_items(quantity, product_id, products(name, stock))")
        .eq("package_id", package_id)
        .single();

      if (pkgError || !pkg) {
        return NextResponse.json(
          { success: false, message: "Package not found" },
          { status: 404 },
        );
      }

      // Check stock for all products in the package
      for (const item of pkg.package_items) {
        if (!item.products) continue;
        // The type for item.products returned by superset might be array or single object depending on relation
        // We know it's a single product
        const productData = Array.isArray(item.products) ? item.products[0] : item.products;
        const requiredStock = item.quantity * quantity;
        
        if (productData.stock < requiredStock) {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient stock for product in package: ${productData.name}. Available: ${productData.stock}, Requested: ${requiredStock}`,
            },
            { status: 400 },
          );
        }
      }

      // Create the pre-order with package_id
      const { data: order, error: orderError } = await supabase
        .from("pre_orders")
        .insert({
          nama,
          kelas,
          no_telp,
          package_id,
          quantity,
          total_price,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        return NextResponse.json(
          { success: false, message: "Failed to create order" },
          { status: 500 },
        );
      }

      // Update product stocks
      for (const item of pkg.package_items) {
        if (!item.products) continue;
        const productData = Array.isArray(item.products) ? item.products[0] : item.products;
        const requiredStock = item.quantity * quantity;
        
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: productData.stock - requiredStock })
          .eq("product_id", item.product_id);

        if (stockError) {
          console.error("Stock update error for product:", item.product_id, stockError);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully",
          order: {
            ...order,
            product_name: pkg.name,
            product_price: pkg.price,
            total_price: pkg.price * quantity,
          },
        },
        { status: 201 },
      );
    } else {
      // Check if product exists and has sufficient stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("product_id", product_id)
        .single();
  
      if (productError || !product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 },
        );
      }
  
      if (product.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
          },
          { status: 400 },
        );
      }
  
      // Create the pre-order
      const { data: order, error: orderError } = await supabase
        .from("pre_orders")
        .insert({
          nama,
          kelas,
          no_telp,
          product_id,
          quantity,
          total_price,
        })
        .select()
        .single();
  
      if (orderError) {
        console.error("Order creation error:", orderError);
        return NextResponse.json(
          { success: false, message: "Failed to create order" },
          { status: 500 },
        );
      }
  
      // Update product stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock - quantity })
        .eq("product_id", product_id);
  
      if (stockError) {
        console.error("Stock update error:", stockError);
      }
  
      return NextResponse.json(
        {
          success: true,
          message: "Order created successfully",
          order: {
            ...order,
            product_name: product.name,
            product_price: product.price,
            total_price: product.price * quantity,
          },
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

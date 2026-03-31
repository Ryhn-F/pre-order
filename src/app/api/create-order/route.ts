import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, kelas, no_telp, product_id, quantity, total_price } = body;

    // Validate required fields
    if (
      !nama ||
      !kelas ||
      !no_telp ||
      !product_id ||
      !quantity ||
      !total_price
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All fields are required: nama, kelas, no_telp, product_id, quantity, price",
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
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

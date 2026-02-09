import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function GET() {
  try {
    // Fetch all products from database
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("product_id", { ascending: true });

    if (error) {
      console.error("Fetch products error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch products" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: products,
        total: products?.length || 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, stock, price } = body;

    // Validate
    if (!name || stock === undefined || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Name, stock, and price are required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ name, stock, price })
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create product" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Product created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

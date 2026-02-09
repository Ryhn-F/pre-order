import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, stock, price } = body;

    const { data, error } = await supabase
      .from("products")
      .update({ name, stock, price })
      .eq("product_id", id)
      .select()
      .single();

    if (error) {
      console.error("Update product error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update product" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Product updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", id);

    if (error) {
      console.error("Delete product error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete product" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

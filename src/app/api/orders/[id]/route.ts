import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    // Allow updating quantity or other fields if needed
    const { quantity, kelas, nama, no_telp, total_price } = body;

    const { data, error } = await supabase
      .from("pre_orders")
      .update(total_price ? { quantity, kelas, nama, no_telp, total_price } : { quantity, kelas, nama, no_telp })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update order error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update order" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, data, message: "Order updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update order error:", error);
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

    const { error } = await supabase.from("pre_orders").delete().eq("id", id);

    if (error) {
      console.error("Delete order error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete order" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

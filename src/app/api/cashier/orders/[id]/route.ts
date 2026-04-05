import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL to avoid any Next 15 param sync issues
    const id = request.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_id", parseInt(id))
      .select()
      .single();
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Update cashier order error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop();
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("order_id", parseInt(id));
      
    if (error) throw error;
    
    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete cashier order error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const packageId = parseInt(resolvedParams.id);

    const body = await request.json();
    const { name, price, image_url, description, items } = body;

    const { error: updateError } = await supabase
      .from("packages")
      .update({ name, price, image_url, description })
      .eq("package_id", packageId);

    if (updateError) {
      console.error("Update package error:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to update package" },
        { status: 500 },
      );
    }

    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from("package_items")
        .delete()
        .eq("package_id", packageId);

      // Insert new items
      if (items.length > 0) {
        const packageItems = items.map((item: { product_id: number; quantity: number }) => ({
          package_id: packageId,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("package_items")
          .insert(packageItems);

        if (itemsError) {
          console.error("Update package items error:", itemsError);
          return NextResponse.json(
             { success: false, message: "Failed to update package items" },
             { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: "Package updated successfully" });
  } catch (error) {
    console.error("Update package exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const packageId = parseInt(resolvedParams.id);

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("package_id", packageId);

    if (error) {
      console.error("Delete package error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete package" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("Delete package exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

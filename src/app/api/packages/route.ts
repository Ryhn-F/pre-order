import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function GET() {
  try {
    const { data: packages, error } = await supabase
      .from("packages")
      .select("*, package_items(*, products(*))")
      .order("package_id", { ascending: true });

    if (error) {
      console.error("Fetch packages error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch packages" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: packages,
        total: packages?.length || 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get packages error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, price, image_url, description, items } = body;

    if (!name || price === undefined || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: "Name, price, and items are required" },
        { status: 400 },
      );
    }

    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .insert({ name, price, image_url, description })
      .select()
      .single();

    if (pkgError) {
      console.error("Create package error:", pkgError);
      return NextResponse.json(
        { success: false, message: "Failed to create package" },
        { status: 500 },
      );
    }

    if (items.length > 0) {
      const packageItems = items.map((item: { product_id: number; quantity: number }) => ({
        package_id: pkg.package_id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("package_items")
        .insert(packageItems);

      if (itemsError) {
        console.error("Create package items error:", itemsError);
        return NextResponse.json(
          { success: false, message: "Failed to add products to package" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: true, data: pkg, message: "Package created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create package exception:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

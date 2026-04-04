import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";
import { cookies } from "next/headers";

// Verify authentication for dashboard routes
async function verifyAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(sessionToken, "base64").toString());

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifyAuth();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    // Get query parameters for optional filtering/pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Fetch orders with product details
    const {
      data: orders,
      error,
      count,
    } = await supabase
      .from("pre_orders")
      .select(
        `
        *,
        products (
          name,
          price
        ),
        packages (
          name,
          price
        )
      `,
        { count: "exact" },
      )
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch orders error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch orders" },
        { status: 500 },
      );
    }

    // Transform orders to include calculated total
    const transformedOrders = orders?.map((order) => {
      const isPackage = !!order.package_id;
      const itemName = isPackage 
        ? order.packages?.name || "Unknown Package" 
        : order.products?.name || "Unknown Product";
      const itemPrice = isPackage 
        ? order.packages?.price || 0 
        : order.products?.price || 0;

      return {
        id: order.id,
        nama: order.nama,
        kelas: order.kelas,
        no_telp: order.no_telp,
        product_id: order.product_id,
        package_id: order.package_id,
        product_name: itemName,
        product_price: itemPrice,
        quantity: order.quantity,
        total_price: itemPrice * order.quantity,
        is_package: isPackage,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: transformedOrders,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

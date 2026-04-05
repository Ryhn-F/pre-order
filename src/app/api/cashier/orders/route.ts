import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/dbHelper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, payment_method, items } = body;
    
    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Order must have at least one item." }, { status: 400 });
    }

    // Calculate total price accurately
    const total_price = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer_name || "Guest",
        total_price,
        payment_method: payment_method || "cash",
      })
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    // 2. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.order_id,
      product_id: item.type === "product" ? item.id : null,
      package_id: item.type === "package" ? item.id : null,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
      
    if (itemsError) throw itemsError;

    // Optional: deduct stock for products sold? Let's keep it simple for now, as POS may auto deduct. Assumed user wants POS functionality.
    for (const item of items) {
      if (item.type === "product") {
         const { data: prod } = await supabase.from("products").select("stock").eq("product_id", item.id).single();
         if (prod) {
           await supabase.from("products").update({ stock: prod.stock - item.quantity }).eq("product_id", item.id);
         }
      } else if (item.type === "package") {
         const { data: pkgItems } = await supabase
           .from("package_items")
           .select("product_id, quantity")
           .eq("package_id", item.id);

         if (pkgItems) {
           for (const pkgItem of pkgItems) {
             const requiredDeduction = pkgItem.quantity * item.quantity;
             const { data: prod } = await supabase
               .from("products")
               .select("stock")
               .eq("product_id", pkgItem.product_id)
               .single();

             if (prod) {
               await supabase
                 .from("products")
                 .update({ stock: prod.stock - requiredDeduction })
                 .eq("product_id", pkgItem.product_id);
             }
           }
         }
      }
    }
    
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Cashier create order error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id, quantity, price, product_id, package_id,
          products (name),
          packages (name)
        )
      `)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    
    // Transform orders to a cleaner structure
    const transformed = orders.map((order: any) => {
      const items = order.order_items.map((it: any) => ({
        id: it.id,
        quantity: it.quantity,
        price: it.price,
        type: it.product_id ? "product" : "package",
        item_id: it.product_id || it.package_id,
        name: it.product_id ? it.products?.name : it.packages?.name,
      }));
      return { ...order, items };
    });
    
    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error("Fetch cashier orders error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

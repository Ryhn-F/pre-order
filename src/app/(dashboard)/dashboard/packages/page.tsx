"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Product {
  product_id: number;
  name: string;
  stock: number;
  price: number;
}

interface PackageItem {
  id?: number;
  package_id?: number;
  product_id: number;
  quantity: number;
  products?: { name: string; price: number };
}

interface Package {
  package_id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  package_items: PackageItem[];
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: "",
    description: "",
  });
  
  const [formItems, setFormItems] = useState<{ product_id: number; quantity: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packRes, prodRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/products")
      ]);
      const packData = await packRes.json();
      const prodData = await prodRes.json();

      if (packData.success) setPackages(packData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch {
      toast.error("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) {
      toast.error("No products available to add");
      return;
    }
    setFormItems([...formItems, { product_id: products[0].product_id, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formItems];
    newItems.splice(index, 1);
    setFormItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formItems];
    if (field === "product_id") newItems[index].product_id = parseInt(value);
    if (field === "quantity") newItems[index].quantity = parseInt(value);
    setFormItems(newItems);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      toast.error("Please add at least one product to the package");
      return;
    }
    
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseInt(formData.price),
          image_url: formData.image_url,
          description: formData.description,
          items: formItems,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Package created successfully");
        fetchData();
        setIsAddOpen(false);
        setFormData({ name: "", price: "", image_url: "", description: "" });
        setFormItems([]);
      } else {
        toast.error(data.message || "Failed to create package");
      }
    } catch {
      toast.error("Error creating package");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    if (formItems.length === 0) {
      toast.error("Please add at least one product to the package");
      return;
    }

    try {
      const res = await fetch(`/api/packages/${selectedPackage.package_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: parseInt(formData.price),
          image_url: formData.image_url,
          description: formData.description,
          items: formItems,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Package updated successfully");
        fetchData();
        setIsEditOpen(false);
        setSelectedPackage(null);
      } else {
        toast.error(data.message || "Failed to update package");
      }
    } catch {
      toast.error("Error updating package");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedPackage) return;

    try {
      const res = await fetch(`/api/packages/${selectedPackage.package_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Package deleted successfully");
        fetchData();
        setIsDeleteOpen(false);
        setSelectedPackage(null);
      } else {
        toast.error(data.message || "Failed to delete package");
      }
    } catch {
      toast.error("Error deleting package");
    }
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      image_url: pkg.image_url || "",
      description: pkg.description || "",
    });
    setFormItems(
      pkg.package_items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }))
    );
    setIsEditOpen(true);
  };

  const openDeleteModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDeleteOpen(true);
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Packages</h2>
          <p className="text-muted-foreground">
            Manage your package combos here.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ name: "", price: "", image_url: "", description: "" });
            setFormItems([]);
            setIsAddOpen(true);
          }}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search packages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>Package Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Items Included</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPackages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No packages found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPackages.map((pkg, index) => (
                <TableRow key={pkg.package_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {pkg.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={pkg.image_url} alt={pkg.name} className="w-10 h-10 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px] text-gray-400 text-center">No Img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-black dark:text-white">{pkg.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={pkg.description || ""}>
                    {pkg.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400">
                      {pkg.package_items.map((item, i) => {
                        const productName = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
                        return (
                          <span key={i}>
                            {item.quantity}x {productName || "Unknown Product"}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => openEditModal(pkg)}
                         className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                         <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => openDeleteModal(pkg)}
                         className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                         <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {[{ mode: "add" as const, isOpen: isAddOpen, setIsOpen: setIsAddOpen, onSubmit: handleAddSubmit, title: "Add New Package", desc: "Create a new package record and select included products." },
        { mode: "edit" as const, isOpen: isEditOpen, setIsOpen: setIsEditOpen, onSubmit: handleUpdateSubmit, title: "Edit Package", desc: "Update package details and its contents." }
      ].map(({ mode, isOpen, setIsOpen, onSubmit, title, desc }) => (
          <Dialog key={mode} open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{desc}</DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${mode}-name`} className="text-right">Name</Label>
                    <Input
                      id={`${mode}-name`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${mode}-price`} className="text-right">Price</Label>
                    <Input
                      id={`${mode}-price`}
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${mode}-image`} className="text-right">Image URL</Label>
                    <Input
                      id={`${mode}-image`}
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor={`${mode}-description`} className="text-right">Description</Label>
                    <textarea
                      id={`${mode}-description`}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Package description..."
                    />
                  </div>

                  <div className="border-t border-gray-200 dark:border-zinc-800 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Package Items</Label>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                      </Button>
                    </div>

                    {formItems.length === 0 && (
                      <div className="text-sm text-gray-500 mb-4 text-center p-4 border rounded-md bg-gray-50 dark:bg-zinc-900 border-dashed">
                        No items added. Click &quot;Add Item&quot; to include products in this package.
                      </div>
                    )}

                    <div className="space-y-3">
                      {formItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center">
                          <div className="flex-1">
                            <select
                               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                               value={item.product_id}
                               onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                               required
                            >
                               {products.map(p => (
                                  <option key={p.product_id} value={p.product_id}>{p.name} (Stock: {p.stock})</option>
                               ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <Input
                               type="number"
                               min="1"
                               value={item.quantity}
                               onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                               required
                               placeholder="Qty"
                            />
                          </div>
                          <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveItem(index)} className="shrink-0 flex-none h-10 w-10 text-white">
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-4 border-t pt-4">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                    {mode === "add" ? "Save Package" : "Update Package"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      ))}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              package &quot;{selectedPackage?.name}&quot; and remove it from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
               onClick={handleDeleteSubmit}
               className="bg-red-600 hover:bg-red-700 text-white"
            >
               Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

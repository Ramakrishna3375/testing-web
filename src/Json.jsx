import { useEffect, useState } from "react";
import axios from "axios";
import * as FaIcons from "react-icons/fa";

export default function Json() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // form states
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "" });
  const [editProduct, setEditProduct] = useState(null); // holds product being edited

  // GET products
  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // GET categories
  useEffect(() => {
    axios.get("http://localhost:5000/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // POST - Add new product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    axios.post("http://localhost:5000/products", {
        ...newProduct,
        price: parseFloat(newProduct.price),
      })
      .then((res) => {
        setProducts([...products, res.data]); // update state
        setNewProduct({ name: "", price: "", category: "" }); // reset form
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  // PUT - Update product
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!editProduct) return;
    axios.put(`http://localhost:5000/products/${editProduct.id}`, editProduct)
      .then((res) => {
        setProducts(products.map((p) => (p.id === res.data.id ? res.data : p)));
        setEditProduct(null); // reset edit mode
      })
      .catch((err) => console.error("Error updating product:", err));
  };

  return (
    <div className="flex flex-row">
      {/* Sidebar Categories */}
      <aside className="flex flex-col border p-2 gap-2 ml-2 mb-5 w-1/4">
        <h1 className="font-bold mb-2">Categories</h1>
        {categories.map((cat) => {
          const Icon = FaIcons[cat.icon];
          return (
            <div key={cat.id} className="flex items-center border rounded-2xl px-1 py-1 ">
              {Icon && <Icon style={{ marginRight: "8px", fontSize: "20px" }} />}
              {cat.name}
            </div>
          );
        })}
      </aside>

      {/* Main Products */}
      <div className="flex-1 ml-5 mr-5">
        <h1 className="font-bold mb-3">Products</h1>
        <ul className="grid grid-cols-3 gap-3">
          {products.map((p) => (
            <li key={p.id} className="border rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow p-2">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className="text-green-600 font-bold mt-1">₹{p.price}</p>
              <button onClick={() => setEditProduct(p)} className="mt-2 text-sm text-blue-600 underline">
                Edit
              </button>
            </li>
          ))}
        </ul>

        {/* Add Product Form */}
        <form onSubmit={handleAddProduct} className="mt-5 border p-3 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Add New Product</h2>
          <input type="text" placeholder="Name" value={newProduct.name} onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-1 mr-2" />
          <input type="number" placeholder="Price" value={newProduct.price} onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })}
            className="border p-1 mr-2" />
          <select value={newProduct.category}  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="border p-1 mr-2">
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded-lg">
            Add
          </button>
        </form>

        {/* Edit Product Form */}
        {editProduct && (
          <form onSubmit={handleUpdateProduct} className="mt-5 border p-3 rounded-lg shadow">
            <h2 className="font-semibold mb-2">Edit Product</h2>
            <input type="text" value={editProduct.name} onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })}
              className="border p-1 mr-2" />
            <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              className="border p-1 mr-2" />
            <select value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
              className="border p-1 mr-2">
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded-lg mr-2">
              Update
            </button>
            <button type="button" onClick={() => setEditProduct(null)} className="bg-gray-400 text-white px-3 py-1 rounded-lg">
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

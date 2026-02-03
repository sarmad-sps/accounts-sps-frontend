import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Trash2, X, Save, Edit3 } from "lucide-react";

export default function StoreInventory({ role }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    stock: "",
    unit: "pcs",
    minStock: "5",
  });
  const [items, setItems] = useState([]);

  const token = localStorage.getItem("sps_token");
  const canModify = role?.toLowerCase() === "store";
  const categories = ["All", "Kitchen", "Grocery", "Stationery", "Electronics", "Cleaning"];
  const API_URL = "https://accounts-sps-backend-git-main-secure-path-solutions-projects.vercel.app/api/inventory-items";

  const restrictedKeywords = {
    Kitchen: ["pen", "paper", "laptop", "mouse", "keyboard", "broom", "mop", "stapler", "notebook", "ink"],
    Stationery: ["spoon", "fork", "plate", "oil", "flour", "soap", "detergent", "fridge", "oven"],
    Electronics: ["oil", "flour", "pencil", "eraser", "mop", "dishwash", "sugar", "salt"],
    Cleaning: ["rice", "sugar", "monitor", "cable", "book", "ink", "laptop", "tablet"],
    Grocery: ["laptop", "printer", "broom", "folder", "marker", "monitor", "keyboard"],
  };

  const fetchInventory = async () => {
    if (!token) return;
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSave = async () => {
    const itemName = formData.name.toLowerCase().trim();
    const currentCat = editingItem ? editingItem.category : selectedCategory;

    if (!itemName || !formData.stock) {
      alert("enter name and stock quantity.");
      return;
    }

    const isDuplicate = items.some(
      (item) =>
        item.name.toLowerCase().trim() === itemName &&
        (!editingItem || item._id !== editingItem._id)
    );

    if (isDuplicate) {
      alert(`"${formData.name}" name already exit.`);
      return;
    }

    const restrictions = restrictedKeywords[currentCat] || [];
    const isInvalid = restrictions.some((word) => itemName.includes(word));

    if (isInvalid) {
      alert(`"${formData.name}" this category "${currentCat}" is not suitable.`);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        quantity: Number(formData.stock),
        unit: formData.unit || "pcs",
        minStock: Number(formData.minStock || 5),
        category: currentCat,
      };

      let res;
      if (editingItem) {
        res = await axios.put(`${API_URL}/${editingItem._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(items.map((i) => (i._id === editingItem._id ? res.data : i)));
      } else {
        res = await axios.post(API_URL, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems([...items, res.data]);
      }

      closeModal();
    } catch (err) {
      console.error("Save failed:", err);
      const msg = err.response?.data?.message || err.message || "something";
      alert(`Error: ${msg}`);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      stock: item.quantity.toString(),
      unit: item.unit || "pcs",
      minStock: (item.minStock || 5).toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("are you sure you want to delete this permanantly?")) return;
    try {
      await axios.delete(`${API_URL}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter((i) => i._id !== itemId));
    } catch (err) {
      alert("Can't delete, try again.");
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: "", stock: "", unit: "pcs", minStock: "5" });
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ animation: "fadeIn 0.4s ease-in-out" }}>
      {/* Category Buttons */}
      {/* <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              border: "1px solid",
              borderColor: selectedCategory === cat ? "#6366f1" : "#1e293b",
              backgroundColor: selectedCategory === cat ? "rgba(99, 102, 241, 0.1)" : "#0b0f1a",
              color: selectedCategory === cat ? "#818cf8" : "#64748b",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div> */}
      {/* Category Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "12px 24px",
              borderRadius: "14px",
              border: "1px solid",
              borderColor: selectedCategory === cat ? "#6366f1" : "#d1d5db",
              backgroundColor: selectedCategory === cat ? "rgba(99, 102, 241, 0.1)" : "#0C2C55",
              color: selectedCategory === cat ? "#818cf8" : "#94a3b8",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.3s",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Search + Add Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={styles.searchBox}>
          <Search size={18} color="#475569" />
          <input
            type="text"
            placeholder={`Search in ${selectedCategory}...`}
            style={styles.searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {canModify && selectedCategory !== "All" && (
          <button onClick={() => setShowModal(true)} style={styles.addButton}>
            <Plus size={19} /> New {selectedCategory} Item
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Item</th>
              <th style={styles.th}>Stock Status</th>
              <th style={styles.th}>Quantity</th>
              {canModify && <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const min = item.minStock || 5;
              const qty = item.quantity || 0;

              let statusText = "HIGH";
              let bg = "rgba(16, 185, 129, 0.15)";     // green
              let color = "#10b981";
              let border = "1px solid #10b98140";

              if (qty <= min) {
                statusText = "LOW";
                bg = "rgba(239, 68, 68, 0.15)";        // red
                color = "#ef4444";
                border = "1px solid #ef444440";
              } else if (qty <= min * 2) {
                statusText = "MEDIUM";
                bg = "rgba(245, 158, 11, 0.15)";       // amber/orange
                color = "#f59e0b";
                border = "1px solid #f59e0b40";
              }

              return (
                <tr key={item._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: "700", color: "black", fontSize: "15px" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px", textTransform: "uppercase" }}>
                      {item.category}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: bg,
                        color: color,
                        border: border,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {statusText}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={{ fontSize: "17px", fontWeight: "700", color: "black" }}>
                      {qty}
                    </span>
                    <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "5px" }}>
                      {item.unit || "pcs"}
                    </span>
                  </td>

                  {canModify && (
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={styles.iconBtn}
                          title="Edit item"
                        >
                          <Edit3 size={18} color="#818cf8" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          style={styles.iconBtn}
                          title="Delete item"
                        >
                          <Trash2 size={18} color="#f87171" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "21px", color: "black" }}>
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#818cf8" }}>
                  Category: {editingItem ? editingItem.category : selectedCategory}
                </p>
              </div>
              <button onClick={closeModal} style={styles.closeBtn}>
                <X size={22} />
              </button>
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>Item Name</label>
              <input
                type="text"
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Basmati Rice"
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ ...styles.formItem, flex: 1 }}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  min="0"
                  style={styles.input}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>

              <div style={{ ...styles.formItem, flex: 1 }}>
                <label style={styles.label}>Unit</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs / kg / liter"
                />
              </div>
            </div>

            <div style={styles.formItem}>
              <label style={styles.label}>Minimum Stock Level (Alert)</label>
              <input
                type="number"
                min="1"
                style={styles.input}
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              />
            </div>

            <button onClick={handleSave} style={styles.saveBtn}>
              <Save size={18} /> {editingItem ? "Update" : "Add Item"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    background: "#ffffff", 
    padding: "0 18px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0", 
    maxWidth: "480px",
  },
  searchInput: {
    border: "none",
    padding: "14px 0",
    outline: "none",
    width: "100%",
    background: "transparent",
    color: "#1e293b", 
    fontSize: "15px",
  },
  addButton: {
    background: "#6366f1",
    color: "#ffffff",
    border: "none",
    padding: "14px 28px",
    borderRadius: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
  },
  card: {
    background: "#f8fafc",
    borderRadius: "20px",
    border: "1px solid #e2e8f0", 
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { background: "#f1f5f9" }, 
  th: {
    textAlign: "left",
    padding: "18px 24px",
    fontSize: "12px",
    color: "#64748b", 
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
    transition: "background 0.2s",
    color: "#1e293b", 
  },
  td: { 
    padding: "16px 24px",
    color: "#334155" 
  },
  iconBtn: {
    background: "#e2e8f0", 
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "inline-flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
  
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)", 
    backdropFilter: "blur(8px)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#ffffff", 
    padding: "40px",
    borderRadius: "24px",
    width: "440px",
    maxWidth: "90vw",
    border: "1px solid #e2e8f0",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#f8fafc", 
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#1e293b", 
    fontSize: "15px",
    outline: "none",
  },
  saveBtn: {
    width: "100%",
    padding: "16px",
    background: "#6366f1",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "24px",
    transition: "background 0.2s",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s",
  },
  formItem: { marginBottom: "20px" },
};
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

interface Order {
  _id: string;
  customerName: string;
  total: number;
  status: "new" | "completed";
  createdAt: string;
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/admin");
    } else {
      setIsLoggedIn(true);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin");
  };

  const markOrderCompleted = async (orderId: string) => {
    console.log("Marking order as completed. Order ID:", orderId);

    try {
      const response = await fetch(`/api/orders/complete?id=${orderId}`, {
        method: "POST",
      });

      console.log("Mark complete response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Mark complete result:", result);

        // Refresh the orders data
        await fetchData();
        alert(`Order marked as completed successfully!`);
      } else {
        const error = await response.json();
        console.log("Mark complete error:", error);
        alert(error.error || "Failed to mark order as completed");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to mark order as completed. Please try again.");
    }
  };

  const clearCompletedOrders = async () => {
    const completedCount = orders.filter(
      (order) => order.status === "completed"
    ).length;

    if (completedCount === 0) {
      alert("No completed orders to clear.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to clear all ${completedCount} completed orders? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/orders/clear-completed", {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          result.message ||
            `Cleared ${completedCount} completed orders successfully!`
        );
        await fetchData(); // Refresh the orders list
      } else {
        const error = await response.json();
        alert(error.error || "Failed to clear completed orders");
      }
    } catch (error) {
      console.error("Error clearing completed orders:", error);
      alert("Error clearing completed orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Admin Settings Component - FIXED VERSION
  function AdminSettings() {
    const [settings, setSettings] = useState({
      currentUsername: "",
      newUsername: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [hasFetched, setHasFetched] = useState(false); // Add this to prevent infinite fetches
    const getPasswordStrength = (password: string) => {
      if (!password) return "";
      if (password.length < 6) return "weak";
      if (password.length < 8) return "medium";
      return "strong";
    };

    const getPasswordStrengthText = (password: string) => {
      const strength = getPasswordStrength(password);
      switch (strength) {
        case "weak":
          return "Weak";
        case "medium":
          return "Medium";
        case "strong":
          return "Strong";
        default:
          return "";
      }
    };

    useEffect(() => {
      // Only fetch if we haven't fetched already
      if (!hasFetched) {
        fetchCurrentSettings();
        setHasFetched(true);
      }
    }, [hasFetched]); // Add dependency

    const fetchCurrentSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings((prev) => ({
            ...prev,
            currentUsername: data.username,
          }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");

      // Validate passwords match
      if (
        settings.newPassword &&
        settings.newPassword !== settings.confirmPassword
      ) {
        setMessage("New passwords do not match");
        setLoading(false);
        return;
      }

      // Validate password length
      if (settings.newPassword && settings.newPassword.length < 6) {
        setMessage("New password must be at least 6 characters");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentUsername: settings.currentUsername,
            newUsername: settings.newUsername,
            currentPassword: settings.currentPassword,
            newPassword: settings.newPassword,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setMessage("✅ Admin credentials updated successfully!");
          setSettings({
            currentUsername:
              result.username ||
              settings.newUsername ||
              settings.currentUsername,
            newUsername: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          // Refetch to get updated username
          await fetchCurrentSettings();
        } else {
          setMessage(`❌ ${result.error}`);
        }
      } catch (error) {
        console.error("Error updating settings:", error);
        setMessage("❌ Failed to update settings");
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    };

    return (
      <div className={styles.tabContent}>
        <h1 className={styles.pageTitle}>Admin Settings</h1>

        <div className={styles.settingsCard}>
          <h2 className={styles.settingsTitle}>Change Admin Credentials</h2>
          <p className={styles.settingsDescription}>
            Update your admin username and password here. Both current
            credentials are required to make changes.
          </p>

          {message && (
            <div
              className={
                message.includes("✅")
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles.required}`}>
                  Current Username
                </label>
                <input
                  placeholder="current username"
                  type="text"
                  name="currentUsername"
                  value={settings.currentUsername}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.currentCredentials}>
                <h4>Current Username: {settings.currentUsername}</h4>
                <small>This is your current login username</small>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Username</label>
                <input
                  type="text"
                  name="newUsername"
                  value={settings.newUsername}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.required}`}>
                Current Password
              </label>
              <input
                placeholder="current password"
                type="password"
                name="currentPassword"
                value={settings.currentPassword}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={settings.newPassword}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Leave empty to keep current"
                  minLength={6}
                />
                {settings.newPassword && (
                  <div
                    className={`${styles.passwordStrength} ${
                      styles[getPasswordStrength(settings.newPassword)]
                    }`}
                  >
                    Password strength:{" "}
                    {getPasswordStrengthText(settings.newPassword)}
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Credentials"}
              </button>
            </div>
          </form>

          <div className={styles.settingsInfo}>
            <h3>💡 Security Tips</h3>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Change your password regularly</li>
              <li>Never share your admin credentials</li>
              <li>Keep your current password secure</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  const setupAdminUser = async () => {
    if (
      confirm(
        "This will create the initial admin user in the database. Continue?"
      )
    ) {
      try {
        const response = await fetch("/api/admin/setup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "admin",
            password: "admin123",
          }),
        });

        if (response.ok) {
          alert(
            "✅ Admin user created successfully in database! You can now use the change credentials feature."
          );
        } else {
          const error = await response.json();
          alert(`❌ ${error.error || "Failed to create admin user"}`);
        }
      } catch (error) {
        console.error("Setup error:", error);
        alert("❌ Error creating admin user. Check console for details.");
      }
    }
  };
  const deleteProduct = async (productId: string) => {
    console.log("Deleting product with ID:", productId);

    if (
      confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/products/delete?id=${productId}`, {
          method: "DELETE",
        });

        console.log("Delete response status:", response.status);

        if (response.ok) {
          alert("Product deleted successfully!");
          await fetchData(); // Refresh the products list
        } else {
          const error = await response.json();
          console.log("Delete error:", error);
          alert(error.error || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  if (!isLoggedIn) {
    return <div>Loading...</div>;
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  return (
    <div className={styles.container}>
      {/* Admin Header */}
      <header className={styles.adminHeader}>
        <div className={styles.adminNav}>
          <div className={styles.adminLogo}>
            <Link href="/">MyStore</Link>
            <span className={styles.adminBadge}>Admin</span>
          </div>
          <div className={styles.adminActions}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${
                activeTab === "dashboard" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              📊 Dashboard
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === "products" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("products")}
            >
              🛍️ Products ({products.length})
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === "orders" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("orders")}
            >
              📦 Orders ({orders.length})
            </button>
            <button
              className={`${styles.navItem} ${
                activeTab === "add-product" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("add-product")}
            >
              ➕ Add Product
            </button>
            {/* Add Settings Tab */}
            <button
              className={`${styles.navItem} ${
                activeTab === "settings" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </button>
          </nav>
        </aside>
        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Admin Settings</h1>

            {/* Temporary setup button - remove after use */}
            <div className={styles.setupCard}>
              <h2>🚀 Initial Setup Required</h2>
              <p>
                Click the button below to create the admin user in the database.
                This only needs to be done once.
              </p>
              <button onClick={setupAdminUser} className={styles.setupButton}>
                Create Admin User in Database
              </button>
            </div>

            {/* Your existing AdminSettings component */}
            <AdminSettings />
          </div>
        )}

        {/* Main Content */}
        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className={styles.tabContent}>
                  <h1 className={styles.pageTitle}>Admin Dashboard</h1>

                  {/* Stats Cards */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>💰</div>
                      <div className={styles.statInfo}>
                        <h3>₱{totalRevenue.toFixed(2)}</h3>
                        <p>Total Revenue</p>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>📦</div>
                      <div className={styles.statInfo}>
                        <h3>{orders.length}</h3>
                        <p>Total Orders</p>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>🛍️</div>
                      <div className={styles.statInfo}>
                        <h3>{products.length}</h3>
                        <p>Total Products</p>
                      </div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>✅</div>
                      <div className={styles.statInfo}>
                        <h3>{completedOrders}</h3>
                        <p>Completed Orders</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Orders</h2>
                    <div className={styles.ordersList}>
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id} className={styles.orderItem}>
                          <div className={styles.orderInfo}>
                            <strong>Order #{order._id.slice(-6)}</strong>
                            <span>{order.customerName}</span>
                            <span>₱{order.total.toFixed(2)}</span>
                          </div>
                          <div className={styles.orderStatus}>
                            <span
                              className={`${styles.statusBadge} ${
                                order.status === "completed"
                                  ? styles.completed
                                  : styles.new
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <p className={styles.noData}>No orders yet</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {products.map((product) => (
                <div key={product._id} className={styles.tableRow}>
                  <span className={styles.productName}>{product.name}</span>
                  <span>₱{product.price.toFixed(2)}</span>
                  <span>{product.stock}</span>
                  <span>{product.category}</span>
                  <div className={styles.actionButtons}>
                    <button className={styles.editButton}>Edit</button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => {
                        console.log("Product ID to delete:", product._id);
                        console.log("Product ID type:", typeof product._id);
                        console.log("Product ID length:", product._id.length);
                        deleteProduct(product._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className={styles.tabContent}>
                  <div className={styles.tabHeader}>
                    <div>
                      <h1 className={styles.pageTitle}>Order Management</h1>
                      <p className={styles.tabSubtitle}>
                        {
                          orders.filter((order) => order.status === "new")
                            .length
                        }{" "}
                        new orders •{" "}
                        {
                          orders.filter((order) => order.status === "completed")
                            .length
                        }{" "}
                        completed orders
                      </p>
                    </div>
                    <div className={styles.tabActions}>
                      {orders.filter((order) => order.status === "completed")
                        .length > 0 && (
                        <button
                          onClick={clearCompletedOrders}
                          className={styles.clearCompletedButton}
                          disabled={loading}
                        >
                          🗑️ Clear Completed Orders
                        </button>
                      )}
                      <button
                        onClick={fetchData}
                        className={styles.refreshButton}
                        disabled={loading}
                      >
                        {loading ? "🔄" : "🔄"} Refresh
                      </button>
                    </div>
                  </div>

                  <div className={styles.ordersTable}>
                    <div className={styles.tableHeader}>
                      <span>Order ID</span>
                      <span>Customer</span>
                      <span>Total</span>
                      <span>Date</span>
                      <span>Status</span>
                      <span>Actions</span>
                    </div>
                    <div className={styles.tableBody}>
                      {orders.map((order) => (
                        <div key={order._id} className={styles.tableRow}>
                          <span>#{order._id.slice(-6)}</span>
                          <span>{order.customerName}</span>
                          <span>₱{order.total.toFixed(2)}</span>
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`${styles.statusBadge} ${
                              order.status === "completed"
                                ? styles.completed
                                : styles.new
                            }`}
                          >
                            {order.status}
                          </span>
                          <div className={styles.actionButtons}>
                            {order.status === "new" && (
                              <button
                                className={styles.completeButton}
                                onClick={() => markOrderCompleted(order._id)}
                              >
                                Mark Complete
                              </button>
                            )}
                            <button className={styles.viewButton}>View</button>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className={styles.noDataRow}>
                          <span>No orders yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Add Product Tab */}
              {activeTab === "add-product" && (
                <AddProductForm onProductAdded={fetchData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Add Product Form Component
function AddProductForm({ onProductAdded }: { onProductAdded: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          image: result.fileUrl,
        }));
        alert("Image uploaded successfully!");
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: parseInt(formData.stock),
          image: formData.image || "/placeholder.jpg",
        }),
      });

      if (response.ok) {
        alert("Product added successfully!");
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          image: "",
        });
        onProductAdded();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className={styles.tabContent}>
      <h1 className={styles.pageTitle}>Add New Product</h1>

      <form onSubmit={handleSubmit} className={styles.addProductForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="Enter product name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Price (₱) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="Enter product description"
            rows={4}
            required
          ></textarea>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.formLabel}>
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Select category</option>
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Accessories">Accessories</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Product Image</label>
          <div className={styles.imageUploadSection}>
            {formData.image && (
              <div className={styles.imagePreview}>
                <img
                  src={formData.image}
                  alt="Preview"
                  className={styles.previewImage}
                />
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                >
                  Remove Image
                </button>
              </div>
            )}

            <div className={styles.simpleUpload}>
              <label
                htmlFor="image-upload"
                className={styles.simpleUploadLabel}
              >
                <input
                  type="file"
                  id="image-upload"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={handleImageUpload}
                  className={styles.simpleFileInput}
                  disabled={uploading}
                />
                <div className={styles.simpleUploadContent}>
                  <div className={styles.uploadIcon}>📁</div>
                  <div>
                    <div className={styles.uploadTitle}>Select Image File</div>
                    <div className={styles.uploadSubtitle}>
                      Click to browse your computer
                    </div>
                  </div>
                </div>
              </label>
              {uploading && (
                <div className={styles.uploadingOverlay}>
                  <div className={styles.uploadSpinner}>⏳</div>
                  <div>Uploading...</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? "Adding..." : "Save Product"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() =>
              setFormData({
                name: "",
                description: "",
                price: "",
                category: "",
                stock: "",
                image: "",
              })
            }
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

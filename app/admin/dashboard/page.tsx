'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

interface Product {
  _id: string
  name: string
  price: number
  stock: number
  category: string
  createdAt: string
}

interface Order {
  _id: string
  customerName: string
  total: number
  status: 'new' | 'completed'
  createdAt: string
}

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    if (!loggedIn) {
      router.push('/admin')
    } else {
      setIsLoggedIn(true)
      fetchData()
    }
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ])
      
      const productsData = await productsRes.json()
      const ordersData = await ordersRes.json()
      
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    router.push('/admin')
  }

  const markOrderCompleted = async (orderId: string) => {
    try {
      // For now, we'll just refetch. Later we'll add an update API
      alert(`Order #${orderId} marked as completed! (API coming soon)`)
      await fetchData()
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' })
        await fetchData()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (!isLoggedIn) {
    return <div>Loading...</div>
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const completedOrders = orders.filter(order => order.status === 'completed').length

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
              className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🛍️ Products ({products.length})
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders ({orders.length})
            </button>
            <button 
              className={`${styles.navItem} ${activeTab === 'add-product' ? styles.active : ''}`}
              onClick={() => setActiveTab('add-product')}
            >
              ➕ Add Product
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
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
                            <span className={`${styles.statusBadge} ${order.status === 'completed' ? styles.completed : styles.new}`}>
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

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className={styles.tabContent}>
                  <h1 className={styles.pageTitle}>Product Management</h1>
                  
                  <div className={styles.productsTable}>
                    <div className={styles.tableHeader}>
                      <span>Product</span>
                      <span>Price</span>
                      <span>Stock</span>
                      <span>Category</span>
                      <span>Actions</span>
                    </div>
                    <div className={styles.tableBody}>
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
                              onClick={() => deleteProduct(product._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className={styles.noDataRow}>
                          <span>No products found. Add your first product!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className={styles.tabContent}>
                  <h1 className={styles.pageTitle}>Order Management</h1>
                  
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
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className={`${styles.statusBadge} ${order.status === 'completed' ? styles.completed : styles.new}`}>
                            {order.status}
                          </span>
                          <div className={styles.actionButtons}>
                            {order.status === 'new' && (
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
              {activeTab === 'add-product' && (
                <AddProductForm onProductAdded={fetchData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// Add Product Form Component
function AddProductForm({ onProductAdded }: { onProductAdded: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          stock: parseInt(formData.stock),
          image: formData.image || '/placeholder.jpg'
        }),
      })

      if (response.ok) {
        alert('Product added successfully!')
        setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' })
        onProductAdded()
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
            <label htmlFor="category" className={styles.formLabel}>Category *</label>
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
          <label className={styles.formLabel}>Product Image URL</label>
          <input 
            type="url" 
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={styles.formInput} 
            placeholder="https://example.com/image.jpg" 
          />
          <small>Leave empty for placeholder image</small>
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? 'Adding...' : 'Save Product'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => setFormData({ name: '', description: '', price: '', category: '', stock: '', image: '' })}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}
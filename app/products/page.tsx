'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface Product {
  _id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  stock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const { addItem } = useCart()
const router = useRouter()

const addToCart = (product: Product) => {
  addItem({
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.image
  })
  
  // Ask user if they want to go to cart
  if (confirm(`Added ${product.name} to cart! Go to cart now?`)) {
    router.push('/cart')
  }
}

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>Loading products...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>{error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      
      {/* Products Main Content */}
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>All Products</h1>
          <p className={styles.pageSubtitle}>
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.image && product.image !== '/placeholder.jpg' ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    Product Image
                  </div>
                )}
              </div>
              <div className={styles.productContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description
                  }
                </p>
                <div className={styles.productFooter}>
                  <span className={styles.productPrice}>₱{product.price.toFixed(2)}</span>
                  <div className={styles.productActions}>
                    <Link href={`/products/${product._id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                    <button 
                      className={styles.addToCartButton}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
                {product.stock < 10 && product.stock > 0 && (
                  <div className={styles.lowStock}>Only {product.stock} left!</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className={styles.emptyState}>
            <h2>No products found</h2>
            <p>Check back later for new products!</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Header Component
function Header() {
  const { getTotalItems } = useCart()
  
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>MyStore</Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/products" className={styles.navLink}>Products</Link>
          <Link href="/cart" className={styles.navLink}>
            Cart ({getTotalItems()})
          </Link>
          <Link href="/admin" className={styles.navLink}>Admin</Link>
        </div>
      </nav>
    </header>
  )
}
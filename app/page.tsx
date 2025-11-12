'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const products = await response.json()
        // Show first 6 products as featured
        setFeaturedProducts(products.slice(0, 6))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    })
    alert(`Added ${product.name} to cart!`)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Welcome to <span className={styles.highlight}>CarlStore</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover amazing products, from amazing carl. The prices are cheaper than your panties. 
              Your jaw may not drop but your panty will.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/products" className={styles.ctaButton}>
                Shop Now
              </Link>
              <Link href="/products" className={styles.secondaryButton}>
                View All Products
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>
              🛍️
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚚</div>
            <h3>Free Shipping</h3>
            <p>Free delivery basta naay kiss</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>↩️</div>
            <h3>Easy Returns</h3>
            <p>5-minute return policy for all items</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure Payment</h3>
            <p>Cash on Delivery rani</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📞</div>
            <h3>24/7 nga comfort</h3>
            <p>Tawagi rako para ma comfort ka</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featuredProducts}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Featured Products</h2>
          <p className={styles.sectionSubtitle}>Check out our most popular items</p>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading featured products...</div>
        ) : (
          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => (
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
                  {product.stock === 0 && (
                    <div className={styles.outOfStockBadge}>Out of Stock</div>
                  )}
                </div>
                <div className={styles.productContent}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>
                    {product.description.length > 80 
                      ? `${product.description.substring(0, 80)}...` 
                      : product.description
                    }
                  </p>
                  <div className={styles.productFooter}>
                    <span className={styles.productPrice}>₱{product.price.toFixed(2)}</span>
                    <button 
                      className={styles.addToCartButton}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && featuredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No products yet</h3>
            <p>Check back soon for amazing products!</p>
          </div>
        )}

        <div className={styles.ctaSection}>
          <Link href="/products" className={styles.viewAllButton}>
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>Find what you're looking for</p>
        </div>
        <div className={styles.categoriesGrid}>
          <Link href="/products?category=Electronics" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>📱</div>
            <h3>Gadgets</h3>
            <p>Mga kinawat na Cellphone</p>
          </Link>
          <Link href="/products?category=Clothing" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>👕</div>
            <h3>Clothing</h3>
            <p>Ukay Ukay rajuy naa</p>
          </Link>
          <Link href="/products?category=Accessories" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🕶️</div>
            <h3>Accessories</h3>
            <p>Basin OA ka, daghan mig accessories</p>
          </Link>
          <Link href="/products?category=Home" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>🏠</div>
            <h3>House</h3>
            <p>Gapamaligya pud mig balay, pero dulaan</p>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2 className={styles.newsletterTitle}>Coming Soon...</h2>
          <p className={styles.newsletterText}>
            Hulat lang sa mga products, kay mamaligya mig sha
          </p>
          
        </div>
      </section>
    </div>
  )
}

// Header Component
function Header() {
  const { getTotalItems } = useCart()

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🛍️</span>
          CarlStore
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/products" className={styles.navLink}>Products</Link>
          <Link href="/cart" className={styles.navLink}>
            Cart ({getTotalItems()})
          </Link>
          <Link href="/admin" className={styles.navLink}>🦷</Link>
        </div>
      </nav>
    </header>
  )
}
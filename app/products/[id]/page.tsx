'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

interface Product {
  _id: string
  name: string
  price: number
  description: string
  longDescription?: string
  image: string
  category: string
  stock: number
  features?: string[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) throw new Error('Product not found')
      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError('Product not found')
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

const { addItem } = useCart()
const router = useRouter()

const addToCart = () => {
  if (product) {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image
    })
    
    // Ask user if they want to go to cart
    if (confirm(`Added ${quantity} ${product.name}(s) to cart! Go to cart now?`)) {
      router.push('/cart')
    }
  }
}

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>Loading product...</div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <h2>Product Not Found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link href="/products" className={styles.continueShopping}>
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <div className={styles.breadcrumbContent}>
          <Link href="/">Home</Link>
          <span> / </span>
          <Link href="/products">Products</Link>
          <span> / </span>
          <span>{product.name}</span>
        </div>
      </nav>

      {/* Product Detail Main Content */}
      <main className={styles.main}>
        <div className={styles.productDetail}>
          {/* Product Image */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
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
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productCategory}>{product.category}</p>
            <p className={styles.productPrice}>₱{product.price.toFixed(2)}</p>
            
            <div className={styles.productDescription}>
              <p>{product.description}</p>
              {product.longDescription && (
                <p className={styles.longDescription}>{product.longDescription}</p>
              )}
            </div>

            {/* Stock Status */}
            <div className={styles.stockStatus}>
              {product.stock > 0 ? (
                <span className={styles.inStock}>In Stock ({product.stock} available)</span>
              ) : (
                <span className={styles.outOfStock}>Out of Stock</span>
              )}
            </div>

            {/* Quantity Selection */}
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Quantity:</label>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.quantityButton} 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className={styles.quantity}>{quantity}</span>
                <button 
                  className={styles.quantityButton} 
                  onClick={incrementQuantity}
                  disabled={!product.stock || quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button 
                className={styles.addToCartButton}
                onClick={addToCart}
                disabled={!product.stock}
              >
                {product.stock ? `Add ${quantity} to Cart` : 'Out of Stock'}
              </button>
              <button 
                className={styles.buyNowButton}
                disabled={!product.stock}
              >
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className={styles.additionalInfo}>
              <div className={styles.infoItem}>
                <strong>Free Shipping</strong> on orders over ₱1000
              </div>
              <div className={styles.infoItem}>
                <strong>30-Day Return</strong> policy
              </div>
              <div className={styles.infoItem}>
                <strong>Customer Support</strong> available 24/7
              </div>
            </div>
          </div>
        </div>
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
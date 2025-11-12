"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import styles from "./page.module.css";

interface CheckoutForm {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const subtotal = getTotalPrice();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.items.length === 0) return;

    // Basic form validation
    if (
      !formData.customerName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address:
          `${formData.address}, ${formData.city} ${formData.zipCode}`.trim(),
        items: state.items,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        alert(
          `🎉 Order placed successfully!\nOrder ID: ${
            order._id
          }\nTotal: ₱${total.toFixed(2)}`
        );
        clearCart();
        setShowCheckoutForm(false);
        setFormData({
          customerName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          zipCode: "",
        });
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            MyStore
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>
              Home
            </Link>
            <Link href="/products" className={styles.navLink}>
              Products
            </Link>
            <Link href="/cart" className={styles.navLink}>
              Cart (
              {state.items.reduce((total, item) => total + item.quantity, 0)})
            </Link>
            <Link href="/admin" className={styles.navLink}>
              👀
            </Link>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <div className={styles.breadcrumbContent}>
          <Link href="/">Home</Link>
          <span> / </span>
          <span>Shopping Cart</span>
        </div>
      </nav>

      {/* Cart Main Content */}
      <main className={styles.main}>
        <div className={styles.cartLayout}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.cartHeader}>
              <h1 className={styles.pageTitle}>Shopping Cart</h1>
              <span className={styles.itemCount}>
                {state.items.length}{" "}
                {state.items.length === 1 ? "item" : "items"}
              </span>
              {state.items.length > 0 && (
                <button onClick={clearCart} className={styles.clearCartButton}>
                  Clear Cart
                </button>
              )}
            </div>

            {state.items.length === 0 ? (
              <div className={styles.emptyCart}>
                <div className={styles.emptyCartIcon}>🛒</div>
                <h2>Your cart is empty</h2>
                <p>Browse our products and add some items to your cart</p>
                <Link href="/products" className={styles.continueShopping}>
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {state.items.map((item) => (
                  <div key={item.productId} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      {item.image && item.image !== "/placeholder.jpg" ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.productImage}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          Product Image
                        </div>
                      )}
                    </div>

                    <div className={styles.itemDetails}>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <p className={styles.itemPrice}>
                          ₱{item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className={styles.quantityControls}>
                        <div className={styles.quantitySelector}>
                          <button
                            className={styles.quantityButton}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <span className={styles.quantity}>
                            {item.quantity}
                          </span>
                          <button
                            className={styles.quantityButton}
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className={styles.removeButton}
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className={styles.itemTotal}>
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          {state.items.length > 0 && (
            <div className={styles.orderSummary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>
                    Subtotal (
                    {state.items.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}{" "}
                    items)
                  </span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className={styles.freeShipping}>FREE</span>
                    ) : (
                      `₱${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className={styles.summaryDivider}></div>

                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>

                {/* Free Shipping Progress */}
                {subtotal < 1000 && (
                  <div className={styles.shippingProgress}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        data-progress={(subtotal / 1000) * 100}
                      ></div>
                    </div>
                    <p className={styles.progressText}>
                      Add ₱{(1000 - subtotal).toFixed(2)} more for{" "}
                      <strong>FREE shipping</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Buttons */}
              <div className={styles.checkoutButtons}>
                {!showCheckoutForm ? (
                  <>
                    <button
                      className={styles.checkoutButton}
                      onClick={() => setShowCheckoutForm(true)}
                    >
                      Proceed to Checkout
                    </button>
                    <Link href="/products" className={styles.continueShopping}>
                      Continue Shopping
                    </Link>
                  </>
                ) : (
                  <form
                    onSubmit={handleCheckout}
                    className={styles.checkoutForm}
                  >
                    <h3 className={styles.formTitle}>Shipping Information</h3>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Full Name *</label>
                        <input
                          placeholder="Name"
                          type="text"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email *</label>
                        <input
                          placeholder="Email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone Number *</label>
                      <input
                        placeholder="Phone Number"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        placeholder="Street address"
                        required
                      />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>City</label>
                        <input
                          placeholder="city"
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={styles.formInput}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>ZIP Code</label>
                        <input
                          placeholder="zipCode"
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className={styles.formInput}
                        />
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.placeOrderButton}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading
                          ? "Placing Order..."
                          : `Place Order - ₱${total.toFixed(2)}`}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setShowCheckoutForm(false)}
                      >
                        Back to Cart
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Trust Badges */}
              {!showCheckoutForm && (
                <div className={styles.trustBadges}>
                  <div className={styles.badge}>
                    <span className={styles.badgeIcon}>🔒</span>
                    Secure Checkout
                  </div>
                  <div className={styles.badge}>
                    <span className={styles.badgeIcon}>↩️</span>
                    5-minute Returns
                  </div>
                  <div className={styles.badge}>
                    <span className={styles.badgeIcon}>🚚</span>
                    Free Shipping Over ₱696969
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

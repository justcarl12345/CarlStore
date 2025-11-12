'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // TEMPORARY: Simple authentication to access admin panel
    if (username === 'justcarl' && password === 'Carl122005') {
      localStorage.setItem('adminLoggedIn', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('AYAWG NAG UTRUHA!')
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>CarlStore🏪</Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/products" className={styles.navLink}>Products</Link>
            <Link href="/cart" className={styles.navLink}>Cart</Link>
            <Link href="/admin" className={styles.navLink}>🔷</Link>
          </div>
        </nav>
      </header>

      {/* Login Form */}
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <h1 className={styles.loginTitle}>Admin Login</h1>
            <p className={styles.loginSubtitle}></p>
            
            <form onSubmit={handleLogin} className={styles.loginForm}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" className={styles.loginButton}>
                Sign In
              </button>

              <div className={styles.demoCredentials}>
                <p><strong>Nganong naabot man ka dri? ulol</strong></p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, Menu, X, Instagram, Search, User } from 'lucide-react';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-left">
            <button className="mobile-menu-btn icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="desktop-only nav-group">
              <a href="#new" className="nav-link">New Arrivals</a>
              <a href="#abayas" className="nav-link">Abayas</a>
              <a href="#collections" className="nav-link">Collections</a>
            </div>
          </div>

          <div className="brand-logo">
            <span className="brand-text">MODENZAS</span>
          </div>

          <div className="nav-right">
            <div className="desktop-only nav-group" style={{ marginRight: '1.5rem' }}>
              <a href="#story" className="nav-link">Our Story</a>
            </div>
            <div className="nav-icons">
              <button className="icon-btn focus-ring"><Search size={20} strokeWidth={1.5} /></button>
              <button className="icon-btn focus-ring"><User size={20} strokeWidth={1.5} /></button>
              <button className="icon-btn focus-ring cart-btn">
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span className="cart-badge">2</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <a href="#new" onClick={() => setIsMenuOpen(false)}>New Arrivals</a>
          <a href="#abayas" onClick={() => setIsMenuOpen(false)}>Abayas</a>
          <a href="#collections" onClick={() => setIsMenuOpen(false)}>Collections</a>
          <a href="#story" onClick={() => setIsMenuOpen(false)}>Our Story</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
          <div className="glass-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">Discover the New Collection</div>
          <h1 className="hero-title">
            Elegance Restored.<br />
            <span className="hero-title-highlight">Modern Modesty.</span>
          </h1>
          <p className="hero-subtitle">
            Curated contemporary modest wear designed for the modern woman. Discover pieces that seamlessly blend tradition with avant-garde aesthetics.
          </p>
          <div className="hero-actions">
            <button className="btn-primary group">
              Shop the Collection
              <ArrowRight className="icon-transition group-hover:translate-x-1" size={18} />
            </button>
            <button className="btn-secondary">
              View Lookbook
            </button>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="collection">
        <div className="section-header">
          <h2 className="section-title">Signature Pieces</h2>
          <div className="title-underline"></div>
          <p className="section-subtitle">Elevate your everyday wardrobe with our carefully crafted essentials.</p>
        </div>

        <div className="product-grid">
          {/* Product 1 */}
          <div className="product-card">
            <div className="product-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80"
                alt="The Noir Classic Abaya"
                className="product-image"
              />
              <div className="product-overlay">
                <button className="btn-quick-add">Quick Add</button>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">The Noir Classic Abaya</h3>
              <p className="product-price">Rs. 8,500</p>
            </div>
          </div>

          {/* Product 2 */}
          <div className="product-card">
            <div className="product-image-wrapper">
              <span className="product-tag">Bestseller</span>
              <img
                src="https://images.unsplash.com/photo-1550639524-a6f58345a278?auto=format&fit=crop&q=80"
                alt="Desert Sand Open Abaya"
                className="product-image"
              />
              <div className="product-overlay">
                <button className="btn-quick-add">Quick Add</button>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">Desert Sand Open Abaya</h3>
              <p className="product-price">Rs. 9,200</p>
            </div>
          </div>

          {/* Product 3 */}
          <div className="product-card">
            <div className="product-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80"
                alt="Midnight Silk Slip & Wrap"
                className="product-image"
              />
              <div className="product-overlay">
                <button className="btn-quick-add">Quick Add</button>
              </div>
            </div>
            <div className="product-info">
              <h3 className="product-name">Midnight Silk Slip & Wrap</h3>
              <p className="product-price">Rs. 11,000</p>
            </div>
          </div>
        </div>

        <div className="view-all-container">
          <button className="btn-outline">View All Products</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col brand-col">
            <span className="footer-brand">MODENZAS</span>
            <p className="footer-desc">Redefining modest fashion with contemporary silhouettes, premium craftsmanship, and unparalleled elegance.</p>
            <div className="social-links">
              <a href="#" className="social-icon"><Instagram size={20} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><a href="#">All Products</a></li>
              <li><a href="#">New Arrivals</a></li>
              <li><a href="#">Abayas</a></li>
              <li><a href="#">Hijabs</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Size Guide</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Newsletter</h4>
            <p className="footer-desc" style={{ marginBottom: '1rem' }}>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" className="newsletter-input" />
              <button className="newsletter-btn"><ArrowRight size={18} /></button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Modenzas. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
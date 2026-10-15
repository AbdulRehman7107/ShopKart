import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import { getWishlist, removeFromWishlist } from "../services/api";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlistData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWishlist();
      if (response.success && Array.isArray(response.wishlist)) {
        setWishlist(response.wishlist);
      } else if (Array.isArray(response)) {
        setWishlist(response);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      if (err.message && err.message.toLowerCase().includes("auth")) {
        navigate("/login", { replace: true });
        return;
      }
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prevList) => prevList.filter((item) => item._id !== productId));
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
      alert("Failed to remove product from wishlist. Please try again.");
    }
  };

  return (
    <div className="wishlist-page-container">
      <Navbar />

      <main className="main-content">
        <header className="page-header">
          <h1>My Wishlist</h1>
          <p>
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
          </p>
        </header>

        {/* Task 7 — Loading State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading your wishlist...</p>
          </div>
        )}

        {/* Task 7 — Error State */}
        {!loading && error && (
          <div className="state-container error-state">
            <div className="empty-icon">⚠️</div>
            <h3>Something went wrong.</h3>
            <p className="error">{error}</p>
            <button onClick={fetchWishlistData} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Task 7 — Empty Wishlist State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="state-container empty-state">
            <div className="empty-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="retry-btn">
              Browse Products
            </Link>
          </div>
        )}

        {/* Wishlist Product Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="products-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

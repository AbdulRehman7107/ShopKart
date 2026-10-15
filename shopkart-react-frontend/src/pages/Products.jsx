import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { getProducts, getWishlist } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("");

  // Fetch initial wishlist IDs for current user
  useEffect(() => {
    getWishlist()
      .then((data) => {
        if (data.success && Array.isArray(data.wishlist)) {
          setWishlistIds(data.wishlist.map((item) => item._id));
        }
      })
      .catch((err) => {
        console.error("Could not fetch user wishlist for cards:", err);
      });
  }, []);

  // Fetch products whenever search, category, or sort changes
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getProducts({
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy,
        });

        if (response.success && Array.isArray(response.products)) {
          setProducts(response.products);
        } else if (Array.isArray(response)) {
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search query updates by 300ms
    const timer = setTimeout(() => {
      fetchProductsData();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleWishlistChange = (productId, isAdded) => {
    if (isAdded) {
      setWishlistIds((prev) => [...prev, productId]);
    } else {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="products-page-container">
      <Navbar />

      <main className="main-content">
        <header className="page-header">
          <h1>Product Catalog</h1>
          <p>Explore our curated selection of quality items</p>
        </header>

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Loading State */}
        {loading && (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p className="loading">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-container error-state">
            <p className="error">{error}</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSortBy("");
              }}
              className="retry-btn"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="state-container empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found.</h3>
            <p>Try searching for something else or clear your selected filters.</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isInitiallyWishlisted={wishlistIds.includes(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

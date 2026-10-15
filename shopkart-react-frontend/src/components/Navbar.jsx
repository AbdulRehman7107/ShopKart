import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutCustomer, getWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [wishlistCount, setWishlistCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getWishlist()
      .then((data) => {
        if (isMounted && data && typeof data.count === "number") {
          setWishlistCount(data.count);
        }
      })
      .catch(() => {
        if (isMounted) setWishlistCount(null);
      });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link className="logo" to="/products">
          ShopKart 🛒
        </Link>
      </div>

      <div className="navbar-links">
        <Link
          to="/products"
          className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}
        >
          Products
        </Link>
        <Link
          to="/wishlist"
          className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""}`}
        >
          Wishlist {wishlistCount !== null && wishlistCount > 0 ? `(${wishlistCount})` : ""}
        </Link>
        <Link
          to="/cart"
          className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
        >
          Cart ({totalItems})
        </Link>
        <Link
          to="/orders"
          className={`nav-link ${location.pathname.startsWith("/orders") ? "active" : ""}`}
        >
          My Orders
        </Link>
        <Link
          to="/home"
          className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
        >
          My Profile
        </Link>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

export default function Login() {
  const navigate = useNavigate(); const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try { setLoading(true); setError(""); await loginCustomer(form); navigate("/home"); }
    catch (err) { setError(err.message === "Invalid credentials" ? "Invalid credentials" : err.message); }
    finally { setLoading(false); }
  };
  return <section className="auth-page"><form className="auth-card" onSubmit={handleSubmit}>
    <h1>ShopKart</h1><h2>Sign in</h2><p>Enter your details to continue.</p>
    <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
    <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
    {(error || location.state?.message) && <p className={error ? "error" : "success"}>{error || location.state.message}</p>}
    <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    <p className="switch">New customer? <Link to="/register">Create account</Link></p>
  </form></section>;
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) return setError("All fields are required.");
    if (form.password.length < 6) return setError("Password must contain at least 6 characters.");
    try {
      setLoading(true); setError("");
      await registerCustomer(form);
      navigate("/login", { state: { message: "Account created. Please sign in." } });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <section className="auth-page"><form className="auth-card" onSubmit={handleSubmit}>
    <h1>ShopKart</h1><h2>Create account</h2><p>Create your customer account.</p>
    <label>Full name<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
    <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
    <label>Phone number<input name="phone" value={form.phone} onChange={handleChange} required /></label>
    <label>Password<input name="password" type="password" value={form.password} onChange={handleChange} minLength="6" required /></label>
    {error && <p className="error">{error}</p>}<button disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
    <p className="switch">Already registered? <Link to="/login">Sign in</Link></p>
  </form></section>;
}

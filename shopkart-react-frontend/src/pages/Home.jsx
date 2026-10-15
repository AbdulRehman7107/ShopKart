import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    getCurrentCustomer().then(setCustomer).catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  if (!customer) return <p className="loading">Loading your profile...</p>;

  return <><Navbar /><main className="home"><h1>Welcome, {customer.fullName}!</h1><p>You are logged in to ShopKart.</p><section className="profile-card"><h2>Your details</h2><p><strong>Name:</strong> {customer.fullName}</p><p><strong>Email:</strong> {customer.email}</p><p><strong>Phone:</strong> {customer.phone}</p></section></main></>;
}

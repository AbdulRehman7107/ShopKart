async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

// Auth APIs
export const registerCustomer = (customer) =>
  request("/customers/register", { method: "POST", body: JSON.stringify(customer) });

export const loginCustomer = (credentials) =>
  request("/customers/login", { method: "POST", body: JSON.stringify(credentials) });

export const getCurrentCustomer = () =>
  request("/customers/me");

export const logoutCustomer = () =>
  request("/customers/logout", { method: "POST" });

// Product APIs (Lab 03)
export const getProducts = async ({ search, category, sort } = {}) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (category && category !== "All") queryParams.append("category", category);
  if (sort) queryParams.append("sort", sort);

  const queryString = queryParams.toString();
  const url = queryString ? `/products?${queryString}` : "/products";
  return request(url);
};

export const getProductById = async (id) => {
  return request(`/products/${id}`);
};

export const createProduct = async (productData) => {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

// Wishlist APIs (Lab 04)
export const getWishlist = () => request("/wishlist");

export const addToWishlist = (productId) =>
  request(`/wishlist/${productId}`, { method: "POST" });

export const removeFromWishlist = (productId) =>
  request(`/wishlist/${productId}`, { method: "DELETE" });

export const toggleWishlist = (productId) =>
  request(`/wishlist/${productId}/toggle`, { method: "PATCH" });

// Cart APIs (Lab 05)
export const getCart = () => request("/cart");

export const addToCart = (productId, quantity = 1) =>
  request(`/cart/${productId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });

export const updateCartQuantity = (productId, quantity) =>
  request(`/cart/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (productId) =>
  request(`/cart/${productId}`, { method: "DELETE" });

// Order APIs (Lab 06)
export const createPaymentOrder = (shippingAddress) =>
  request("/orders/create-payment-order", {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });

export const verifyPayment = (data) =>
  request("/orders/verify-payment", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMyOrders = () => request("/orders");

export const getOrderById = (id) => request(`/orders/${id}`);

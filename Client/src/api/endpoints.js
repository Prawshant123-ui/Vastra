import api from "./axios.js";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (email) => api.post("/auth/resend-verification", { email }),
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  byId: (id) => api.get(`/products/${id}`),
  bySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (formData) => api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) => api.patch(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/products/${id}`),
  removeImage: (id, imageId) => api.delete(`/products/${id}/images/${imageId}`),
};

export const categoryApi = {
  list: () => api.get("/categories"),
  byId: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get("/cart"),
  add: (productId, quantity = 1) => api.post("/cart", { productId, quantity }),
  update: (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete("/cart"),
};

export const wishlistApi = {
  get: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const addressApi = {
  list: () => api.get("/addresses"),
  add: (data) => api.post("/addresses", data),
  update: (id, data) => api.patch(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
};

export const orderApi = {
  place: (data) => api.post("/orders", data),
  mine: () => api.get("/orders/my"),
  byId: (id) => api.get(`/orders/my/${id}`),
  cancel: (id) => api.patch(`/orders/my/${id}/cancel`),
  adminList: (params) => api.get("/orders/admin", { params }),
  adminUpdateStatus: (id, status) => api.patch(`/orders/admin/${id}/status`, { status }),
};

export const paymentApi = {
  initiate: (orderId) => api.post("/payments/initiate", { orderId }),
  verify: (params) => api.get("/payments/verify", { params }),
  byOrder: (orderId) => api.get(`/payments/order/${orderId}`),
};

export const analyticsApi = {
  get: () => api.get("/analytics"),
};

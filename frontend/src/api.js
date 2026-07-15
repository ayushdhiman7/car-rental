// Tiny fetch wrapper around the backend REST API.
// Set VITE_API_BASE to the full API origin, e.g. https://your-api.onrender.com/api
const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

if (!BASE) {
  console.warn("VITE_API_BASE is not set. API requests will fail.");
}

async function request(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getCars: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return request(`/cars${qs ? "?" + qs : ""}`);
  },
  getCar: (id) => request(`/cars/${id}`),
  getCategories: () => request("/categories"),
  createBooking: (body) =>
    request("/bookings", { method: "POST", body: JSON.stringify(body) }),
  getBookings: (email) =>
    request(`/bookings${email ? "?email=" + encodeURIComponent(email) : ""}`),
};

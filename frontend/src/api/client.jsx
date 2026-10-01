const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8007";

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = new Error(
      data?.detail || `Request failed (${response.status})`,
    );
    error.response = { status: response.status, data };
    throw error;
  }
  return { data, status: response.status };
}

const client = {
  get: (path) => request(path),
  post: (path, body, options = {}) =>
    request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...options.headers },
      body: body instanceof URLSearchParams ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default client;


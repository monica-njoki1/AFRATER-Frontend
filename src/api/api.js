const BASE_URL = "https://afrater-backend.onrender.com";

// -------- TOKEN HELPERS --------
const saveToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");
const removeToken = () => localStorage.removeItem("token");

// -------- BASE FETCH WRAPPER --------
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  // Ping the server first if it might be cold (optional but helps on Render free tier)
  const res = await fetch(url, {
    mode: "cors",
    ...options,
    headers: {
      ...options.headers,
    },
  });

  // Render sometimes returns an HTML error page instead of JSON when cold-starting
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server is starting up, please try again in a few seconds.");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

// -------- REGISTER --------
export async function registerUser({ name, email, password, profile_pic }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  if (profile_pic) formData.append("profile_pic", profile_pic);

  // NOTE: Do NOT set Content-Type for FormData — browser sets it automatically with boundary
  return apiFetch("/auth/register", {
    method: "POST",
    body: formData,
  });
}

// -------- LOGIN --------
export async function loginUser(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (data.token) saveToken(data.token);
  return data;
}

// -------- LOGOUT --------
export async function logoutUser() {
  const token = getToken();

  const data = await apiFetch("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  removeToken();
  return data;
}

// -------- GET PROFILE --------
export async function getProfile() {
  const token = getToken();

  return apiFetch("/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// -------- UPDATE PROFILE --------
export async function updateProfile({ name, email, profile_pic }) {
  const token = getToken();
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (email) formData.append("email", email);
  if (profile_pic) formData.append("profile_pic", profile_pic);

  return apiFetch("/auth/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

// -------- DELETE ACCOUNT --------
export async function deleteAccount() {
  const token = getToken();

  const data = await apiFetch("/auth/delete", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  removeToken();
  return data;
}
const BASE_URL = "http://127.0.0.1:5000";

// -------- TOKEN HELPERS --------
const saveToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");
const removeToken = () => localStorage.removeItem("token");

// -------- REGISTER --------
export async function registerUser({ name, email, password, profile_pic }) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  if (profile_pic) formData.append("profile_pic", profile_pic);

  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  
  // ✅ Check if the response was successful
  if (!res.ok) {
    throw new Error(data.error || data.message || "Registration failed");
  }
  
  return data;
}

// -------- LOGIN --------
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  
  // ✅ Check if the response was successful
  if (!res.ok) {
    throw new Error(data.error || data.message || "Login failed");
  }
  
  if (data.token) saveToken(data.token);
  return data;
}

// -------- DELETE ACCOUNT --------
export async function deleteAccount() {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/auth/delete`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  
  // ✅ Check if the response was successful
  if (!res.ok) {
    throw new Error(data.error || data.message || "Failed to delete account");
  }

  removeToken();
  return data;
}
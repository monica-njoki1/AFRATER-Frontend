const BASE_URL = "https://afrater-backend.onrender.com";

// -------- TOKEN HELPERS --------
const saveToken = (token) => localStorage.setItem("token", token);
const getToken = () => localStorage.getItem("token");
const removeToken = () => localStorage.removeItem("token");

// -------- BASE FETCH WRAPPER --------
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    mode: "cors",
    ...options,
    headers: {
      ...options.headers,
    },
  });

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
    headers: { Authorization: `Bearer ${token}` },
  });
  removeToken();
  return data;
}

// -------- GET PROFILE --------
export async function getProfile() {
  const token = getToken();
  return apiFetch("/auth/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// -------- DELETE ACCOUNT --------
export async function deleteAccount(password) {
  const token = getToken();
  const data = await apiFetch("/auth/delete", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  removeToken();
  return data;
}

// ================================================================
//  FRAUD API
// ================================================================

// -------- CHECK MESSAGE --------
export async function checkMessage(message) {
  const token = getToken();
  return apiFetch("/scam/check", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
}

// -------- UPLOAD SCREENSHOT --------
export async function uploadScreenshot(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/upload/screenshot", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// -------- INITIATE PAYMENT (STK Push with pre-flight fraud check) --------
export async function initiatePayment(phone, amount) {
  const token = getToken();
  return apiFetch("/mpesa/pay", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, amount }),
  });
}

// -------- POLL PAYMENT STATUS --------
export async function pollPaymentStatus(checkoutRequestId) {
  const token = getToken();
  return apiFetch(`/query/stk/${checkoutRequestId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// -------- GET SCAM REPORTS --------
export async function getScamReports() {
  const token = getToken();
  return apiFetch("/scam/reports", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// -------- GET TRANSACTIONS --------
export async function getTransactions() {
  const token = getToken();
  return apiFetch("/transactions/", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
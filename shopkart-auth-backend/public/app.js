const loginForm = document.querySelector("#loginForm");
const message = document.querySelector("#message");
const profile = document.querySelector("#profile");

function showMessage(text, success = false) {
  message.textContent = text;
  message.classList.toggle("success", success);
}

function showProfile(customer) {
  document.querySelector("#profileName").textContent = customer.fullName;
  document.querySelector("#profileEmail").textContent = customer.email;
  loginForm.classList.add("hidden");
  profile.classList.remove("hidden");
  showMessage("Login successful.", true);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = Object.fromEntries(new FormData(loginForm));
  try {
    const response = await fetch("/customers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    showProfile(data.customer);
  } catch (error) {
    showMessage(error.message);
  }
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  await fetch("/customers/logout", { method: "POST", credentials: "include" });
  loginForm.reset();
  loginForm.classList.remove("hidden");
  profile.classList.add("hidden");
  showMessage("Logged out successfully.", true);
});

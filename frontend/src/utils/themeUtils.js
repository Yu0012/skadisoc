export function setTheme(theme) {
  document.documentElement.setAttribute("data-selected-theme", theme);
  localStorage.setItem("theme", theme);
}

export function getStoredTheme() {
  return localStorage.getItem("theme") || "light";
}

export function toggleTheme(currentTheme) {
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme);
  return nextTheme;
}

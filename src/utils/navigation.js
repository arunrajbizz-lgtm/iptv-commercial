export function normalizeRoute(path) {
  const value = String(path || "/dashboard").trim();
  if (!value) return "/dashboard";
  return value.startsWith("/") ? value : `/${value}`;
}

export function navigateTo(path) {
  window.location.hash = normalizeRoute(path);
}

const PUBLIC_API_BASE = "http://127.0.0.1:8000/api/public";
async function publicRequest(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${PUBLIC_API_BASE}${path}${query ? `?${query}` : ""}`;
  const r = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  const d = await r.json();
  if (!r.ok) throw d;
  return d;
}
export function getPublicServices(filters = {}) { return publicRequest("/services", filters); }
export function getPublicService(publicId) { return publicRequest(`/services/${publicId}`); }
export function getPublicCategories() { return publicRequest("/categories"); }
export function getPublicProviders(params = {}) { return publicRequest("/providers", params); }
export function getPublicProvider(publicId) { return publicRequest(`/providers/${publicId}`); }
export function getPublicWantedAds(params = {}) { return publicRequest("/wanted-ads", params); }
export function getPublicWantedAd(publicId) { return publicRequest(`/wanted-ads/${publicId}`); }

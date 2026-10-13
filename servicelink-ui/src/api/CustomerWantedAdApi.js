const API_BASE = "http://127.0.0.1:8000/api";
import { getAuthToken } from "./authApi.js";
function authHeaders(){return{"Accept":"application/json","Content-Type":"application/json","Authorization":`Bearer ${getAuthToken()}`};}
export async function getCustomerWantedAds(){const r=await fetch(`${API_BASE}/customer/wanted-ads`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function createWantedAd(p){const r=await fetch(`${API_BASE}/customer/wanted-ads`,{method:"POST",headers:authHeaders(),body:JSON.stringify(p)});const d=await r.json();if(!r.ok)throw d;return d;}
export async function getWantedAd(id){const r=await fetch(`${API_BASE}/customer/wanted-ads/${id}`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function updateWantedAd(id,p){const r=await fetch(`${API_BASE}/customer/wanted-ads/${id}`,{method:"PUT",headers:authHeaders(),body:JSON.stringify(p)});const d=await r.json();if(!r.ok)throw d;return d;}
export async function closeWantedAd(id){const r=await fetch(`${API_BASE}/customer/wanted-ads/${id}`,{method:"DELETE",headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function getOffersForAd(id){const r=await fetch(`${API_BASE}/customer/wanted-ads/${id}/offers`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function getAllOffers(){const r=await fetch(`${API_BASE}/customer/offers`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function getOfferDetails(offerId){const r=await fetch(`${API_BASE}/customer/offers/${offerId}`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}
export async function acceptOffer(adId,offerId,note=null){const r=await fetch(`${API_BASE}/customer/wanted-ads/${adId}/offers/${offerId}/accept`,{method:"POST",headers:authHeaders(),body:JSON.stringify({customer_response_note:note})});const d=await r.json();if(!r.ok)throw d;return d;}
export async function declineOffer(adId,offerId,note=null){const r=await fetch(`${API_BASE}/customer/wanted-ads/${adId}/offers/${offerId}/decline`,{method:"POST",headers:authHeaders(),body:JSON.stringify({customer_response_note:note})});const d=await r.json();if(!r.ok)throw d;return d;}
export async function getActiveCategories(){const r=await fetch(`${API_BASE}/customer/categories`,{headers:authHeaders()});const d=await r.json();if(!r.ok)throw d;return d;}

const API_BASE = "http://127.0.0.1:8000/api";
import { getAuthToken } from "./authApi.js";

// Helper: Build auth headers with Bearer token
function authHeaders(){
  return {
    "Accept":"application/json",
    "Content-Type":"application/json",
    "Authorization":`Bearer ${getAuthToken()}`
  };
}

/**
 * GET /customer/dashboard/stats
 * Returns real dashboard metrics from DB:
 * - upcoming_bookings, active_wanted_ads, offers_received, unread_alerts
 * - bookings breakdown, wanted_ads breakdown, offers breakdown
 * - recent_bookings, recent_wanted_ads, recent_offers (latest 3 each)
 */
export async function getDashboardStats(){
  const r = await fetch(`${API_BASE}/customer/dashboard/stats`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d; // {success, data: {upcoming_bookings, active_wanted_ads, ...}}
}

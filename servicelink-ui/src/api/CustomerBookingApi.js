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
 * GET /customer/bookings
 * Fetch all bookings for logged-in customer
 * Returns array with provider_name, public_id, agreed_amount, status etc.
 */
export async function getCustomerBookings(){
  const r = await fetch(`${API_BASE}/customer/bookings`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d; // {success, data: [bookings]}
}

/**
 * GET /customer/bookings/{publicId}
 * Fetch single booking details + timeline history + related offer
 * Used in Booking Details page
 */
export async function getCustomerBooking(publicId){
  const r = await fetch(`${API_BASE}/customer/bookings/${publicId}`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d; // {success, data: booking, history: [...], related_offer}
}

/**
 * POST /customer/bookings/{publicId}/cancel
 * Cancel an accepted booking - moves status to cancelled
 */
export async function cancelCustomerBooking(publicId, note=null){
  const r = await fetch(`${API_BASE}/customer/bookings/${publicId}/cancel`,{
    method:"POST",
    headers:authHeaders(),
    body:JSON.stringify({note})
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * POST /customer/bookings/{publicId}/complete
 * Mark booking completed - enables review flow
 */
export async function completeCustomerBooking(publicId){
  const r = await fetch(`${API_BASE}/customer/bookings/${publicId}/complete`,{
    method:"POST",
    headers:authHeaders()
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * GET /customer/bookings/stats
 * For dashboard metrics: counts per status
 */
export async function getBookingStats(){
  const r = await fetch(`${API_BASE}/customer/bookings/stats`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}


/**
 * POST /customer/bookings
 * Create direct booking from service page
 */
export async function createCustomerBooking(payload){
  const r = await fetch(`${API_BASE}/customer/bookings`,{
    method:"POST",
    headers:authHeaders(),
    body:JSON.stringify(payload)
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

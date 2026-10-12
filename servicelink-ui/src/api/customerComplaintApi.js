const API_BASE = "http://127.0.0.1:8000/api";
import { getAuthToken } from "./authApi.js";

function authHeaders(){
  return {
    "Accept":"application/json",
    "Content-Type":"application/json",
    "Authorization":`Bearer ${getAuthToken()}`
  };
}

/**
 * GET /customer/complaints
 * List my complaints from DB
 */
export async function getMyComplaints(){
  const r = await fetch(`${API_BASE}/customer/complaints`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * GET /customer/complaints/{publicId}
 * Single complaint with responses timeline
 */
export async function getComplaint(publicId){
  const r = await fetch(`${API_BASE}/customer/complaints/${publicId}`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * GET /customer/complaints/eligible-bookings
 * Bookings that can be complained about
 */
export async function getEligibleBookingsForComplaint(){
  const r = await fetch(`${API_BASE}/customer/complaints/eligible-bookings`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * POST /customer/complaints
 * Submit complaint: {booking_public_id?, subject, description, category?}
 */
export async function createComplaint(payload){
  const r = await fetch(`${API_BASE}/customer/complaints`,{
    method:"POST",
    headers:authHeaders(),
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

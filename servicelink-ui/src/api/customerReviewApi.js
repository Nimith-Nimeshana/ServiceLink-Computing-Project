//Frontend API for real reviews - only completed BK-xxx can be reviewed

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
 * GET /customer/reviews
 * List my reviews from DB
 */
export async function getMyReviews(){
  const r = await fetch(`${API_BASE}/customer/reviews`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * GET /customer/reviews/eligible
 * Completed bookings with no review yet - for "Review another" button
 */
export async function getEligibleBookings(){
  const r = await fetch(`${API_BASE}/customer/reviews/eligible`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * GET /customer/bookings/{publicId}/review-info
 * Check if specific booking can be reviewed
 */
export async function getReviewInfo(publicId){
  const r = await fetch(`${API_BASE}/customer/bookings/${publicId}/review-info`,{headers:authHeaders()});
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

/**
 * POST /customer/bookings/{publicId}/reviews
 * Submit rating 1-5 and comment
 */
export async function createReview(publicId, payload){
  // payload: {rating: 5, comment: "..."}
  const r = await fetch(`${API_BASE}/customer/bookings/${publicId}/reviews`,{
    method:"POST",
    headers:authHeaders(),
    body: JSON.stringify(payload)
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}
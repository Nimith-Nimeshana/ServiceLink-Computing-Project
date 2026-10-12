const API_BASE = "http://127.0.0.1:8000/api";
import { getAuthToken } from "./authApi.js";

function authHeaders(){
  return {
    "Accept":"application/json",
    "Content-Type":"application/json",
    "Authorization":`Bearer ${getAuthToken()}`
  };
}

export async function getCustomerNotifications(){
  const r = await fetch(`${API_BASE}/customer/notifications`, { headers: authHeaders() });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

export async function getUnreadCount(){
  const r = await fetch(`${API_BASE}/customer/notifications/unread-count`, { headers: authHeaders() });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

export async function markNotificationAsRead(publicId){
  const r = await fetch(`${API_BASE}/customer/notifications/${publicId}/read`, {
    method: "POST",
    headers: authHeaders()
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

export async function markAllNotificationsAsRead(){
  const r = await fetch(`${API_BASE}/customer/notifications/read-all`, {
    method: "POST",
    headers: authHeaders()
  });
  const d = await r.json();
  if(!r.ok) throw d;
  return d;
}

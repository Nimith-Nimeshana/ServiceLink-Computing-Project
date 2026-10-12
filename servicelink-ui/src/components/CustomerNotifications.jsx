import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Clock3 } from "lucide-react";
import { getCustomerNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../api/customerNotificationApi.js";

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}

export default function CustomerNotifications({ showNotice, onUnreadChange }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ total_count: 0, unread_count: 0, read_count: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCustomerNotifications();
      setItems(res.data?.items || []);
      const sum = res.data?.summary || { total_count: 0, unread_count: 0, read_count: 0 }; setSummary(sum); onUnreadChange?.(sum.unread_count);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkOne = async (publicId) => {
    try {
      await markNotificationAsRead(publicId);
      setItems(prev => prev.map(n => n.public_id === publicId ? { ...n, read_at: new Date().toISOString(), is_read: true } : n));
      setSummary(s => ({ ...s, unread_count: Math.max(0, s.unread_count - 1), read_count: s.read_count + 1 }));
      showNotice?.("Marked as read");
    } catch (e) {
      showNotice?.(e.message || "Failed");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString(), is_read: true })));
      setSummary(s => { const newS = { ...s, unread_count: 0, read_count: s.total_count }; onUnreadChange?.(0); return newS; });
      showNotice?.("All marked as read");
    } catch (e) {
      showNotice?.(e.message || "Failed");
    }
  };

  const handleClick = (item) => {
    if (!item.is_read) handleMarkOne(item.public_id);
    if (item.action_path) {
      navigate(item.action_path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="mb-6"><h2 className="text-3xl font-black">Notifications</h2><p className="mt-2 text-slate-500">Loading your activity...</p></div>
        {[1,2,3].map(i => <GlassPanel key={i} className="p-5 animate-pulse"><div className="h-4 w-1/3 bg-slate-200 rounded" /><div className="mt-3 h-3 w-full bg-slate-100 rounded" /></GlassPanel>)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">Notifications</h2>
          <p className="mt-2 max-w-2xl text-slate-500">
            Booking, offer, complaint and account activity appears here. {summary.unread_count > 0 ? `${summary.unread_count} unread.` : "All caught up!"}
          </p>
        </div>
        {summary.unread_count > 0 && (
          <button onClick={handleMarkAll} className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">
            <CheckCheck size={17} />Mark all read
          </button>
        )}
      </div>

      {error && <GlassPanel className="p-5 mb-4 border-rose-200 bg-rose-50/70"><p className="text-sm font-bold text-rose-700">{error}</p></GlassPanel>}

      <div className="space-y-3">
        {items.length === 0 ? (
          <GlassPanel className="p-8 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Bell size={22} /></div>
            <h3 className="mt-4 font-black">No notifications yet</h3>
            <p className="mt-1 text-sm text-slate-500">When providers send offers, bookings update, or complaints change, you will see them here.</p>
          </GlassPanel>
        ) : (
          items.map((item) => (
            <GlassPanel key={item.public_id || item.id} className={`p-5 cursor-pointer transition hover:shadow-lg ${!item.is_read ? "ring-2 ring-blue-200 bg-white/90" : ""}`}>
              <div className="flex gap-4" onClick={() => handleClick(item)}>
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${!item.is_read ? "bg-blue-600" : "bg-slate-300"}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black">{item.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${!item.is_read ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.type || "general"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock3 size={12} />{item.time_ago || new Date(item.created_at).toLocaleString()}</span>
                    {item.related_public_id && <span>• {item.related_public_id}</span>}
                  </div>
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { CalendarDays, BriefcaseBusiness, WalletCards, Bell, ChevronRight, MapPin, Clock3 } from "lucide-react";
import { getDashboardStats } from "../api/customerDashboardApi.js";

// Shows: upcoming bookings, active wanted ads, offers received, unread alerts
// Plus recent bookings, recent wanted ads, recent offers

function CustomerDashboard({ go }) {
  // STATE: stats from API, loading flag
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // EFFECT: Fetch dashboard stats on mount
  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then((res) => {
        // API returns {success, data: {upcoming_bookings, active_wanted_ads, ...}}
        setStats(res.data);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // LOADING STATE: Keep glossy panel style
  if (loading) {
    return (
      <div className="space-y-7">
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl">
          <p className="font-bold text-slate-500">Loading dashboard from database...</p>
        </div>
      </div>
    );
  }

  // If stats failed, fallback to empty
  if (!stats) {
    return (
      <div className="space-y-7">
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 text-center">
          <p className="font-black">Failed to load dashboard</p>
          <p className="mt-2 text-sm text-slate-500">Check if API route /customer/dashboard/stats exists</p>
        </div>
      </div>
    );
  }

  // Metrics for top cards - same order and style as your original Dashboard
  // Uses real values from DB instead of dummy 1,1,4,2
  const metrics = [
    [CalendarDays, "Upcoming bookings", stats.upcoming_bookings ?? stats.bookings?.accepted ?? 0, "bg-blue-100 text-emerald-700"],
    [BriefcaseBusiness, "Active wanted ads", stats.active_wanted_ads ?? stats.wanted_ads?.active ?? 0, "bg-violet-100 text-violet-700"],
    [WalletCards, "Offers received", stats.offers_received ?? stats.offers?.pending ?? 0, "bg-emerald-100 text-emerald-700"],
    [Bell, "Unread alerts", stats.unread_alerts ?? 0, "bg-amber-100 text-amber-700"],
  ];

  return (
    <div className="space-y-7">
      {/* WELCOME BANNER - same as original */}
      <div className="overflow-hidden rounded-[1.7rem] border border-white/90 bg-gradient-to-r from-slate-950 to-emerald-900 p-7 text-white shadow-[0_18px_55px_rgba(39,75,120,0.09)]">
        <p className="text-sm font-bold text-emerald-300">WELCOME BACK</p>
        <h2 className="mt-2 text-3xl font-black">What do you need help with today?</h2>
        <p className="mt-3 max-w-2xl text-slate-300">Browse listed services or describe the work and receive offers from approved providers. Real data from your database.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => go("/services")} className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-emerald-700">Browse services</button>
          <button onClick={() => go("/customer/wanted-ads/create")} className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold">Post a wanted ad</button>
        </div>
      </div>

      {/* METRICS CARDS - Real counts from DB */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([Icon, label, value, colour]) => (
          <div key={label} className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${colour}`}>
              <Icon size={20} />
            </div>
            <p className="mt-5 text-3xl font-black">{value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* RECENT SECTION: 3 columns - recent bookings, wanted ads, offers */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* RECENT BOOKINGS */}
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">Recent Bookings</h3>
            <button onClick={() => go("/customer/bookings")} className="text-xs font-extrabold text-emerald-600">View all</button>
          </div>
          <div className="space-y-3">
            {(stats.recent_bookings || []).length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet. Accept an offer to create BK-xxx.</p>
            ) : (
              stats.recent_bookings.map((b) => (
                <div key={b.public_id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-100 text-emerald-700"><CalendarDays size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{b.title}</p>
                    <p className="text-xs text-slate-500">{b.public_id} · {b.provider_name}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT WANTED ADS */}
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">My Wanted Ads</h3>
            <button onClick={() => go("/customer/wanted-ads")} className="text-xs font-extrabold text-emerald-600">View all</button>
          </div>
          <div className="space-y-3">
            {(stats.recent_wanted_ads || []).length === 0 ? (
              <p className="text-sm text-slate-500">No wanted ads yet. Post your first WA-xxx.</p>
            ) : (
              stats.recent_wanted_ads.map((ad) => (
                <div key={ad.public_id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-700"><BriefcaseBusiness size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{ad.title}</p>
                    <p className="text-xs text-slate-500">{ad.public_id} · {ad.status} · {ad.offers_count || 0} offers</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT OFFERS */}
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-black">Offers Received</h3>
            <button onClick={() => go("/customer/offers")} className="text-xs font-extrabold text-emerald-600">View all</button>
          </div>
          <div className="space-y-3">
            {(stats.recent_offers || []).length === 0 ? (
              <p className="text-sm text-slate-500">No offers yet. Providers will submit here.</p>
            ) : (
              stats.recent_offers.map((o) => (
                <div key={o.public_id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><WalletCards size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{o.provider_name}</p>
                    <p className="text-xs text-slate-500">LKR {Number(o.proposed_price).toLocaleString()} · {o.public_id}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerDashboard;
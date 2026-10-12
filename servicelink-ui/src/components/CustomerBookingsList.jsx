import React, { useEffect, useState, useMemo } from "react";
import { CalendarDays, Clock3, WalletCards, MapPin } from "lucide-react";
import { getCustomerBookings } from "../api/customerBookingApi.js";

function CustomerBookingsList({ go }) {
  // STATE: bookings from DB, filter, loading
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // EFFECT: Fetch bookings on mount
  useEffect(() => {
    setLoading(true);
    getCustomerBookings()
      .then((res) => {
        // API returns {success, data: [...bookings]}
        setBookings(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load bookings", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // FILTER: all / accepted / completed / cancelled - matches DB status values
  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => (b.status || "").toLowerCase() === filter);
  }, [bookings, filter]);

  // Helper: Format price from DECIMAL field agreed_amount
  const formatPrice = (b) => {
    if (b.agreed_amount) return `LKR ${Number(b.agreed_amount).toLocaleString()}`;
    return b.price || "—";
  };

  // Helper: Status badge color - same as your original StatusBadge logic
  const statusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") return "bg-blue-100 text-blue-700";
    if (s === "completed") return "bg-emerald-100 text-emerald-700";
    if (s === "cancelled") return "bg-rose-100 text-rose-700";
    return "bg-slate-100 text-slate-600";
  };

  // LOADING STATE: Keep glossy panel style
  if (loading) {
    return (
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl">
        <p className="font-bold text-slate-500">Loading your bookings from database...</p>
      </div>
    );
  }

  return (
    <div>
      {/* PAGE HEADER: Same as your PageLead component style */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">My Bookings</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Track direct bookings and work created from accepted provider offers. Real data from bookings table.</p>
        </div>
        <button onClick={() => go("/services")} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">
          Browse services
        </button>
      </div>

      {/* FILTER TABS: Same as original FilterTabs */}
      <div className="flex flex-wrap gap-2">
        {["all","accepted","completed","cancelled"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${filter === item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>
            {item}
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 ? (
        <div className="mt-5 rounded-[1.7rem] border border-white/90 bg-white/70 p-10 text-center backdrop-blur-2xl">
          <p className="text-lg font-black">No bookings in {filter}</p>
          <p className="mt-2 text-sm text-slate-500">When you accept a provider offer, booking BK-xxx will appear here automatically.</p>
          <button onClick={() => go("/customer/wanted-ads")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">View my wanted ads</button>
        </div>
      ) : (
        /* BOOKINGS GRID: Each card is GlassPanel style */
        <div className="mt-5 space-y-4">
          {filtered.map((b) => (
            <div key={b.public_id} className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* ICON: Calendar icon per booking */}
                <div className="grid h-13 w-13 place-items-center rounded-2xl bg-blue-100 text-blue-700">
                  <CalendarDays size={22} />
                </div>
                
                {/* MAIN INFO: Title, provider, source */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">{b.title}</h3>
                    {/* STATUS BADGE */}
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold capitalize ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  {/* SUBTITLE: public_id + provider_name + source */}
                  <p className="mt-1 text-sm text-slate-500">
                    {b.public_id} · {b.provider_name || "Provider"} · {b.source || "Accepted offer"}
                  </p>
                  
                  {/* META ROW: Date, price, commission info */}
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><CalendarDays size={15} />{b.date_display || (b.created_at ? new Date(b.created_at).toLocaleDateString() : "—")}</span>
                    <span className="flex items-center gap-1.5"><WalletCards size={15} />{formatPrice(b)}</span>
                    {b.commission_amount && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">Commission: LKR {Number(b.commission_amount).toLocaleString()} (10%)</span>
                    )}
                  </div>
                </div>

                {/* ACTION: View details */}
                <button onClick={() => go(`/customer/bookings/${b.public_id}`)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerBookingsList;

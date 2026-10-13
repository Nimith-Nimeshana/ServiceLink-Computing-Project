import React, { useEffect, useState } from "react";
import { Star, CalendarDays, ChevronRight } from "lucide-react";
import { getMyReviews, getEligibleBookings } from "../api/customerReviewApi.js";

// reviews list from DB
// Shows my reviews + eligible completed bookings without reviews

function CustomerReviewsList({ go }) {
  const [reviews, setReviews] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, 5, 4, 3...

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyReviews(), getEligibleBookings()])
      .then(([revRes, eligRes]) => {
        setReviews(revRes.data || []);
        setEligible(eligRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    return String(r.rating) === String(filter);
  });

  if (loading) {
    return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Loading your reviews from database...</p></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em]">My Reviews</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Reviews can only be submitted after eligible completed bookings (BK-xxx status = completed). Real data from DB.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["all","5","4","3","2","1"].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${filter===item ? "bg-slate-950 text-white" : "bg-white/70 text-slate-500"}`}>
            {item==="all" ? "All ratings" : `${item} stars`}
          </button>
        ))}
      </div>

      {/* Eligible bookings to review */}
      {eligible.length > 0 && (
        <div className="mb-7 rounded-[1.7rem] border border-blue-200 bg-blue-50/70 p-5 backdrop-blur-2xl">
          <h3 className="font-black text-blue-900">Completed bookings waiting for review</h3>
          <p className="mt-1 text-sm text-blue-700">These BK-xxx bookings are completed and have no review yet.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {eligible.map((b) => (
              <div key={b.public_id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><CalendarDays size={18} /></span>
                  <div>
                    <p className="text-sm font-extrabold">{b.provider_name}</p>
                    <p className="text-xs text-slate-500">{b.public_id} · {b.title}</p>
                  </div>
                </div>
                <button onClick={() => go(`/customer/bookings/${b.public_id}/review`)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white">Write review</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-10 text-center shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Star size={24} className="fill-current" /></div>
            <p className="mt-4 text-lg font-black">No reviews in {filter}</p>
            <p className="mt-2 text-sm text-slate-500">Complete a booking (mark BK-xxx as completed) then review it. Your reviews will appear here from database.</p>
            {eligible.length === 0 && (
              <button onClick={() => go("/customer/bookings")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Go to My Bookings</button>
            )}
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r.public_id} className="rounded-[1.7rem] border border-white/90 bg-white/70 p-5 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Star size={20} className="fill-current" /></div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black">{r.provider_name || "Provider"}</h3>
                    <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                      {[...Array(r.rating)].map((_,i) => <Star key={i} size={14} className="fill-current" />)}
                      <span className="ml-1 text-slate-600">{r.rating}.0</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{r.booking_public_id || r.booking_id} · {r.booking_title || "Booking"} · {new Date(r.created_at).toLocaleDateString()}</p>
                  <p className="mt-3 leading-6 text-slate-700">{r.comment}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerReviewsList;
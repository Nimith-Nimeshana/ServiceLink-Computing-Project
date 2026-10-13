import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, WalletCards, CheckCircle2, BadgeCheck } from "lucide-react";
import { getCustomerBooking, cancelCustomerBooking, completeCustomerBooking } from "../api/customerBookingApi.js";

function CustomerBookingDetails({ go, showNotice }) {
  // Get public_id from URL like /customer/bookings/BK-ABC123
  const { id } = useParams();
  const publicId = id;
  
  const [booking, setBooking] = useState(null);
  const [history, setHistory] = useState([]);
  const [relatedOffer, setRelatedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // EFFECT: Load booking on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // API returns {data: booking, history: [...], related_offer}
        const res = await getCustomerBooking(publicId);
        setBooking(res.data);
        setHistory(res.history || []);
        setRelatedOffer(res.related_offer || null);
      } catch (e) {
        setError(e?.message || "Booking not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicId]);

  // ACTION: Cancel booking - only if status is accepted
  const handleCancel = async () => {
    if (!confirm(`Cancel booking ${publicId}?`)) return;
    try {
      await cancelCustomerBooking(publicId, "Cancelled by customer from details page");
      showNotice("Booking cancelled");
      go("/customer/bookings");
    } catch (e) {
      showNotice(e.message || "Failed to cancel");
    }
  };

  // ACTION: Complete booking - marks completed, enables review
  const handleComplete = async () => {
    if (!confirm(`Mark ${publicId} as completed?`)) return;
    try {
      await completeCustomerBooking(publicId);
      showNotice("Booking completed - you can now review");
      go("/customer/bookings");
    } catch (e) {
      showNotice(e.message || "Failed to complete");
    }
  };

  if (loading) {
    return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8">Loading {publicId}...</div>;
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <button onClick={() => go("/customer/bookings")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600">
          <ArrowLeft size={16} />Back to bookings
        </button>
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 text-center">
          <p className="text-lg font-black">{error || "Booking not found"}</p>
          <p className="mt-2 text-sm text-slate-500">Check if you own booking {publicId}</p>
        </div>
      </div>
    );
  }

  const isAccepted = booking.status === "accepted";
  const isCompleted = booking.status === "completed";

  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}
      <button onClick={() => go("/customer/bookings")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600">
        <ArrowLeft size={16} />Back to bookings
      </button>

      {/* MAIN CARD: Booking info */}
      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        {/* HEADER: public_id + title + status */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-bold text-blue-600">{booking.public_id} · {booking.source}</p>
            <h2 className="mt-1 text-3xl font-black">{booking.title}</h2>
            <p className="mt-2 text-slate-500">{booking.provider_name} · Provider net: LKR {Number(booking.provider_net_amount || 0).toLocaleString()}</p>
          </div>
          <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-extrabold capitalize ${isAccepted ? "bg-blue-100 text-blue-700" : isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
            {booking.status}
          </span>
        </div>

        {/* INFO GRID: Date, price, commission breakdown per Shared Standard */}
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Date</p>
            <p className="mt-2 font-extrabold">{booking.date_display || new Date(booking.created_at).toLocaleDateString()}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Agreed Amount</p>
            <p className="mt-2 font-extrabold">LKR {Number(booking.agreed_amount).toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Total payable to provider via platform</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Commission (10%)</p>
            <p className="mt-2 font-extrabold">LKR {Number(booking.commission_amount).toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Provider receives LKR {Number(booking.provider_net_amount).toLocaleString()}</p>
          </div>
        </div>

        {/* PAYMENT SUMMARY BOX: Customer pays provider directly - per your business model */}
        <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50/80 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><WalletCards size={19} /></span>
            <div>
              <h3 className="font-black text-blue-950">Payment summary</h3>
              <p className="mt-1 text-xs text-blue-700">Customer pays provider directly. Platform takes 10% commission from provider side.</p>
            </div>
          </div>
        </div>

        {/* RELATED OFFER INFO: If booking came from accepted offer */}
        {relatedOffer && (
          <div className="mt-6 rounded-2xl bg-violet-50 border border-violet-200 p-4">
            <p className="text-xs font-bold uppercase text-violet-600">Related Offer</p>
            <p className="mt-1 font-extrabold">{relatedOffer.public_id} · Proposed: LKR {Number(relatedOffer.proposed_price).toLocaleString()}</p>
            <p className="mt-1 text-xs text-violet-600">{relatedOffer.proposal_message?.substring(0, 100)}...</p>
          </div>
        )}

        {/* TIMELINE: Status history from booking_status_histories table */}
        <h3 className="mt-8 text-lg font-black">Status history</h3>
        <div className="mt-4 space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No history yet</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${i === 0 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {h.to_status === "accepted" ? <BadgeCheck size={17} /> : h.to_status === "completed" ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}
                  </span>
                  {i < history.length - 1 && <span className="h-7 w-px bg-blue-200" />}
                </div>
                <div>
                  <p className="font-extrabold capitalize">{h.from_status || "created"} → {h.to_status}</p>
                  <p className="mt-1 text-sm text-slate-500">{h.note}</p>
                  <p className="mt-1 text-xs text-slate-400">{h.created_at ? new Date(h.created_at).toLocaleString() : ""}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ACTIONS: Cancel or Complete - only for accepted bookings */}
        <div className="mt-7 flex flex-wrap gap-3">
          {isAccepted && (
            <>
              <button onClick={handleCancel} className="rounded-xl bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-700">Cancel booking</button>
              <button onClick={handleComplete} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Mark as completed</button>
            </>
          )}
          {isCompleted && (
            <>
              <button onClick={() => go(`/customer/bookings/${booking.public_id}/review`)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Write review</button>
              <button onClick={() => go("/customer/complaints/create")} className="rounded-xl bg-amber-50 px-5 py-3 text-sm font-extrabold text-amber-700">Report a problem</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerBookingDetails;

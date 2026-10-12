import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import { getReviewInfo, createReview } from "../api/customerReviewApi.js";

// review form for completed BK-xxx booking
// Validates: booking must be completed, no existing review, rating 1-5, comment 10-1000 chars

function CustomerReviewForm({ go, showNotice }) {
  const { id } = useParams(); // BK-xxx from /customer/bookings/:id/review
  const publicId = id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    getReviewInfo(publicId)
      .then((r) => setBooking(r.data))
      .catch((e) => setError(e?.message || "Cannot review this booking"))
      .finally(() => setLoading(false));
  }, [publicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      showNotice("Select rating 1-5");
      return;
    }
    if (comment.trim().length < 10) {
      showNotice("Comment must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createReview(publicId, { rating, comment });
      showNotice("Review submitted: " + res.data.public_id);
      go("/customer/reviews");
    } catch (err) {
      showNotice(err.message || "Failed to submit review");
      if (err.errors) {
        setError(Object.values(err.errors).flat().join(", "));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 backdrop-blur-2xl"><p className="font-bold text-slate-500">Checking if {publicId} can be reviewed...</p></div>;
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <button onClick={() => go("/customer/bookings")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to bookings</button>
        <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-8 text-center backdrop-blur-2xl">
          <p className="text-lg font-black">Cannot review {publicId}</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <p className="mt-3 text-xs text-slate-400">Only bookings with status = completed and no existing review can be reviewed. Mark BK-xxx as completed from Booking Details first.</p>
          <button onClick={() => go("/customer/bookings")} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white">Go to My Bookings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => go(`/customer/bookings/${publicId}`)} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to booking {publicId}</button>

      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <div className="mb-6">
          <p className="text-sm font-bold text-blue-600">{booking.public_id} · {booking.provider_name}</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">Write a Review</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Your review will be linked to completed booking {booking.public_id} - {booking.title}. Rating 1-5, real from DB.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Rating *</span>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)} className="rounded-xl p-1">
                  <Star size={34} className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                </button>
              ))}
            </div>
            <span className="mt-1 block text-xs text-slate-500">{rating===0 ? "Select stars" : `${rating} star${rating>1?"s":""} - ${rating===5?"Excellent":rating===4?"Good":rating===3?"Average":rating===2?"Below average":"Poor"}`}</span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Review comment * (10-1000 chars)</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Describe the quality, punctuality, communication, value for money..." className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" minLength={10} maxLength={1000} required />
            <span className="mt-1 block text-xs text-slate-500">{comment.length}/1000 characters</span>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => go(`/customer/bookings/${publicId}`)} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting || rating===0} className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerReviewForm;
import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { createComplaint, getEligibleBookingsForComplaint } from "../api/customerComplaintApi.js";

// Complaint form - creates CP-xxx linked to BK-xxx booking
// Validates subject 5-191 chars, description 20-2000 chars

function CustomerComplaintForm({ go, showNotice }) {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    booking_public_id: "",
    subject: "",
    description: "",
    category: "general",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoadingBookings(true);
    getEligibleBookingsForComplaint()
      .then((r) => setBookings(r.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoadingBookings(false));
  }, []);

  const set = (k,v) => setForm((s) => ({...s, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await createComplaint(form);
      showNotice("Complaint submitted: " + res.data.public_id);
      go("/customer/complaints");
    } catch (err) {
      setErrors(err.errors || {});
      showNotice(err.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => go("/customer/complaints")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600"><ArrowLeft size={16} />Back to complaints</button>

      <div className="rounded-[1.7rem] border border-white/90 bg-white/70 p-6 sm:p-8 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl">
        <div className="mb-6 flex gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><AlertCircle size={22} /></span>
          <div>
            <h2 className="text-3xl font-black tracking-[-0.04em]">Submit a Complaint</h2>
            <p className="mt-2 max-w-2xl text-slate-500">Provide accurate information so administrator can investigate. Creates CP-xxx in DB linked to BK-xxx.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Related booking (optional but recommended)</span>
            <span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4">
              <select value={form.booking_public_id} onChange={(e) => set("booking_public_id", e.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">
                <option value="">No specific booking / General issue</option>
                {bookings.map((b) => (
                  <option key={b.public_id} value={b.public_id}>{b.public_id} · {b.title} · {b.provider_name} · {b.status}</option>
                ))}
              </select>
            </span>
            {loadingBookings && <span className="mt-1 block text-xs text-slate-400">Loading your bookings...</span>}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Category</span>
            <span className="flex items-center rounded-2xl border border-white/90 bg-white/70 px-4">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full appearance-none bg-transparent py-4 text-sm font-semibold outline-none">
                <option value="general">General</option>
                <option value="payment">Payment / Overcharge</option>
                <option value="no_show">Provider did not attend</option>
                <option value="quality">Poor service quality</option>
                <option value="behavior">Provider behavior</option>
                <option value="other">Other</option>
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Subject * (5-191 chars)</span>
            <input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Short summary e.g. Unexpected additional charge" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" required />
            {errors.subject && <span className="mt-1.5 block text-xs text-rose-600">{errors.subject[0]}</span>}
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-extrabold text-slate-800">Description * (20-2000 chars) - explain what happened</span>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Explain what happened, when, expected outcome..." className="min-h-36 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" required />
            <span className="mt-1 block text-xs text-slate-500">{form.description.length}/2000 characters</span>
            {errors.description && <span className="mt-1.5 block text-xs text-rose-600">{errors.description[0]}</span>}
          </label>

          <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => go("/customer/complaints")} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerComplaintForm;

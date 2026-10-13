import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { CalendarDays, WalletCards, MapPin, ArrowLeft } from "lucide-react";
import { createCustomerBooking } from "../api/CustomerBookingApi.js";

function GlassPanel({ children, className = "" }) {
  return <div className={`rounded-[1.7rem] border border-white/90 bg-white/70 shadow-[0_18px_55px_rgba(39,75,120,0.09)] backdrop-blur-2xl ${className}`}>{children}</div>;
}
function Field({ label, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-extrabold text-slate-800">{label}</span>{children}</label>;
}

export default function CustomerBookingForm({ go, showNotice }) {
  const { serviceId } = useParams();
  const location = useLocation();
  const prefill = location.state || {};
  // Auto-fetch service details to prefill provider when coming from public marketplace
  const [serviceInfo, setServiceInfo] = useState(null);
  useEffect(() => {
    if (serviceId && !prefill.provider_public_id) {
      import("../api/publicServiceApi.js").then(mod => mod.getPublicService(serviceId).then(res=> {
        const svc = res.data?.service;
        if(svc){
          setForm(f=> ({...f, provider_public_id: svc.provider?.public_id || f.provider_public_id, service_public_id: svc.public_id || serviceId}));
          setServiceInfo(svc);
        }
      }).catch(()=>{}));
    }
  }, [serviceId]);
  
  const [form, setForm] = useState({
    provider_public_id: prefill.provider_public_id || "",
    service_public_id: serviceId || prefill.service_public_id || "",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: 60,
    task_description: prefill.task_description || "",
    district: prefill.district || "Anuradhapura",
    address: "",
    customer_note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.provider_public_id) {
      showNotice("Provider ID missing. Please book from service details page.");
      return;
    }
    setSaving(true);
    try {
      const res = await createCustomerBooking(form);
      showNotice(`Booking created: ${res.data.public_id}`);
      go(`/customer/bookings/${res.data.public_id}`);
    } catch (err) {
      showNotice(err.message || "Failed to create booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => go("/services")} className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-extrabold text-slate-600">
        <ArrowLeft size={16} />Back to services
      </button>
      <GlassPanel className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-[-0.04em]">Create a Direct Booking</h2>
          <p className="mt-2 max-w-2xl text-slate-500">Confirm service, schedule and location. Provider will be notified instantly.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <Field label="Provider Public ID *">
            <input value={form.provider_public_id} onChange={e => setForm({...form, provider_public_id: e.target.value})} placeholder="e.g. US-1003" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" required />
          </Field>
          <Field label="Service Public ID (optional)">
            <input value={form.service_public_id} onChange={e => setForm({...form, service_public_id: e.target.value})} placeholder="e.g. SV-..." className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none" />
          </Field>
          <Field label="Scheduled Date *">
            <input type="date" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none" required />
          </Field>
          <Field label="Scheduled Time *">
            <input type="time" value={form.scheduled_time} onChange={e => setForm({...form, scheduled_time: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none" required />
          </Field>
          <Field label="Duration (minutes)">
            <select value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: parseInt(e.target.value)})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none">
              <option value={30}>30 min</option><option value={60}>1 hour</option><option value={90}>1.5 hours</option><option value={120}>2 hours</option><option value={180}>3 hours</option>
            </select>
          </Field>
          <Field label="District">
            <select value={form.district} onChange={e => setForm({...form, district: e.target.value})} className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none">
              <option>Anuradhapura</option><option>Colombo</option><option>Kandy</option><option>Galle</option><option>Jaffna</option><option>Other</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address">
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Service location" className="w-full rounded-2xl border border-white/90 bg-white/70 px-4 py-4 text-sm font-semibold outline-none" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Task Description">
              <textarea value={form.task_description} onChange={e => setForm({...form, task_description: e.target.value})} placeholder="Describe the issue" className="min-h-32 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Customer Note">
              <textarea value={form.customer_note} onChange={e => setForm({...form, customer_note: e.target.value})} placeholder="Any special instructions" className="min-h-24 w-full rounded-2xl border border-white/90 bg-white/70 p-4 text-sm outline-none" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => go("/services")} disabled={saving} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-extrabold disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-50">{saving ? "Creating..." : "Send booking request"}</button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}

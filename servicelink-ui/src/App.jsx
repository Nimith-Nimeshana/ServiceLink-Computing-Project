import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import AuthenticationPage from "./pages/AuthenticationPage.jsx";
import CustomerPage from "./pages/CustomerPage.jsx";
import ProviderApplicationPage from "./pages/ProviderApplicationPage.jsx";

// Large modules load only when their routes are opened so one isolated module
// cannot interrupt the homepage or another previously verified workspace.
const ProviderPage = lazy(() => import("./pages/ProviderPage.jsx"));
const AdministratorPage = lazy(() => import("./pages/AdministratorPage.jsx"));
const PublicMarketplacePage = lazy(() => import("./pages/PublicMarketPlacePage.jsx"));
const InformationSupportPage = lazy(() => import("./pages/InformationSupportPage.jsx"));
const AuthenticationSupportPage = lazy(() =>
  import("./pages/AuthenticationSupportPage.jsx")
);
const SystemStatePage = lazy(() => import("./pages/SystemStatePage.jsx"));

function ModuleLoading({ label }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f8fc] p-6">
      <section className="w-full max-w-md rounded-[1.7rem] border border-white/90 bg-white/75 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <h1 className="mt-5 text-xl font-black">Loading {label}</h1>
        <p className="mt-2 text-sm text-slate-500">ServiceLink is preparing the requested page.</p>
      </section>
    </main>
  );
}

function ProviderRoute({ screen }) {
  return <Suspense fallback={<ModuleLoading label="provider panel" />}><ProviderPage screen={screen} /></Suspense>;
}

function AdminRoute({ screen }) {
  return <Suspense fallback={<ModuleLoading label="administrator panel" />}><AdministratorPage screen={screen} /></Suspense>;
}

function PublicRoute({ screen }) {
  return <Suspense fallback={<ModuleLoading label="marketplace" />}><PublicMarketplacePage screen={screen} /></Suspense>;
}

function InformationRoute({ screen }) {
  return <Suspense fallback={<ModuleLoading label="information page" />}><InformationSupportPage screen={screen} /></Suspense>;
}

// Optional authentication-support states remain isolated from the main forms.
function AuthenticationSupportRoute({ screen }) {
  return (
    <Suspense fallback={<ModuleLoading label="account security page" />}>
      <AuthenticationSupportPage screen={screen} />
    </Suspense>
  );
}

// Dedicated system pages remain isolated from all normal application routes.
function SystemRoute({ screen }) {
  return (
    <Suspense fallback={<ModuleLoading label="system page" />}>
      <SystemStatePage screen={screen} />
    </Suspense>
  );
}

// The central route map includes every completed ServiceLink UI inventory.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage and authentication. */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<AuthenticationPage initialScreen="choose-role" />} />
        <Route path="/register/customer" element={<AuthenticationPage initialScreen="customer-register" />} />
        <Route path="/register/provider" element={<AuthenticationPage initialScreen="provider-register" />} />
        <Route path="/login" element={<AuthenticationPage initialScreen="login" />} />
        <Route path="/forgot-password" element={<AuthenticationPage initialScreen="forgot-password" />} />
        <Route path="/reset-password/:token" element={<AuthenticationPage initialScreen="reset-password" />} />

        {/* Public marketplace. */}
        <Route path="/services" element={<PublicRoute screen="services" />} />
        <Route path="/services/:id" element={<PublicRoute screen="service-details" />} />
        <Route path="/categories" element={<PublicRoute screen="categories" />} />
        <Route path="/categories/:slug" element={<PublicRoute screen="category-services" />} />
        <Route path="/providers" element={<PublicRoute screen="providers" />} />
        <Route path="/providers/:id" element={<PublicRoute screen="provider-details" />} />
        <Route path="/wanted-ads" element={<PublicRoute screen="wanted-ads" />} />
        <Route path="/wanted-ads/:id" element={<PublicRoute screen="wanted-ad-details" />} />

        {/* Information, support and policy pages. */}
        <Route path="/how-it-works" element={<InformationRoute screen="how-it-works" />} />
        <Route path="/about" element={<InformationRoute screen="about" />} />
        <Route path="/contact" element={<InformationRoute screen="contact" />} />
        <Route path="/privacy" element={<InformationRoute screen="privacy" />} />
        <Route path="/terms" element={<InformationRoute screen="terms" />} />

        {/* Authentication support used by success and sensitive-action flows. */}
        <Route path="/registration-success" element={<AuthenticationSupportRoute screen="registration-success" />} />
        <Route path="/confirm-password" element={<AuthenticationSupportRoute screen="confirm-password" />} />
        <Route path="/password-reset-success" element={<AuthenticationSupportRoute screen="password-reset-success" />} />

        {/* Customer account and profile. */}
        <Route path="/customer/dashboard" element={<CustomerPage screen="dashboard" />} />
        <Route path="/customer/profile" element={<CustomerPage screen="profile" />} />
        <Route path="/customer/profile/edit" element={<CustomerPage screen="profile-edit" />} />

        {/* Customer booking workflow. */}
        <Route path="/customer/bookings" element={<CustomerPage screen="bookings" />} />
        <Route path="/customer/bookings/create" element={<CustomerPage screen="booking-create" />} />
        <Route path="/customer/bookings/create/:serviceId" element={<CustomerPage screen="booking-create" />} />
        <Route path="/customer/bookings/:id/review" element={<CustomerPage screen="review-create" />} />
        <Route path="/customer/bookings/:id" element={<CustomerPage screen="booking-details" />} />

        {/* Customer wanted ads, offers and supporting pages. */}
        <Route path="/customer/wanted-ads" element={<CustomerPage screen="wanted-ads" />} />
        <Route path="/customer/wanted-ads/create" element={<CustomerPage screen="wanted-ad-create" />} />
        <Route path="/customer/wanted-ads/:id/edit" element={<CustomerPage screen="wanted-ad-edit" />} />
        <Route path="/customer/wanted-ads/:id/offers" element={<CustomerPage screen="offers" />} />
        <Route path="/customer/wanted-ads/:id" element={<CustomerPage screen="wanted-ad-details" />} />
        <Route path="/customer/offers" element={<CustomerPage screen="offers" />} />
        <Route path="/customer/offers/:id" element={<CustomerPage screen="offer-details" />} />
        <Route path="/customer/reviews" element={<CustomerPage screen="reviews" />} />
        <Route path="/customer/complaints" element={<CustomerPage screen="complaints" />} />
        <Route path="/customer/complaints/create" element={<CustomerPage screen="complaint-create" />} />
        <Route path="/customer/notifications" element={<CustomerPage screen="notifications" />} />

        {/* Provider application. */}
        <Route path="/provider/application" element={<ProviderApplicationPage screen="dashboard" />} />
        <Route path="/provider/application/profile" element={<ProviderApplicationPage screen="profile" />} />
        <Route path="/provider/application/qualifications" element={<ProviderApplicationPage screen="qualifications" />} />
        <Route path="/provider/application/qualifications/create" element={<ProviderApplicationPage screen="qualification-form" />} />
        <Route path="/provider/application/qualifications/:id/edit" element={<ProviderApplicationPage screen="qualification-form" />} />
        <Route path="/provider/application/qualifications/:id" element={<ProviderApplicationPage screen="qualification-details" />} />
        <Route path="/provider/application/review" element={<ProviderApplicationPage screen="review" />} />
        <Route path="/provider/application/status" element={<ProviderApplicationPage screen="status" />} />

        {/* Approved provider panel. */}
        <Route path="/provider/dashboard" element={<ProviderRoute screen="dashboard" />} />
        <Route path="/provider/profile" element={<ProviderRoute screen="profile" />} />
        <Route path="/provider/profile/edit" element={<ProviderRoute screen="profile-edit" />} />
        <Route path="/provider/qualifications" element={<ProviderRoute screen="qualifications" />} />
        <Route path="/provider/services" element={<ProviderRoute screen="services" />} />
        <Route path="/provider/services/create" element={<ProviderRoute screen="service-form" />} />
        <Route path="/provider/services/:id/edit" element={<ProviderRoute screen="service-form" />} />
        <Route path="/provider/availability" element={<ProviderRoute screen="availability" />} />
        <Route path="/provider/wanted-ads" element={<ProviderRoute screen="wanted-ads" />} />
        <Route path="/provider/wanted-ads/:id/offer" element={<ProviderRoute screen="offer-form" />} />
        <Route path="/provider/wanted-ads/:id" element={<ProviderRoute screen="wanted-ad-details" />} />
        <Route path="/provider/offers" element={<ProviderRoute screen="offers" />} />
        <Route path="/provider/offers/:offerId/edit" element={<ProviderRoute screen="offer-form" />} />
        <Route path="/provider/offers/:id" element={<ProviderRoute screen="offer-details" />} />
        <Route path="/provider/bookings/requests" element={<ProviderRoute screen="booking-requests" />} />
        <Route path="/provider/bookings" element={<ProviderRoute screen="bookings" />} />
        <Route path="/provider/bookings/:id" element={<ProviderRoute screen="booking-details" />} />
        <Route path="/provider/reviews" element={<ProviderRoute screen="reviews" />} />
        <Route path="/provider/complaints" element={<ProviderRoute screen="complaints" />} />
        <Route path="/provider/notifications" element={<ProviderRoute screen="notifications" />} />
        <Route path="/provider/statistics" element={<ProviderRoute screen="statistics" />} />
        <Route path="/provider/earnings" element={<ProviderRoute screen="earnings" />} />

        {/* Administrator provider review, users and categories. */}
        <Route path="/admin/dashboard" element={<AdminRoute screen="dashboard" />} />
        <Route path="/admin/provider-applications" element={<AdminRoute screen="applications" />} />
        <Route path="/admin/provider-applications/:id" element={<AdminRoute screen="application-details" />} />
        <Route path="/admin/users" element={<AdminRoute screen="users" />} />
        <Route path="/admin/users/:id" element={<AdminRoute screen="user-details" />} />
        <Route path="/admin/categories" element={<AdminRoute screen="categories" />} />
        <Route path="/admin/categories/create" element={<AdminRoute screen="category-form" />} />
        <Route path="/admin/categories/:id/edit" element={<AdminRoute screen="category-form" />} />

        {/* Administrator moderation and oversight. */}
        <Route path="/admin/services" element={<AdminRoute screen="services" />} />
        <Route path="/admin/services/:id" element={<AdminRoute screen="service-details" />} />
        <Route path="/admin/wanted-ads" element={<AdminRoute screen="wanted-ads" />} />
        <Route path="/admin/wanted-ads/:id" element={<AdminRoute screen="wanted-ad-details" />} />
        <Route path="/admin/bookings" element={<AdminRoute screen="bookings" />} />
        <Route path="/admin/bookings/:id" element={<AdminRoute screen="booking-details" />} />
        <Route path="/admin/reviews" element={<AdminRoute screen="reviews" />} />
        <Route path="/admin/complaints" element={<AdminRoute screen="complaints" />} />
        <Route path="/admin/complaints/:id" element={<AdminRoute screen="complaint-details" />} />
        <Route path="/admin/revenue" element={<AdminRoute screen="revenue" />} />
        <Route path="/admin/reports" element={<AdminRoute screen="reports" />} />
        <Route path="/admin/notifications" element={<AdminRoute screen="notifications" />} />
        <Route path="/admin/audit-logs" element={<AdminRoute screen="audit" />} />
        <Route path="/admin/settings" element={<AdminRoute screen="settings" />} />

        {/* Dedicated system recovery and access-state pages. */}
        <Route path="/403" element={<SystemRoute screen="403" />} />
        <Route path="/404" element={<SystemRoute screen="404" />} />
        <Route path="/500" element={<SystemRoute screen="500" />} />
        <Route path="/maintenance" element={<SystemRoute screen="maintenance" />} />
        <Route path="/session-expired" element={<SystemRoute screen="session-expired" />} />
        <Route path="/account-restricted" element={<SystemRoute screen="account-restricted" />} />
        <Route path="/system-states" element={<SystemRoute screen="gallery" />} />

        {/* Unknown addresses display the proper Page Not Found state. */}
        <Route path="*" element={<SystemRoute screen="404" />} />
      </Routes>
    </BrowserRouter>
  );
}

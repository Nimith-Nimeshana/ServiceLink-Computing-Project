ServiceLink - Smart Local Service Booking Marketplace

ServiceLink is a role-based local service marketplace designed to connect customers with approved service providers. The platform supports dedicated workflows for public visitors, customers, provider applicants, approved providers, and platform administrators.

This project is currently in transition from a completed UI prototype to a fully integrated, full-stack application.

📊 Current Project Status

Current Milestone: Complete React UI prototype and system-state library.
Next Milestone: Laravel backend, MySQL persistence, security, and end-to-end workflow integration.

Note: The React and Vite interface is visually complete at the prototype level. Most data is currently stored as local demonstration arrays. Refreshing the browser resets temporary changes.

🛠 Tech Stack

Current Frontend (Completed):

Framework: React with Vite (Component-based UI and fast local development)

Routing: react-router-dom (Public, role-based, and state-page routing)

Styling: Tailwind CSS (Responsive glossy visual system)

Icons: lucide-react

Animations: framer-motion

Planned Backend (Next Stage):

Framework: Laravel (Authentication, business logic, policies, validation, and APIs)

Database: MySQL through XAMPP

👥 User Roles & Capabilities

Visitor: Browse public services, approved providers, wanted ads, and platform information.

Customer: Create direct bookings, post wanted ads, review offers, submit reviews, and file complaints.

Provider Applicant: Complete professional profile and upload verification qualifications.

Approved Provider: Publish services, manage availability, submit offers to wanted ads, and manage bookings.

Administrator: Review provider applications, moderate records, oversee platform activity, and manage financial revenue (10% platform commission on completed deals).

🚀 Getting Started (Local UI Development)

To run the current UI prototype locally on your machine:

Open your terminal and navigate to the project directory (e.g., E:\xammp\htdocs\servicelink-ui):

cd path/to/servicelink-ui


Start the Vite development server:

npm run dev


Open your browser and navigate to the local URL provided by Vite (normally http://localhost:5173/).

Important: Do not open index.html directly, and do not use the Apache project URL for the Vite prototype.

📂 Project Architecture & Lazy Loading

The application uses a large page-module pattern to isolate unrelated workflows. Public pages are imported normally, while role-specific dashboards and system states are lazy-loaded to optimize performance.

servicelink-ui/
 ├── public/
 │    └── images/
 ├── src/
 │    ├── pages/
 │    │    ├── HomePage.jsx
 │    │    ├── AuthenticationPage.jsx
 │    │    ├── CustomerPage.jsx
 │    │    ├── ProviderApplicationPage.jsx
 │    │    ├── ProviderPage.jsx (Lazy Loaded)
 │    │    ├── AdministratorPage.jsx (Lazy Loaded)
 │    │    ├── PublicMarketPlacePage.jsx (Lazy Loaded)
 │    │    └── SystemStatePage.jsx (Lazy Loaded)
 │    ├── App.jsx
 │    ├── index.css
 │    └── main.jsx
 ├── package.json
 └── vite.config.js


📋 Continuity & Handover Guide

Because this project uses a sequential team allocation model, strict continuity guidelines must be followed.

Before implementing the Laravel backend or making structural changes, you must read the ServiceLink_Project_Handover_and_Continuity_Guide.pdf.

Key Handover Rules:

Preserve the UI: Do not redesign, remove, or rename existing React routes without a clear reason.

Database Standards: Follow the shared database, API, and integration standards exactly (including the 10% commission rule and naming conventions).

Full File Replacement: Use full-file replacement for large central files like App.jsx.

Validation: Client-side validation is implemented, but robust server-side validation and authorization policies via Laravel are strictly required for the next phase.

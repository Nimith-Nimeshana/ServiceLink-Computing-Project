# ServiceLink - Full-Stack Local Service Booking Marketplace

ServiceLink is a role-based, web-based local service marketplace designed to connect customers with approved service providers. The platform is an academic project currently transitioning from a completed React UI prototype into a fully integrated Laravel full-stack application.

## 🛠 Technology Stack

**Frontend (Completed UI Prototype)**

* **Framework:** React with Vite provides a component-based UI and fast local development.


* **Routing:** react-router-dom handles public, role-based, and state-page routing.


* **Styling:** Tailwind CSS is used for a responsive, glossy visual system.


* **Icons & Animations:** The UI utilizes lucide-react and framer-motion.



**Backend & Database**

* **Framework:** Laravel 12 running on PHP 8.2 handles authentication, business logic, validation, and REST-style JSON APIs.


* **Database:** MariaDB 10.4 or a compatible MySQL version accessed locally via XAMPP and phpMyAdmin.


* **Architecture:** The application relies on Laravel Query Builder for database operations and a lazy-loaded page-module pattern in React to optimize performance for role-specific dashboards.



## 👥 User Roles & Workflows

The platform isolates unrelated workflows into dedicated areas for different user roles:

* **Public Visitor:** Browse public services, approved providers, wanted ads, and platform information.


* **Customer:** Create direct bookings, post wanted ads, review offers, submit reviews, and file complaints.


* **Provider Applicant:** Complete professional profiles and upload verification qualifications.


* **Approved Provider:** Publish services, manage availability, submit offers to wanted ads, and manage bookings.


* **Administrator:** Review provider applications, manage users and categories, oversee marketplace activity, handle complaints, and manage platform revenue. Revenue management includes enforcing a 10% platform commission on completed deals.



## 🚀 Local Development Setup Guide

### Prerequisites

* Windows 10 or 11.


* XAMPP 8.2.12 or a compatible PHP 8.2 environment.


* Composer 2, which requires the PHP ZIP extension to be enabled in `php.ini`.


* Node.js and npm for the frontend environment.


* Git and a code editor like Visual Studio Code.



### 1. Database Setup (Recommended Method)

1. Start Apache and MySQL using XAMPP.


2. Open `http://localhost/phpmyadmin` in your browser.


3. Create a new database named `servicelink_db` and select the `utf8mb4_unicode_ci` collation.


4. Navigate to the **Import** tab and upload `database/demo/servicelink_demo_sanitized.sql` to import the current demonstration state. Do not run `php artisan migrate:fresh` after this step, as it will wipe the imported database.



### 2. Backend Installation (Laravel)

1. Clone the backend repository and navigate to the `servicelink-backend` directory.


2. Run `composer install` to install PHP dependencies.


3. Duplicate `.env.example` and rename the copy to `.env`.


4. Generate the application key by running `php artisan key:generate`.


5. Open the `.env` file and verify your database variables are uncommented and set correctly: `DB_DATABASE=servicelink_db`, `DB_USERNAME=root`, and leave `DB_PASSWORD` blank if using default XAMPP credentials.


6. Verify `config/cors.php` allows requests from the frontend URL.


7. Clear previous configurations by running `php artisan config:clear`, `php artisan cache:clear`, and `php artisan optimize:clear`.


8. Start the backend server by running `php artisan serve --host=127.0.0.1 --port=8000`.



### 3. Frontend Installation (React)

1. Clone the frontend repository and navigate to the `servicelink-ui` directory.


2. Run `npm install` to download node modules.


3. Ensure the `API_BASE` variable (e.g., in `src/pages/AdministratorPage.jsx`) points to `[http://127.0.0.1:8000/api/admin](http://127.0.0.1:8000/api/admin)`.


4. Start the Vite development server using `npm run dev`.


5. Access the application at `http://localhost:5173`. Do not open `index.html` directly or use the Apache project URL to view the frontend.



## ⚠️ Known Limitations & Handover Guidelines

Because this project utilizes a sequential team allocation model, strict guidelines must be followed to maintain continuity.

* **Security Gaps:** The current backend APIs are not protected by authentication middleware, role middleware, Laravel Policies, or record-ownership checks. These must be implemented before the platform is exposed publicly.


* **Simulated Functionality:** Certain frontend actions are UI-only and may show success messages without executing a backend endpoint. Dashboard revenue totals and charts currently rely on hard-coded demonstration data.


* **Integration Rules:** Do not drop or recreate shared tables using migrations against the main database. Use full-file replacement for major central files like `App.jsx`.


* **Server-Side Validation:** While client-side validation exists, all state-changing requests, prices, and commission values must be validated and authorized strictly via Laravel.


* **Database Standards:** Replace display-oriented status text (e.g., "changes requested") with normalized machine-readable snake_case formats (e.g., "changes_requested") for the final integrated system. Ensure financial columns use decimal formatting.

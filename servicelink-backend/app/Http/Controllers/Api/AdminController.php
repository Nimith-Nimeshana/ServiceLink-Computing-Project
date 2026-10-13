<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // Helper to return standard JSON envelope
    private function jsonResponse(bool $success, string $message, $data = null, $errors = null, int $status = 200)
    {
        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'errors' => $errors,
        ], $status);
    }

    // Helper to log audit events
    private function logAudit(string $action, string $target, ?string $actor = 'Admin User')
    {
        $count = DB::table('audit_logs')->count() + 9002;
        DB::table('audit_logs')->insert([
            'public_id' => 'LG-' . $count,
            'actor' => $actor,
            'action' => $action,
            'target' => $target,
            'ip' => request()->ip() ?? '127.0.0.1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // 1. Dashboard Overview
    public function dashboard()
    {
        $pendingApps = DB::table('provider_applications')->where('status', 'pending')->count();
        $activeUsers = DB::table('users')->where('status', 'active')->count();
        $monthlyBookings = DB::table('bookings')->count();
        $openComplaints = DB::table('complaints')->whereIn('status', ['submitted', 'under_review'])->count();

        $recentApps = DB::table('provider_applications')->latest()->take(2)->get();
        $recentAudits = DB::table('audit_logs')->latest()->take(3)->get();

        return $this->jsonResponse(true, 'Dashboard data retrieved', [
            'metrics' => [
                'pending_applications' => $pendingApps,
                'active_users' => $activeUsers,
                'monthly_bookings' => $monthlyBookings,
                'open_complaints' => $openComplaints,
            ],
            'recent_applications' => $recentApps,
            'recent_audits' => $recentAudits,
            'revenue_summary' => [
                'monthly_commission' => 'LKR 96,400',
                'completed_value' => 'LKR 964,000',
                'pending_commission' => 'LKR 14,200',
            ]
        ]);
    }

    // 2. Provider Applications Queue & Details
    public function applications()
    {
        $apps = DB::table('provider_applications')->latest()->get();
        $quals = DB::table('qualifications')->get();

        return $this->jsonResponse(true, 'Applications retrieved', [
            'applications' => $apps,
            'qualifications' => $quals,
        ]);
    }

    public function applicationDecision(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,changes requested,rejected',
            'decision_note' => 'nullable|string',
        ]);

        $app = DB::table('provider_applications')->where('public_id', $id)->first();
        if (!$app) {
            return $this->jsonResponse(false, 'Application not found', null, null, 404);
        }

        DB::table('provider_applications')->where('public_id', $id)->update([
            'status' => $request->status,
            'decision_note' => $request->decision_note,
            'reviewed_at' => now(),
            'updated_at' => now(),
        ]);

        // If approved, set provider user status to active
        if ($request->status === 'approved') {
            DB::table('users')->where('id', $app->provider_id)->update([
                'status' => 'active',
                'updated_at' => now(),
            ]);
        }

        $this->logAudit("Application {$request->status}", $id);

        return $this->jsonResponse(true, "Application marked as {$request->status}");
    }

    // 3. User Management
    public function users()
    {
        $users = DB::table('users')->select('id', 'public_id', 'name', 'email', 'role', 'status', 'created_at')->latest()->get();
        return $this->jsonResponse(true, 'Users retrieved', $users);
    }

    public function toggleUserStatus($id)
    {
        $user = DB::table('users')->where('public_id', $id)->first();
        if (!$user) {
            return $this->jsonResponse(false, 'User not found', null, null, 404);
        }

        $newStatus = $user->status === 'suspended' ? 'active' : 'suspended';
        DB::table('users')->where('public_id', $id)->update([
            'status' => $newStatus,
            'updated_at' => now(),
        ]);

        $this->logAudit($newStatus === 'suspended' ? 'Suspended user account' : 'Restored user account', $id);

        return $this->jsonResponse(true, "User status updated to {$newStatus}", ['status' => $newStatus]);
    }

    // 4. Categories Management
    public function categories()
    {
        $categories = DB::table('categories')->get()->map(function ($cat) {
            $cat->services = DB::table('services')->where('category_id', $cat->id)->count();
            $cat->providers = DB::table('services')->where('category_id', $cat->id)->distinct('provider_id')->count('provider_id');
            return $cat;
        });

        return $this->jsonResponse(true, 'Categories retrieved', $categories);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
        ]);

        $count = DB::table('categories')->count() + 1;
        $publicId = 'CT-0' . $count;
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $request->name)));

        DB::table('categories')->insert([
            'public_id' => $publicId,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'status' => $request->status,
            'sort_order' => $count,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->logAudit('Created new category', $publicId);

        return $this->jsonResponse(true, 'Category created successfully');
    }

    public function toggleCategoryStatus($id)
    {
        $category = DB::table('categories')->where('public_id', $id)->first();
        if (!$category) {
            return $this->jsonResponse(false, 'Category not found', null, null, 404);
        }

        $newStatus = $category->status === 'active' ? 'inactive' : 'active';
        DB::table('categories')->where('public_id', $id)->update([
            'status' => $newStatus,
            'updated_at' => now(),
        ]);

        $this->logAudit("Updated category status to {$newStatus}", $id);

        return $this->jsonResponse(true, "Category status updated to {$newStatus}");
    }

    // 5. Moderation: Services, Wanted Ads, Reviews, Complaints
    public function services()
    {
        $services = DB::table('services')
            ->join('users', 'services.provider_id', '=', 'users.id')
            ->join('categories', 'services.category_id', '=', 'categories.id')
            ->select('services.*', 'users.name as provider', 'categories.name as category')
            ->get();

        return $this->jsonResponse(true, 'Services retrieved', $services);
    }

    public function wantedAds()
    {
        $ads = DB::table('wanted_ads')
            ->join('users', 'wanted_ads.customer_id', '=', 'users.id')
            ->join('categories', 'wanted_ads.category_id', '=', 'categories.id')
            ->select('wanted_ads.*', 'users.name as customer', 'categories.name as category')
            ->get();

        return $this->jsonResponse(true, 'Wanted ads retrieved', $ads);
    }

    public function bookings()
    {
        $bookings = DB::table('bookings')
            ->join('users as customers', 'bookings.customer_id', '=', 'customers.id')
            ->join('users as providers', 'bookings.provider_id', '=', 'providers.id')
            ->select('bookings.*', 'customers.name as customer', 'providers.name as provider')
            ->get();

        return $this->jsonResponse(true, 'Bookings retrieved', $bookings);
    }

    public function reviews()
    {
        $reviews = DB::table('reviews')
            ->join('users as customers', 'reviews.customer_id', '=', 'customers.id')
            ->join('users as providers', 'reviews.provider_id', '=', 'providers.id')
            ->join('bookings', 'reviews.booking_id', '=', 'bookings.id')
            ->select('reviews.*', 'customers.name as customer', 'providers.name as provider', 'bookings.public_id as booking')
            ->get();

        return $this->jsonResponse(true, 'Reviews retrieved', $reviews);
    }

    public function complaints()
    {
        $complaints = DB::table('complaints')
            ->join('users as complainants', 'complaints.complainant_id', '=', 'complainants.id')
            ->leftJoin('users as against', 'complaints.against_user_id', '=', 'against.id')
            ->select('complaints.*', 'complainants.name as complainant', 'against.name as against')
            ->get();

        return $this->jsonResponse(true, 'Complaints retrieved', $complaints);
    }

    public function resolveComplaint(Request $request, $id)
    {
        $request->validate(['resolution_note' => 'required|string']);

        DB::table('complaints')->where('public_id', $id)->update([
            'status' => 'resolved',
            'resolution_note' => $request->resolution_note,
            'resolved_at' => now(),
            'updated_at' => now(),
        ]);

        $this->logAudit('Resolved complaint', $id);

        return $this->jsonResponse(true, 'Complaint resolved successfully');
    }

    // 6. Revenue & Analytics
    public function revenue()
    {
        $transactions = DB::table('transactions')
            ->join('bookings', 'transactions.booking_id', '=', 'bookings.id')
            ->join('users as providers', 'transactions.provider_id', '=', 'providers.id')
            ->select(
                'transactions.public_id as id',
                'bookings.public_id as booking',
                'providers.name as provider',
                'transactions.source',
                'transactions.gross_amount as gross',
                'transactions.commission_amount as fee',
                'transactions.provider_net_amount as net',
                'transactions.status'
            )->get();

        return $this->jsonResponse(true, 'Revenue data retrieved', [
            'completed_value' => 'LKR 964,000',
            'commission_revenue' => 'LKR 96,400',
            'pending_commission' => 'LKR 14,200',
            'provider_net_value' => 'LKR 867,600',
            'bars' => [48, 62, 55, 73, 88, 79],
            'sources' => [
                ['label' => 'Direct bookings', 'value' => '68%', 'colour' => 'bg-blue-600'],
                ['label' => 'Accepted offers', 'value' => '32%', 'colour' => 'bg-violet-600'],
                ['label' => 'Electrical category', 'value' => '44%', 'colour' => 'bg-emerald-600'],
            ],
            'transactions' => $transactions,
        ]);
    }

    public function reports()
    {
        $categories = DB::table('categories')->get()->map(function ($cat) {
            return [
                'id' => $cat->public_id,
                'name' => $cat->name,
                'services' => DB::table('services')->where('category_id', $cat->id)->count(),
            ];
        });

        return $this->jsonResponse(true, 'Reports retrieved', [
            'metrics' => [
                'registered_users' => DB::table('users')->count(),
                'approved_providers' => DB::table('users')->where('role', 'provider')->where('status', 'active')->count(),
                'completed_bookings' => DB::table('bookings')->where('status', 'completed')->count(),
                'estimated_value' => 'LKR 1.8M',
            ],
            'monthly_bars' => [42, 55, 61, 50, 78, 67],
            'categories' => $categories,
        ]);
    }

    // 7. Audit Logs
    public function auditLogs()
    {
        $logs = DB::table('audit_logs')->latest()->get();
        return $this->jsonResponse(true, 'Audit logs retrieved', $logs);
    }

    // 8. Platform Settings
    public function settings()
    {
        $settings = DB::table('platform_settings')->pluck('value', 'key');
        return $this->jsonResponse(true, 'Platform settings retrieved', $settings);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->except(['_token']);
        foreach ($data as $key => $value) {
            DB::table('platform_settings')->where('key', $key)->update([
                'value' => (string)$value,
                'updated_at' => now(),
            ]);
        }

        $this->logAudit('Updated platform settings', 'PlatformSettings');

        return $this->jsonResponse(true, 'Platform settings saved successfully');
    }
}
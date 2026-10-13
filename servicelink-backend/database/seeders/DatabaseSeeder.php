<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $adminId = DB::table('users')->insertGetId([
            'public_id' => 'US-1000',
            'name' => 'Administrator',
            'email' => 'admin@servicelink.test',
            'password' => Hash::make('admin123'),
            'role' => 'administrator',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $u1 = DB::table('users')->insertGetId([
            'public_id' => 'US-1001',
            'name' => 'Kalana Induwara',
            'email' => 'kalana@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'status' => 'active',
            'created_at' => now()->subDays(20),
            'updated_at' => now(),
        ]);

        $u2 = DB::table('users')->insertGetId([
            'public_id' => 'US-1002',
            'name' => 'Kalana HomeTech',
            'email' => 'kalana.provider@example.com',
            'password' => Hash::make('password'),
            'role' => 'provider',
            'status' => 'pending',
            'created_at' => now()->subDays(18),
            'updated_at' => now(),
        ]);

        $u3 = DB::table('users')->insertGetId([
            'public_id' => 'US-1003',
            'name' => 'North Central TechCare',
            'email' => 'techcare@example.com',
            'password' => Hash::make('password'),
            'role' => 'provider',
            'status' => 'active',
            'created_at' => now()->subDays(25),
            'updated_at' => now(),
        ]);

        $u4 = DB::table('users')->insertGetId([
            'public_id' => 'US-1004',
            'name' => 'A. Customer',
            'email' => 'customer2@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'status' => 'suspended',
            'created_at' => now()->subDays(30),
            'updated_at' => now(),
        ]);

        // 2. Categories
        $c1 = DB::table('categories')->insertGetId(['public_id' => 'CT-01', 'name' => 'Electrical', 'slug' => 'electrical', 'description' => 'Electrical work', 'status' => 'active', 'sort_order' => 1, 'created_by' => $adminId, 'created_at' => now(), 'updated_at' => now()]);
        $c2 = DB::table('categories')->insertGetId(['public_id' => 'CT-02', 'name' => 'Plumbing', 'slug' => 'plumbing', 'description' => 'Plumbing work', 'status' => 'active', 'sort_order' => 2, 'created_by' => $adminId, 'created_at' => now(), 'updated_at' => now()]);
        $c3 = DB::table('categories')->insertGetId(['public_id' => 'CT-03', 'name' => 'Computer Repair', 'slug' => 'computer-repair', 'description' => 'IT support', 'status' => 'active', 'sort_order' => 3, 'created_by' => $adminId, 'created_at' => now(), 'updated_at' => now()]);
        $c4 = DB::table('categories')->insertGetId(['public_id' => 'CT-04', 'name' => 'Tutoring', 'slug' => 'tutoring', 'description' => 'Tuition services', 'status' => 'active', 'sort_order' => 4, 'created_by' => $adminId, 'created_at' => now(), 'updated_at' => now()]);
        $c5 = DB::table('categories')->insertGetId(['public_id' => 'CT-05', 'name' => 'Photography', 'slug' => 'photography', 'description' => 'Event photo shoot', 'status' => 'inactive', 'sort_order' => 5, 'created_by' => $adminId, 'created_at' => now(), 'updated_at' => now()]);

        // 3. Provider Applications
        $pa1 = DB::table('provider_applications')->insertGetId([
            'public_id' => 'PA-301',
            'provider_id' => $u2,
            'business_name' => 'Kalana HomeTech',
            'owner_name' => 'Kalana Induwara',
            'categories_text' => 'Electrical, Home Maintenance',
            'status' => 'pending',
            'submitted_at' => now()->subDays(4),
            'summary' => 'Independent local provider applying to publish electrical and household maintenance services.',
            'created_at' => now()->subDays(4),
            'updated_at' => now(),
        ]);

        $pa2 = DB::table('provider_applications')->insertGetId([
            'public_id' => 'PA-298',
            'provider_id' => $u4,
            'business_name' => 'CoolCare Services',
            'owner_name' => 'S. Perera',
            'categories_text' => 'Home Maintenance',
            'status' => 'changes requested',
            'submitted_at' => now()->subDays(7),
            'summary' => 'Air conditioning maintenance and cleaning services provider.',
            'created_at' => now()->subDays(7),
            'updated_at' => now(),
        ]);

        $pa3 = DB::table('provider_applications')->insertGetId([
            'public_id' => 'PA-286',
            'provider_id' => $u3,
            'business_name' => 'North Central TechCare',
            'owner_name' => 'N. Fernando',
            'categories_text' => 'Computer Repair',
            'status' => 'approved',
            'submitted_at' => now()->subDays(15),
            'summary' => 'Computer hardware and diagnostic repairs.',
            'created_at' => now()->subDays(15),
            'updated_at' => now(),
        ]);

        // 4. Qualifications
        DB::table('qualifications')->insert([
            ['public_id' => 'QL-101', 'provider_application_id' => $pa1, 'provider_id' => $u2, 'title' => 'National Certificate in Electrical Installation', 'issuer' => 'Technical Training Institute', 'original_filename' => 'electrical-certificate.pdf', 'status' => 'pending', 'review_note' => null, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'QL-102', 'provider_application_id' => $pa1, 'provider_id' => $u2, 'title' => 'Workplace Safety Training', 'issuer' => 'Skills Development Centre', 'original_filename' => 'safety-training.pdf', 'status' => 'pending', 'review_note' => null, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'QL-103', 'provider_application_id' => $pa2, 'provider_id' => $u4, 'title' => 'Air Conditioning Service Certificate', 'issuer' => 'Technical College', 'original_filename' => 'ac-service-certificate.jpg', 'status' => 'replacement requested', 'review_note' => 'Please upload a clearer scan.', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 5. Services
        DB::table('services')->insert([
            ['public_id' => 'SV-101', 'provider_id' => $u2, 'category_id' => $c1, 'title' => 'Home Electrical Repair', 'price_display' => 'From LKR 2,500', 'price_min' => 2500.00, 'status' => 'active', 'reports_count' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'SV-118', 'provider_id' => $u3, 'category_id' => $c2, 'title' => 'Emergency Plumbing Visit', 'price_display' => 'From LKR 4,000', 'price_min' => 4000.00, 'status' => 'active', 'reports_count' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'SV-126', 'provider_id' => $u3, 'category_id' => $c3, 'title' => 'Laptop Diagnostics', 'price_display' => 'LKR 1,800', 'price_min' => 1800.00, 'status' => 'paused', 'reports_count' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Wanted Ads
        DB::table('wanted_ads')->insert([
            ['public_id' => 'WA-208', 'customer_id' => $u1, 'category_id' => $c1, 'title' => 'Repair bedroom air conditioner', 'district' => 'Anuradhapura', 'budget_display' => 'LKR 8,000 - 12,000', 'deadline_display' => '10 Sep 2026', 'status' => 'active', 'offers_count' => 4, 'reports_count' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'WA-211', 'customer_id' => $u1, 'category_id' => $c1, 'title' => 'Install outdoor security lights', 'district' => 'Mihintale', 'budget_display' => 'Negotiable', 'deadline_display' => '12 Sep 2026', 'status' => 'active', 'offers_count' => 2, 'reports_count' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'WA-194', 'customer_id' => $u4, 'category_id' => $c5, 'title' => 'One-day event photography', 'district' => 'Anuradhapura', 'budget_display' => 'LKR 25,000', 'deadline_display' => 'Expired', 'status' => 'expired', 'offers_count' => 2, 'reports_count' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 7. Bookings
        $b1 = DB::table('bookings')->insertGetId(['public_id' => 'BK-1042', 'customer_id' => $u1, 'provider_id' => $u2, 'title' => 'Home electrical repair', 'source' => 'Direct booking', 'date_display' => '08 Sep 2026', 'agreed_amount' => 3500.00, 'commission_rate' => 10.00, 'commission_amount' => 350.00, 'provider_net_amount' => 3150.00, 'status' => 'accepted', 'created_at' => now(), 'updated_at' => now()]);
        $b2 = DB::table('bookings')->insertGetId(['public_id' => 'BK-1038', 'customer_id' => $u1, 'provider_id' => $u2, 'title' => 'Repair damaged ceiling light', 'source' => 'Accepted offer', 'date_display' => '05 Sep 2026', 'agreed_amount' => 3800.00, 'commission_rate' => 10.00, 'commission_amount' => 380.00, 'provider_net_amount' => 3420.00, 'status' => 'in progress', 'created_at' => now(), 'updated_at' => now()]);
        $b3 = DB::table('bookings')->insertGetId(['public_id' => 'BK-1026', 'customer_id' => $u1, 'provider_id' => $u2, 'title' => 'Safety inspection', 'source' => 'Direct booking', 'date_display' => '28 Aug 2026', 'agreed_amount' => 4500.00, 'commission_rate' => 10.00, 'commission_amount' => 450.00, 'provider_net_amount' => 4050.00, 'status' => 'completed', 'created_at' => now(), 'updated_at' => now()]);

        // 8. Reviews
        DB::table('reviews')->insert([
            ['public_id' => 'RV-91', 'booking_id' => $b3, 'customer_id' => $u1, 'provider_id' => $u2, 'rating' => 5, 'comment' => 'The inspection was completed clearly and on time.', 'status' => 'published', 'reports_count' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'RV-88', 'booking_id' => $b1, 'customer_id' => $u4, 'provider_id' => $u3, 'rating' => 1, 'comment' => 'The provider did not explain the additional material charge.', 'status' => 'reported', 'reports_count' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 9. Complaints
        DB::table('complaints')->insert([
            ['public_id' => 'CP-081', 'complainant_id' => $u1, 'against_user_id' => $u3, 'record_reference' => 'BK-1031', 'subject' => 'Unexpected additional charge', 'description' => 'The customer disputes an additional charge that was not understood.', 'status' => 'under review', 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'CP-074', 'complainant_id' => $u4, 'against_user_id' => $u2, 'record_reference' => 'BK-1022', 'subject' => 'Provider did not attend scheduled time', 'description' => 'Provider delayed visit.', 'status' => 'resolved', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 10. Transactions (Revenue)
        DB::table('transactions')->insert([
            ['public_id' => 'TR-401', 'booking_id' => $b3, 'customer_id' => $u1, 'provider_id' => $u2, 'source' => 'Direct booking', 'gross_amount' => 4500.00, 'commission_rate' => 10.00, 'commission_amount' => 450.00, 'provider_net_amount' => 4050.00, 'status' => 'recorded', 'recorded_at' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'TR-402', 'booking_id' => $b2, 'customer_id' => $u1, 'provider_id' => $u2, 'source' => 'Accepted offer', 'gross_amount' => 3800.00, 'commission_rate' => 10.00, 'commission_amount' => 380.00, 'provider_net_amount' => 3420.00, 'status' => 'pending', 'recorded_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['public_id' => 'TR-403', 'booking_id' => $b1, 'customer_id' => $u1, 'provider_id' => $u2, 'source' => 'Direct booking', 'gross_amount' => 3500.00, 'commission_rate' => 10.00, 'commission_amount' => 350.00, 'provider_net_amount' => 3150.00, 'status' => 'pending', 'recorded_at' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 11. Platform Settings
        DB::table('platform_settings')->insert([
            ['key' => 'platform_name', 'value' => 'ServiceLink', 'type' => 'string', 'description' => 'Platform name', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'support_email', 'value' => 'support@servicelink.test', 'type' => 'string', 'description' => 'Contact email', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'commission_rate', 'value' => '10', 'type' => 'number', 'description' => 'Default commission percentage', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'commission_status', 'value' => 'Enabled', 'type' => 'string', 'description' => 'Commission system state', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'max_file_size_mb', 'value' => '5', 'type' => 'number', 'description' => 'Max upload limit', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'provider_review_target_days', 'value' => '5', 'type' => 'number', 'description' => 'Target review days', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'provider_registration', 'value' => 'Enabled', 'type' => 'string', 'description' => 'Provider registration state', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'wanted_ad_publishing', 'value' => 'Enabled', 'type' => 'string', 'description' => 'Wanted ad publishing state', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 12. Audit Logs
        DB::table('audit_logs')->insert([
            ['public_id' => 'LG-9001', 'actor' => 'Admin User', 'action' => 'Requested provider changes', 'target' => 'PA-298', 'ip' => '127.0.0.1', 'created_at' => now()->subMinutes(15), 'updated_at' => now()],
            ['public_id' => 'LG-9000', 'actor' => 'Admin User', 'action' => 'Suspended user account', 'target' => 'US-1004', 'ip' => '127.0.0.1', 'created_at' => now()->subHours(2), 'updated_at' => now()],
            ['public_id' => 'LG-8999', 'actor' => 'Admin User', 'action' => 'Updated category', 'target' => 'CT-05', 'ip' => '127.0.0.1', 'created_at' => now()->subHours(5), 'updated_at' => now()],
        ]);
    }
}
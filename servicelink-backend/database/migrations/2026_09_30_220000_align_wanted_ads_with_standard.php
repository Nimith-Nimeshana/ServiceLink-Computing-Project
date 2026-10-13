<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('wanted_ads', function (Blueprint $table) {
            if (!Schema::hasColumn('wanted_ads', 'exact_address')) {
                $table->string('exact_address', 255)->nullable()->after('district');
            }
            if (!Schema::hasColumn('wanted_ads', 'budget_type')) {
                $table->string('budget_type', 30)->default('fixed')->after('exact_address');
            }
            if (!Schema::hasColumn('wanted_ads', 'budget_min')) {
                $table->decimal('budget_min', 12, 2)->nullable()->after('budget_type');
            }
            if (!Schema::hasColumn('wanted_ads', 'budget_max')) {
                $table->decimal('budget_max', 12, 2)->nullable()->after('budget_min');
            }
            if (!Schema::hasColumn('wanted_ads', 'preferred_date')) {
                $table->date('preferred_date')->nullable()->after('budget_max');
            }
            if (!Schema::hasColumn('wanted_ads', 'offer_deadline')) {
                $table->dateTime('offer_deadline')->nullable()->after('preferred_date');
            }
            if (!Schema::hasColumn('wanted_ads', 'published_at')) {
                $table->timestamp('published_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('wanted_ads', 'accepted_offer_id')) {
                $table->foreignId('accepted_offer_id')->nullable()->after('published_at')->constrained('offers')->nullOnDelete();
            }
            if (!Schema::hasColumn('wanted_ads', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::table('wanted_ads', function (Blueprint $table) {
            if (Schema::hasColumn('wanted_ads', 'accepted_offer_id')) {
                try { $table->dropConstrainedForeignId('accepted_offer_id'); } catch (\Exception $e) {}
            }
            $cols = ['exact_address','budget_type','budget_min','budget_max','preferred_date','offer_deadline','published_at'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('wanted_ads', $c)) {
                    try { $table->dropColumn($c); } catch (\Exception $e) {}
                }
            }
        });
    }
};

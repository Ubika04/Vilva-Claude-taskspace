<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Admin user ─────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@vilva.dev'],
            [
                'name'     => 'Alex Morgan',
                'password' => Hash::make('password'),
                'status'   => 'active',
                'timezone' => 'UTC',
            ]
        );

        $adminRole  = Role::where('name', 'admin')->first();
        $memberRole = Role::where('name', 'member')->first();
        $ownerRole  = Role::where('name', 'owner')->first();

        if ($adminRole && !$admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole->id);
        }

        // ── 2. Team members (8 people) ────────────────────────────────────────
        $teamData = [
            ['name' => 'Jordan Lee',      'email' => 'jordan@vilva.dev',   'timezone' => 'America/New_York'],
            ['name' => 'Sam Rivera',       'email' => 'sam@vilva.dev',       'timezone' => 'America/Los_Angeles'],
            ['name' => 'Taylor Kim',       'email' => 'taylor@vilva.dev',    'timezone' => 'Asia/Seoul'],
            ['name' => 'Chris Patel',      'email' => 'chris@vilva.dev',     'timezone' => 'Asia/Kolkata'],
            ['name' => 'Morgan Chen',      'email' => 'morgan@vilva.dev',    'timezone' => 'Asia/Shanghai'],
            ['name' => 'Riley Johnson',    'email' => 'riley@vilva.dev',     'timezone' => 'Europe/London'],
            ['name' => 'Avery Williams',   'email' => 'avery@vilva.dev',     'timezone' => 'Europe/Berlin'],
            ['name' => 'Quinn Thompson',   'email' => 'quinn@vilva.dev',     'timezone' => 'Australia/Sydney'],
        ];

        $members = [];
        foreach ($teamData as $td) {
            $m = User::firstOrCreate(
                ['email' => $td['email']],
                [
                    'name'     => $td['name'],
                    'password' => Hash::make('password'),
                    'status'   => 'active',
                    'timezone' => $td['timezone'],
                ]
            );
            if ($memberRole && !$m->roles()->where('role_id', $memberRole->id)->exists()) {
                $m->roles()->attach($memberRole->id);
            }
            $members[] = $m;
        }

        // ── 3. Projects (10 projects) ─────────────────────────────────────────
        $projectsData = [
            [
                'name'        => 'Website Redesign',
                'description' => 'Complete overhaul of the company website with modern UI/UX, improved performance, and accessibility compliance.',
                'color'       => '#6366f1',
                'status'      => 'active',
                'start_date'  => now()->subDays(20)->toDateString(),
                'due_date'    => now()->addDays(30)->toDateString(),
                'members'     => [0, 1, 2],
            ],
            [
                'name'        => 'Mobile App v2',
                'description' => 'Launch the second version of the mobile app with push notifications, offline mode, and Stripe payments.',
                'color'       => '#10b981',
                'status'      => 'active',
                'start_date'  => now()->subDays(10)->toDateString(),
                'due_date'    => now()->addDays(45)->toDateString(),
                'members'     => [1, 2, 3],
            ],
            [
                'name'        => 'API Integration Suite',
                'description' => 'Integrate third-party payment, analytics, and CRM APIs. Build robust webhook handling.',
                'color'       => '#f59e0b',
                'status'      => 'active',
                'start_date'  => now()->subDays(5)->toDateString(),
                'due_date'    => now()->addDays(20)->toDateString(),
                'members'     => [0, 3, 4],
            ],
            [
                'name'        => 'Q2 Marketing Campaign',
                'description' => 'Plan and execute the Q2 digital marketing strategy across email, social, and paid channels.',
                'color'       => '#ec4899',
                'status'      => 'active',
                'start_date'  => now()->toDateString(),
                'due_date'    => now()->addDays(60)->toDateString(),
                'members'     => [2, 5, 6],
            ],
            [
                'name'        => 'DevOps Infrastructure',
                'description' => 'Set up CI/CD pipelines, containerise services with Docker, and build observability dashboards.',
                'color'       => '#8b5cf6',
                'status'      => 'active',
                'start_date'  => now()->subDays(15)->toDateString(),
                'due_date'    => now()->addDays(15)->toDateString(),
                'members'     => [0, 3, 7],
            ],
            [
                'name'        => 'Customer Portal',
                'description' => 'Self-service portal for customers to manage subscriptions, invoices, and support tickets.',
                'color'       => '#14b8a6',
                'status'      => 'active',
                'start_date'  => now()->subDays(3)->toDateString(),
                'due_date'    => now()->addDays(50)->toDateString(),
                'members'     => [1, 4, 5],
            ],
            [
                'name'        => 'Data Analytics Platform',
                'description' => 'Build internal analytics platform to track product KPIs, user behaviour, and revenue metrics.',
                'color'       => '#0ea5e9',
                'status'      => 'active',
                'start_date'  => now()->subDays(7)->toDateString(),
                'due_date'    => now()->addDays(40)->toDateString(),
                'members'     => [3, 4, 6],
            ],
            [
                'name'        => 'Security Audit & Hardening',
                'description' => 'Conduct full security audit, fix vulnerabilities, and implement security best practices.',
                'color'       => '#ef4444',
                'status'      => 'active',
                'start_date'  => now()->subDays(2)->toDateString(),
                'due_date'    => now()->addDays(25)->toDateString(),
                'members'     => [0, 6, 7],
            ],
            [
                'name'        => 'Onboarding Redesign',
                'description' => 'Redesign the user onboarding experience to reduce churn in the first 7 days.',
                'color'       => '#f97316',
                'status'      => 'active',
                'start_date'  => now()->addDays(5)->toDateString(),
                'due_date'    => now()->addDays(55)->toDateString(),
                'members'     => [1, 2, 5],
            ],
            [
                'name'        => 'Internal Tools',
                'description' => 'Build internal admin tools, dashboards, and automation scripts for the operations team.',
                'color'       => '#64748b',
                'status'      => 'active',
                'start_date'  => now()->subDays(30)->toDateString(),
                'due_date'    => now()->addDays(10)->toDateString(),
                'members'     => [4, 5, 7],
            ],
        ];

        $projects      = [];
        $ownerRoleId   = $ownerRole  ? $ownerRole->id  : ($memberRole ? $memberRole->id : 1);
        $memberRoleId  = $memberRole ? $memberRole->id : 1;

        foreach ($projectsData as $pd) {
            $memberIdxs = $pd['members'];
            unset($pd['members']);

            $slug    = Str::slug($pd['name']) . '-' . Str::random(5);
            $project = Project::firstOrCreate(
                ['name' => $pd['name'], 'owner_id' => $admin->id],
                array_merge($pd, ['slug' => $slug, 'owner_id' => $admin->id])
            );
            $projects[] = $project;

            // Admin as owner
            DB::table('project_members')->updateOrInsert(
                ['project_id' => $project->id, 'user_id' => $admin->id],
                ['role_id' => $ownerRoleId, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()]
            );

            // Selected team members
            foreach ($memberIdxs as $idx) {
                DB::table('project_members')->updateOrInsert(
                    ['project_id' => $project->id, 'user_id' => $members[$idx]->id],
                    ['role_id' => $memberRoleId, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        // ── 4. Tasks ──────────────────────────────────────────────────────────
        $allTasksData = [
            // ─ Website Redesign (idx 0) ────────────────────────────
            ['project' => 0, 'title' => 'Audit current website pages and content',       'status' => 'completed',   'priority' => 'high',   'due' => -8,  'est' => 120, 'assignees' => [0]],
            ['project' => 0, 'title' => 'Stakeholder interviews and requirements doc',   'status' => 'completed',   'priority' => 'medium', 'due' => -5,  'est' => 90,  'assignees' => [1]],
            ['project' => 0, 'title' => 'Create wireframes for homepage and nav',        'status' => 'completed',   'priority' => 'high',   'due' => -3,  'est' => 180, 'assignees' => [0, 1]],
            ['project' => 0, 'title' => 'Design new color palette and typography',       'status' => 'in_progress', 'priority' => 'medium', 'due' => 3,   'est' => 240, 'assignees' => [0]],
            ['project' => 0, 'title' => 'Build responsive landing page',                 'status' => 'in_progress', 'priority' => 'urgent', 'due' => 7,   'est' => 300, 'assignees' => [1, 2]],
            ['project' => 0, 'title' => 'Implement dark mode toggle',                    'status' => 'todo',        'priority' => 'low',    'due' => 14,  'est' => 90,  'assignees' => [2]],
            ['project' => 0, 'title' => 'SEO meta tags and sitemap',                     'status' => 'todo',        'priority' => 'medium', 'due' => 18,  'est' => 120, 'assignees' => [0]],
            ['project' => 0, 'title' => 'Integrate CMS for blog section',                'status' => 'todo',        'priority' => 'high',   'due' => 20,  'est' => 200, 'assignees' => [1]],
            ['project' => 0, 'title' => 'Cross-browser and mobile testing',              'status' => 'backlog',     'priority' => 'high',   'due' => 25,  'est' => 120, 'assignees' => [0, 1, 2]],
            ['project' => 0, 'title' => 'Accessibility audit (WCAG 2.1)',                'status' => 'backlog',     'priority' => 'medium', 'due' => 27,  'est' => 150, 'assignees' => [2]],
            ['project' => 0, 'title' => 'Deploy to staging and UAT sign-off',            'status' => 'backlog',     'priority' => 'urgent', 'due' => 29,  'est' => 60,  'assignees' => [0]],
            ['project' => 0, 'title' => 'Production go-live and DNS cutover',            'status' => 'backlog',     'priority' => 'urgent', 'due' => 30,  'est' => 30,  'assignees' => [1]],

            // ─ Mobile App v2 (idx 1) ───────────────────────────────
            ['project' => 1, 'title' => 'Define v2 feature requirements',                'status' => 'completed',   'priority' => 'urgent', 'due' => -10, 'est' => 180, 'assignees' => [0]],
            ['project' => 1, 'title' => 'Update design system and component library',    'status' => 'completed',   'priority' => 'high',   'due' => -6,  'est' => 240, 'assignees' => [1]],
            ['project' => 1, 'title' => 'Redesign onboarding flow',                      'status' => 'in_progress', 'priority' => 'high',   'due' => 5,   'est' => 300, 'assignees' => [1, 2]],
            ['project' => 1, 'title' => 'Implement push notifications (FCM)',            'status' => 'in_progress', 'priority' => 'high',   'due' => 8,   'est' => 240, 'assignees' => [2]],
            ['project' => 1, 'title' => 'Add offline mode with local SQLite cache',      'status' => 'in_progress', 'priority' => 'medium', 'due' => 12,  'est' => 480, 'assignees' => [0]],
            ['project' => 1, 'title' => 'Integrate Stripe payment SDK',                  'status' => 'todo',        'priority' => 'urgent', 'due' => 15,  'est' => 360, 'assignees' => [1]],
            ['project' => 1, 'title' => 'Biometric authentication (FaceID/Fingerprint)', 'status' => 'todo',        'priority' => 'medium', 'due' => 18,  'est' => 240, 'assignees' => [2]],
            ['project' => 1, 'title' => 'In-app chat with WebSocket',                    'status' => 'todo',        'priority' => 'low',    'due' => 22,  'est' => 480, 'assignees' => [0, 1]],
            ['project' => 1, 'title' => 'Performance profiling and optimisation',        'status' => 'backlog',     'priority' => 'medium', 'due' => 28,  'est' => 240, 'assignees' => [2]],
            ['project' => 1, 'title' => 'Write unit and integration tests',              'status' => 'backlog',     'priority' => 'high',   'due' => 35,  'est' => 300, 'assignees' => [0]],
            ['project' => 1, 'title' => 'Beta release to TestFlight / Play Store',       'status' => 'backlog',     'priority' => 'medium', 'due' => 40,  'est' => 60,  'assignees' => [1]],
            ['project' => 1, 'title' => 'App Store submission and review process',       'status' => 'backlog',     'priority' => 'low',    'due' => 45,  'est' => 60,  'assignees' => [2]],

            // ─ API Integration Suite (idx 2) ───────────────────────
            ['project' => 2, 'title' => 'Map Stripe and PayPal API endpoints',          'status' => 'completed',   'priority' => 'high',   'due' => -5,  'est' => 90,  'assignees' => [0]],
            ['project' => 2, 'title' => 'Build webhook handler for payment events',     'status' => 'completed',   'priority' => 'urgent', 'due' => -2,  'est' => 180, 'assignees' => [0, 2]],
            ['project' => 2, 'title' => 'Integrate Mixpanel analytics SDK',             'status' => 'in_progress', 'priority' => 'medium', 'due' => 4,   'est' => 150, 'assignees' => [2]],
            ['project' => 2, 'title' => 'Set up API rate limiting and throttling',      'status' => 'in_progress', 'priority' => 'high',   'due' => 6,   'est' => 120, 'assignees' => [0]],
            ['project' => 2, 'title' => 'Salesforce CRM bi-directional sync',           'status' => 'todo',        'priority' => 'high',   'due' => 10,  'est' => 300, 'assignees' => [2]],
            ['project' => 2, 'title' => 'Slack notifications for key events',           'status' => 'todo',        'priority' => 'medium', 'due' => 12,  'est' => 90,  'assignees' => [0]],
            ['project' => 2, 'title' => 'OAuth 2.0 third-party login (Google, GitHub)', 'status' => 'todo',        'priority' => 'medium', 'due' => 15,  'est' => 240, 'assignees' => [2]],
            ['project' => 2, 'title' => 'API versioning and deprecation strategy',      'status' => 'backlog',     'priority' => 'low',    'due' => 18,  'est' => 120, 'assignees' => [0]],
            ['project' => 2, 'title' => 'Write full API integration documentation',     'status' => 'backlog',     'priority' => 'low',    'due' => 20,  'est' => 240, 'assignees' => [2]],

            // ─ Q2 Marketing Campaign (idx 3) ───────────────────────
            ['project' => 3, 'title' => 'Competitor research and SWOT analysis',        'status' => 'completed',   'priority' => 'high',   'due' => -3,  'est' => 180, 'assignees' => [3]],
            ['project' => 3, 'title' => 'Define Q2 OKRs and KPIs',                     'status' => 'completed',   'priority' => 'urgent', 'due' => -1,  'est' => 120, 'assignees' => [3, 4]],
            ['project' => 3, 'title' => 'Draft email drip campaign (5-email sequence)', 'status' => 'in_progress', 'priority' => 'medium', 'due' => 6,   'est' => 240, 'assignees' => [4]],
            ['project' => 3, 'title' => 'Design social media ad creatives (10 assets)', 'status' => 'in_progress', 'priority' => 'medium', 'due' => 8,   'est' => 300, 'assignees' => [3]],
            ['project' => 3, 'title' => 'Set up Google Ads campaigns and A/B tests',    'status' => 'todo',        'priority' => 'high',   'due' => 12,  'est' => 120, 'assignees' => [4]],
            ['project' => 3, 'title' => 'Launch LinkedIn sponsored posts',              'status' => 'todo',        'priority' => 'medium', 'due' => 18,  'est' => 90,  'assignees' => [3]],
            ['project' => 3, 'title' => 'Record 3 product demo videos',                 'status' => 'todo',        'priority' => 'medium', 'due' => 22,  'est' => 360, 'assignees' => [3, 4]],
            ['project' => 3, 'title' => 'Partner outreach and co-marketing deals',      'status' => 'backlog',     'priority' => 'low',    'due' => 35,  'est' => 180, 'assignees' => [4]],
            ['project' => 3, 'title' => 'Weekly KPI reporting dashboard in Looker',     'status' => 'backlog',     'priority' => 'low',    'due' => 60,  'est' => 60,  'assignees' => [3]],

            // ─ DevOps Infrastructure (idx 4) ───────────────────────
            ['project' => 4, 'title' => 'Set up GitHub Actions CI pipeline',            'status' => 'completed',   'priority' => 'urgent', 'due' => -12, 'est' => 240, 'assignees' => [0]],
            ['project' => 4, 'title' => 'Dockerize all microservices',                  'status' => 'completed',   'priority' => 'high',   'due' => -7,  'est' => 360, 'assignees' => [5]],
            ['project' => 4, 'title' => 'Configure staging environment on AWS ECS',     'status' => 'completed',   'priority' => 'urgent', 'due' => -2,  'est' => 300, 'assignees' => [0, 5]],
            ['project' => 4, 'title' => 'Set up Datadog monitoring and alerting',       'status' => 'in_progress', 'priority' => 'high',   'due' => 2,   'est' => 180, 'assignees' => [5]],
            ['project' => 4, 'title' => 'Write infrastructure as code (Terraform)',     'status' => 'in_progress', 'priority' => 'medium', 'due' => 5,   'est' => 480, 'assignees' => [0]],
            ['project' => 4, 'title' => 'Configure auto-scaling policies',              'status' => 'todo',        'priority' => 'medium', 'due' => 8,   'est' => 150, 'assignees' => [5]],
            ['project' => 4, 'title' => 'Disaster recovery and backup strategy',        'status' => 'todo',        'priority' => 'high',   'due' => 12,  'est' => 240, 'assignees' => [0]],
            ['project' => 4, 'title' => 'Zero-downtime deployment with blue/green',     'status' => 'backlog',     'priority' => 'medium', 'due' => 14,  'est' => 200, 'assignees' => [5]],

            // ─ Customer Portal (idx 5) ─────────────────────────────
            ['project' => 5, 'title' => 'Define portal user stories and personas',      'status' => 'completed',   'priority' => 'high',   'due' => -4,  'est' => 120, 'assignees' => [1]],
            ['project' => 5, 'title' => 'Design portal dashboard UI mockups',           'status' => 'in_progress', 'priority' => 'high',   'due' => 4,   'est' => 300, 'assignees' => [1, 2]],
            ['project' => 5, 'title' => 'Build authentication and SSO (SAML)',          'status' => 'in_progress', 'priority' => 'urgent', 'due' => 6,   'est' => 360, 'assignees' => [2]],
            ['project' => 5, 'title' => 'Invoice management and PDF export',            'status' => 'in_progress', 'priority' => 'high',   'due' => 10,  'est' => 240, 'assignees' => [1]],
            ['project' => 5, 'title' => 'Subscription plan upgrade/downgrade flow',     'status' => 'todo',        'priority' => 'medium', 'due' => 15,  'est' => 180, 'assignees' => [2]],
            ['project' => 5, 'title' => 'Usage metrics and quota display',              'status' => 'todo',        'priority' => 'medium', 'due' => 18,  'est' => 150, 'assignees' => [1]],
            ['project' => 5, 'title' => 'Zendesk support ticket integration',           'status' => 'todo',        'priority' => 'low',    'due' => 22,  'est' => 200, 'assignees' => [2]],
            ['project' => 5, 'title' => 'Multi-language i18n (EN, FR, DE, ES)',         'status' => 'backlog',     'priority' => 'low',    'due' => 35,  'est' => 480, 'assignees' => [1]],
            ['project' => 5, 'title' => 'User acceptance testing (UAT)',                'status' => 'backlog',     'priority' => 'high',   'due' => 42,  'est' => 300, 'assignees' => [1, 2]],
            ['project' => 5, 'title' => 'Portal go-live and customer comms',            'status' => 'backlog',     'priority' => 'urgent', 'due' => 50,  'est' => 60,  'assignees' => [2]],

            // ─ Data Analytics Platform (idx 6) ─────────────────────
            ['project' => 6, 'title' => 'Define analytics KPIs and data sources',      'status' => 'completed',   'priority' => 'high',   'due' => -5,  'est' => 120, 'assignees' => [3]],
            ['project' => 6, 'title' => 'Set up data warehouse (BigQuery)',             'status' => 'completed',   'priority' => 'urgent', 'due' => -3,  'est' => 300, 'assignees' => [3, 4]],
            ['project' => 6, 'title' => 'Build ETL pipeline for product events',       'status' => 'in_progress', 'priority' => 'high',   'due' => 5,   'est' => 480, 'assignees' => [4]],
            ['project' => 6, 'title' => 'Revenue MRR/ARR tracking dashboard',          'status' => 'in_progress', 'priority' => 'urgent', 'due' => 7,   'est' => 300, 'assignees' => [3]],
            ['project' => 6, 'title' => 'User retention and cohort analysis',          'status' => 'todo',        'priority' => 'medium', 'due' => 12,  'est' => 360, 'assignees' => [4]],
            ['project' => 6, 'title' => 'Funnel conversion tracking',                  'status' => 'todo',        'priority' => 'high',   'due' => 15,  'est' => 240, 'assignees' => [3]],
            ['project' => 6, 'title' => 'Slack weekly automated reports',              'status' => 'todo',        'priority' => 'low',    'due' => 20,  'est' => 120, 'assignees' => [4]],
            ['project' => 6, 'title' => 'Executive dashboard with drill-down',         'status' => 'backlog',     'priority' => 'medium', 'due' => 28,  'est' => 420, 'assignees' => [3, 4]],
            ['project' => 6, 'title' => 'Alerting for metric anomalies',               'status' => 'backlog',     'priority' => 'medium', 'due' => 35,  'est' => 180, 'assignees' => [4]],

            // ─ Security Audit (idx 7) ──────────────────────────────
            ['project' => 7, 'title' => 'External penetration test engagement',        'status' => 'completed',   'priority' => 'urgent', 'due' => -3,  'est' => 480, 'assignees' => [0]],
            ['project' => 7, 'title' => 'Remediate critical OWASP Top 10 findings',   'status' => 'in_progress', 'priority' => 'urgent', 'due' => 3,   'est' => 360, 'assignees' => [0, 5]],
            ['project' => 7, 'title' => 'Enable MFA for all admin accounts',           'status' => 'in_progress', 'priority' => 'high',   'due' => 5,   'est' => 90,  'assignees' => [5]],
            ['project' => 7, 'title' => 'Secrets management migration to Vault',       'status' => 'todo',        'priority' => 'high',   'due' => 8,   'est' => 240, 'assignees' => [0]],
            ['project' => 7, 'title' => 'Database encryption at rest',                 'status' => 'todo',        'priority' => 'medium', 'due' => 12,  'est' => 180, 'assignees' => [5]],
            ['project' => 7, 'title' => 'GDPR data retention policy enforcement',      'status' => 'todo',        'priority' => 'medium', 'due' => 15,  'est' => 120, 'assignees' => [0]],
            ['project' => 7, 'title' => 'Security training for all engineers',         'status' => 'backlog',     'priority' => 'low',    'due' => 20,  'est' => 120, 'assignees' => [5]],
            ['project' => 7, 'title' => 'SOC 2 Type II readiness checklist',           'status' => 'backlog',     'priority' => 'high',   'due' => 25,  'est' => 300, 'assignees' => [0]],

            // ─ Onboarding Redesign (idx 8) ─────────────────────────
            ['project' => 8, 'title' => 'Analyse drop-off points in current flow',     'status' => 'completed',   'priority' => 'high',   'due' => 3,   'est' => 120, 'assignees' => [1]],
            ['project' => 8, 'title' => 'User interviews with churned accounts',       'status' => 'todo',        'priority' => 'urgent', 'due' => 8,   'est' => 180, 'assignees' => [1, 4]],
            ['project' => 8, 'title' => 'Redesign welcome email sequence',             'status' => 'todo',        'priority' => 'medium', 'due' => 15,  'est' => 150, 'assignees' => [4]],
            ['project' => 8, 'title' => 'Interactive product tour (Intercom)',         'status' => 'todo',        'priority' => 'high',   'due' => 20,  'est' => 300, 'assignees' => [1]],
            ['project' => 8, 'title' => 'Personalised onboarding checklist UI',        'status' => 'backlog',     'priority' => 'medium', 'due' => 30,  'est' => 240, 'assignees' => [1, 4]],
            ['project' => 8, 'title' => 'A/B test new vs old onboarding funnel',       'status' => 'backlog',     'priority' => 'high',   'due' => 45,  'est' => 120, 'assignees' => [4]],
            ['project' => 8, 'title' => 'Document new onboarding playbook',            'status' => 'backlog',     'priority' => 'low',    'due' => 55,  'est' => 60,  'assignees' => [1]],

            // ─ Internal Tools (idx 9) ──────────────────────────────
            ['project' => 9, 'title' => 'Admin user management panel',                 'status' => 'completed',   'priority' => 'high',   'due' => -20, 'est' => 240, 'assignees' => [3]],
            ['project' => 9, 'title' => 'Bulk CSV data import tool',                   'status' => 'completed',   'priority' => 'medium', 'due' => -14, 'est' => 180, 'assignees' => [5]],
            ['project' => 9, 'title' => 'Automated invoice generation script',         'status' => 'completed',   'priority' => 'high',   'due' => -7,  'est' => 120, 'assignees' => [3]],
            ['project' => 9, 'title' => 'Internal HR leave management portal',         'status' => 'in_progress', 'priority' => 'medium', 'due' => 2,   'est' => 360, 'assignees' => [5]],
            ['project' => 9, 'title' => 'Slack bot for daily standup summaries',       'status' => 'in_progress', 'priority' => 'low',    'due' => 5,   'est' => 180, 'assignees' => [3]],
            ['project' => 9, 'title' => 'API usage and cost tracking dashboard',       'status' => 'todo',        'priority' => 'medium', 'due' => 8,   'est' => 150, 'assignees' => [5]],
            ['project' => 9, 'title' => 'Automated weekly backup verification',        'status' => 'backlog',     'priority' => 'low',    'due' => 10,  'est' => 60,  'assignees' => [3]],
        ];

        $position = [];
        $allMembers = array_merge([$admin], $members);

        foreach ($allTasksData as $td) {
            $project = $projects[$td['project']];
            $pos     = ($position[$project->id] ?? 0) + 1;
            $position[$project->id] = $pos;

            $completedAt = $td['status'] === 'completed' ? now()->subDays(rand(1, 3)) : null;
            $timeSpent   = $td['status'] === 'completed' ? rand(60, $td['est']) : 0;

            $task = Task::firstOrCreate(
                ['title' => $td['title'], 'project_id' => $project->id],
                [
                    'created_by'        => $admin->id,
                    'status'            => $td['status'],
                    'priority'          => $td['priority'],
                    'due_date'          => now()->addDays($td['due'])->toDateString(),
                    'estimated_minutes' => $td['est'],
                    'total_time_spent'  => $timeSpent,
                    'position'          => $pos,
                    'completed_at'      => $completedAt,
                ]
            );

            // Assign specified members + admin
            $assigneeIds = array_unique(array_merge([0], $td['assignees'] ?? []));
            foreach ($assigneeIds as $idx) {
                $user = $allMembers[$idx] ?? $admin;
                DB::table('task_assignments')->updateOrInsert(
                    ['task_id' => $task->id, 'user_id' => $user->id],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        // ── 5. Milestones (3 per project) ─────────────────────────────────────
        $milestonesData = [
            // Website Redesign
            ['project' => 0, 'title' => 'Design Phase Complete',        'desc' => 'All wireframes and visual designs approved by stakeholders.',    'due' => -2,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 0, 'title' => 'Development Sprint 1 Done',    'desc' => 'Landing page, about, and contact pages fully built and tested.',  'due' => 10,  'status' => 'open',      'color' => '#6366f1'],
            ['project' => 0, 'title' => 'Website Launch',               'desc' => 'New website live in production with all redirects in place.',     'due' => 30,  'status' => 'open',      'color' => '#f59e0b'],

            // Mobile App v2
            ['project' => 1, 'title' => 'Alpha Internal Build',         'desc' => 'Feature-complete build available for internal QA testing.',       'due' => 5,   'status' => 'open',      'color' => '#10b981'],
            ['project' => 1, 'title' => 'Payment Integration Done',     'desc' => 'Stripe SDK integrated and all payment flows tested end-to-end.',   'due' => 18,  'status' => 'open',      'color' => '#6366f1'],
            ['project' => 1, 'title' => 'App Store Launch',             'desc' => 'v2.0 published on Apple App Store and Google Play Store.',         'due' => 45,  'status' => 'open',      'color' => '#ec4899'],

            // API Integration Suite
            ['project' => 2, 'title' => 'Core Payments Live',           'desc' => 'Stripe and PayPal integrations live in production.',              'due' => -2,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 2, 'title' => 'Analytics & CRM Connected',    'desc' => 'Mixpanel and Salesforce sync deployed and validated.',             'due' => 12,  'status' => 'open',      'color' => '#6366f1'],
            ['project' => 2, 'title' => 'Full Suite Deployed',          'desc' => 'All third-party integrations live with full test coverage.',       'due' => 20,  'status' => 'open',      'color' => '#f59e0b'],

            // Q2 Marketing Campaign
            ['project' => 3, 'title' => 'Campaign Strategy Approved',   'desc' => 'OKRs, budget, and channel mix signed off by leadership.',         'due' => -1,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 3, 'title' => 'All Creatives Ready',          'desc' => 'Ad creatives, copy, and email sequences finalised.',              'due' => 12,  'status' => 'open',      'color' => '#ec4899'],
            ['project' => 3, 'title' => 'Q2 Campaign End Review',       'desc' => 'Final KPI review and lessons learned retrospective.',             'due' => 60,  'status' => 'open',      'color' => '#6366f1'],

            // DevOps Infrastructure
            ['project' => 4, 'title' => 'CI/CD Pipeline Operational',  'desc' => 'All services auto-deploy to staging on every merge to main.',     'due' => -5,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 4, 'title' => 'Observability Stack Live',     'desc' => 'Datadog dashboards and PagerDuty alerts fully configured.',       'due' => 5,   'status' => 'open',      'color' => '#8b5cf6'],
            ['project' => 4, 'title' => 'Production-Ready Infrastructure', 'desc' => 'Terraform-managed, auto-scaling, DR-tested infrastructure.',   'due' => 15,  'status' => 'open',      'color' => '#f59e0b'],

            // Customer Portal
            ['project' => 5, 'title' => 'Auth & Core Shell Done',       'desc' => 'Login, SSO, and navigation shell completed and tested.',          'due' => 8,   'status' => 'open',      'color' => '#10b981'],
            ['project' => 5, 'title' => 'Billing Module Complete',      'desc' => 'Invoices, subscriptions, and payment history fully functional.',  'due' => 20,  'status' => 'open',      'color' => '#14b8a6'],
            ['project' => 5, 'title' => 'Portal Public Launch',         'desc' => 'Customer portal rolled out to 100% of customer base.',            'due' => 50,  'status' => 'open',      'color' => '#6366f1'],

            // Data Analytics Platform
            ['project' => 6, 'title' => 'Data Warehouse Operational',  'desc' => 'BigQuery warehouse set up with initial data pipelines running.',  'due' => -3,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 6, 'title' => 'Revenue Dashboard Live',       'desc' => 'MRR, ARR, and churn dashboards available to all stakeholders.',  'due' => 10,  'status' => 'open',      'color' => '#0ea5e9'],
            ['project' => 6, 'title' => 'Full Platform Launch',         'desc' => 'All dashboards, alerts, and automated reports operational.',      'due' => 40,  'status' => 'open',      'color' => '#6366f1'],

            // Security Audit
            ['project' => 7, 'title' => 'Pentest Remediation Complete', 'desc' => 'All critical and high findings from pentest resolved.',           'due' => 5,   'status' => 'open',      'color' => '#ef4444'],
            ['project' => 7, 'title' => 'Security Baseline Achieved',   'desc' => 'MFA, secrets management, and encryption all in place.',           'due' => 15,  'status' => 'open',      'color' => '#f59e0b'],
            ['project' => 7, 'title' => 'SOC 2 Readiness Sign-off',     'desc' => 'All SOC 2 Type II controls documented and evidenced.',            'due' => 25,  'status' => 'open',      'color' => '#6366f1'],

            // Onboarding Redesign
            ['project' => 8, 'title' => 'Research Phase Complete',      'desc' => 'User interviews done and insights synthesised into recommendations.', 'due' => 10, 'status' => 'open', 'color' => '#10b981'],
            ['project' => 8, 'title' => 'New Flow in Production',       'desc' => 'Redesigned onboarding live for all new signups.',                 'due' => 35,  'status' => 'open',      'color' => '#f97316'],
            ['project' => 8, 'title' => 'Activation Rate Target Met',   'desc' => 'Day-7 activation rate hits 65% target in A/B test.',              'due' => 55,  'status' => 'open',      'color' => '#6366f1'],

            // Internal Tools
            ['project' => 9, 'title' => 'Admin Panel Live',             'desc' => 'User management and bulk operations tools deployed internally.',  'due' => -7,  'status' => 'completed', 'color' => '#10b981'],
            ['project' => 9, 'title' => 'Automation Scripts Done',      'desc' => 'All repetitive ops tasks replaced with automated scripts.',       'due' => 5,   'status' => 'open',      'color' => '#64748b'],
            ['project' => 9, 'title' => 'Full Internal Toolset Complete', 'desc' => 'HR portal, Slack bot, and monitoring dashboard all live.',      'due' => 10,  'status' => 'open',      'color' => '#6366f1'],
        ];

        foreach ($milestonesData as $md) {
            $project     = $projects[$md['project']];
            $completedAt = $md['status'] === 'completed' ? now()->subDays(1) : null;

            DB::table('milestones')->updateOrInsert(
                ['project_id' => $project->id, 'title' => $md['title']],
                [
                    'created_by'   => $admin->id,
                    'description'  => $md['desc'],
                    'due_date'     => now()->addDays($md['due'])->toDateString(),
                    'status'       => $md['status'],
                    'color'        => $md['color'],
                    'completed_at' => $completedAt,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]
            );
        }

        // ── 6. Goals ──────────────────────────────────────────────────────────
        $goalsData = [
            [
                'title'         => 'Ship Mobile App v2 by End of Quarter',
                'description'   => 'Complete all v2 features, pass QA, and publish to both app stores before Q2 ends.',
                'target_value'  => 100,
                'current_value' => 35,
                'unit'          => '%',
                'start_date'    => now()->subDays(10)->toDateString(),
                'due_date'      => now()->addDays(45)->toDateString(),
                'status'        => 'active',
                'color'         => '#10b981',
            ],
            [
                'title'         => 'Close 20 Enterprise Deals in Q2',
                'description'   => 'Acquire 20 new enterprise customers with ACV > $10k through outbound and inbound channels.',
                'target_value'  => 20,
                'current_value' => 7,
                'unit'          => 'deals',
                'start_date'    => now()->startOfMonth()->toDateString(),
                'due_date'      => now()->addDays(60)->toDateString(),
                'status'        => 'active',
                'color'         => '#6366f1',
            ],
            [
                'title'         => 'Reduce Page Load Time to Under 2s',
                'description'   => 'Optimise frontend assets, CDN configuration, and API response times for sub-2s P95 load.',
                'target_value'  => 2,
                'current_value' => 3.8,
                'unit'          => 'seconds',
                'start_date'    => now()->subDays(5)->toDateString(),
                'due_date'      => now()->addDays(20)->toDateString(),
                'status'        => 'active',
                'color'         => '#f59e0b',
            ],
            [
                'title'         => 'Achieve SOC 2 Type II Certification',
                'description'   => 'Complete all controls, evidence collection, and auditor review for SOC 2 Type II.',
                'target_value'  => 100,
                'current_value' => 20,
                'unit'          => '%',
                'start_date'    => now()->subDays(2)->toDateString(),
                'due_date'      => now()->addDays(60)->toDateString(),
                'status'        => 'active',
                'color'         => '#ef4444',
            ],
            [
                'title'         => 'Improve Day-7 Activation Rate to 65%',
                'description'   => 'Redesign onboarding flow and email sequences to increase 7-day activation from 42% to 65%.',
                'target_value'  => 65,
                'current_value' => 42,
                'unit'          => '%',
                'start_date'    => now()->addDays(5)->toDateString(),
                'due_date'      => now()->addDays(55)->toDateString(),
                'status'        => 'active',
                'color'         => '#f97316',
            ],
            [
                'title'         => 'Reduce AWS Infrastructure Costs by 30%',
                'description'   => 'Right-size EC2 instances, eliminate unused resources, and use Reserved Instances for baseline load.',
                'target_value'  => 30,
                'current_value' => 8,
                'unit'          => '%',
                'start_date'    => now()->subDays(15)->toDateString(),
                'due_date'      => now()->addDays(15)->toDateString(),
                'status'        => 'active',
                'color'         => '#8b5cf6',
            ],
            [
                'title'         => 'Log 200 Hours of Deep Work This Quarter',
                'description'   => 'Use Pomodoro and time tracking to log at least 200 focused work hours on high-value tasks.',
                'target_value'  => 200,
                'current_value' => 47,
                'unit'          => 'hours',
                'start_date'    => now()->startOfQuarter()->toDateString(),
                'due_date'      => now()->endOfQuarter()->toDateString(),
                'status'        => 'active',
                'color'         => '#0ea5e9',
            ],
            [
                'title'         => 'Launch Customer Portal on Schedule',
                'description'   => 'Deliver the self-service customer portal fully tested and on time as promised to customers.',
                'target_value'  => 100,
                'current_value' => 30,
                'unit'          => '%',
                'start_date'    => now()->subDays(3)->toDateString(),
                'due_date'      => now()->addDays(50)->toDateString(),
                'status'        => 'active',
                'color'         => '#14b8a6',
            ],
        ];

        foreach ($goalsData as $gd) {
            DB::table('goals')->updateOrInsert(
                ['user_id' => $admin->id, 'title' => $gd['title']],
                array_merge($gd, [
                    'user_id'    => $admin->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ── 7. Recalculate project progress ───────────────────────────────────
        foreach ($projects as $project) {
            $project->recalculateProgress();
        }

        $this->command->info('✓ Seeded: 10 projects, 90+ tasks, 30 milestones, 8 goals, 9 team members');
    }
}

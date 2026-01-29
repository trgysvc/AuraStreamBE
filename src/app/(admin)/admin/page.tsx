
import { createClient } from '@/lib/db/server';
import { Card } from '@/components/shared/Card';

// Backend: Data Fetching (Server Component)
async function getDashboardStats() {
    const supabase = createClient();

    // Parallel data fetching for performance
    const [
        { count: pendingCount },
        { count: activeCount },
        { count: processingCount },
        { count: rejectedCount }
    ] = await Promise.all([
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'pending_qc'),
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
        supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
    ]);

    return {
        pending: pendingCount || 0,
        active: activeCount || 0,
        processing: processingCount || 0,
        rejected: rejectedCount || 0
    };
}

export default async function AdminDashboard() {
    // Fetch real data from Backend
    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Production Overview</h2>
                <div className="text-sm text-gray-500">Live Data from Supabase</div>
            </div>

            {/* Stats Grid - Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatsCard title="Pending QC" value={stats.pending.toString()} trend="queue" status="warning" />
                <StatsCard title="Processing" value={stats.processing.toString()} trend="active" status="info" />
                <StatsCard title="Active Tracks" value={stats.active.toString()} trend="live" status="success" />
                <StatsCard title="Rejected" value={stats.rejected.toString()} trend="total" status="error" />
            </div>

            {/* Pipeline Visualization (Static for now, dynamic values) */}
            <Card title="Production Pipeline" className="w-full">
                <div className="relative py-4">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        {/* Using safe fallback values to prevent division by zero */}
                        <span>QC Queue ({stats.pending})</span>
                        <span>Processing ({stats.processing})</span>
                        <span>Live ({stats.active})</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        {/* Visual representation of ratios */}
                        <div className="bg-yellow-400 h-full" style={{ flexGrow: stats.pending || 1 }} title="Pending"></div>
                        <div className="bg-indigo-500 h-full" style={{ flexGrow: stats.processing || 1 }} title="Processing"></div>
                        <div className="bg-green-500 h-full" style={{ flexGrow: stats.active || 1 }} title="Live"></div>
                    </div>
                </div>
            </Card>

            {/* ... (Previous static cards remain for layout structure until features implemented) ... */}
        </div>
    );
}

function StatsCard({ title, value, trend, status }: { title: string, value: string, trend: string, status: 'success' | 'warning' | 'error' | 'info' }) {
    const colors = {
        success: 'text-green-600 bg-green-50',
        warning: 'text-yellow-600 bg-yellow-50',
        error: 'text-red-600 bg-red-50',
        info: 'text-blue-600 bg-blue-50',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                <span className={`text-xs px-2 py-1 rounded ${colors[status]}`}>{trend}</span>
            </div>
        </div>
    )
}

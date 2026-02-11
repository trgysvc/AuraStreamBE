import Sidebar from '@/components/dashboard/Sidebar';
import Player from '@/components/dashboard/Player';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-pink-500 selection:text-white">
            <Sidebar />

            <main className="ml-64 pb-24 min-h-screen">
                <div className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            <Player />
        </div>
    );
}

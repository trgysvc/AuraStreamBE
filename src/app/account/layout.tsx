import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Footer } from '@/components/layout/Footer';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-pink-500 selection:text-white flex flex-col">
            <DashboardHeader />
            
            <main className="flex-1 min-h-screen flex flex-col">
                <div className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
                    {children}
                </div>
                <Footer variant="dark" />
            </main>
        </div>
    );
}

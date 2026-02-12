import Sidebar from '@/components/dashboard/Sidebar';
import { Footer } from '@/components/layout/Footer';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans">
            <Sidebar />
            <main className="ml-64 min-h-screen flex flex-col">
                <div className="flex-1 p-8 max-w-[1200px] w-full mx-auto">
                    {children}
                </div>
                <Footer variant="dark" />
            </main>
        </div>
    );
}

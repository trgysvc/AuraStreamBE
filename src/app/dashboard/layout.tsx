import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Footer } from '@/components/layout/Footer';
import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-pink-500 selection:text-white flex flex-col">
            <DashboardHeader />

            <div className="flex flex-1 overflow-hidden relative">
                {/* <Sidebar /> - Removed per user request */}

                <main className="flex-1 pb-24 min-h-screen overflow-y-auto">
                    <div className="p-8 max-w-[1600px] mx-auto min-h-[60vh]">
                        {children}
                    </div>
                    <Footer variant="dark" />
                </main>
            </div>
        </div>
    );
}

import { MainHeader } from '@/components/layout/MainHeader';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
            <MainHeader />
            <div className="pt-20">
                {children}
            </div>
        </div>
    );
}

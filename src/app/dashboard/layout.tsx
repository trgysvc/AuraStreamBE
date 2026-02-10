import Link from 'next/link';
import { Home, Music, Disc, Heart, Settings, LogOut, Search, Bell } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) => (
    <Link href={href} className={`flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-md group ${active ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        <Icon size={18} strokeWidth={1.5} className={active ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'} />
        <span>{label}</span>
    </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - Glassmorphism & Minimalist */}
            <aside className="w-64 fixed inset-y-0 left-0 border-r border-white/10 bg-black/95 backdrop-blur-xl z-50 flex flex-col transition-all duration-300">
                <div className="p-8">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="text-black font-bold text-lg">A</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">AuraStream</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-4 mt-4">Discover</div>
                    <SidebarItem icon={Home} label="Overview" href="/dashboard" active />
                    <SidebarItem icon={Disc} label="New Releases" href="/dashboard/new" />
                    <SidebarItem icon={Music} label="Genres" href="/dashboard/genres" />

                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-4 mt-10">Library</div>
                    <SidebarItem icon={Heart} label="Favorites" href="/dashboard/favorites" />
                    {/* <SidebarItem icon={Disc} label="Playlists" href="/dashboard/playlists" /> */}
                    <SidebarItem icon={LogOut} label="Downloads" href="/dashboard/downloads" />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <SidebarItem icon={Settings} label="Settings" href="/settings" />
                    <button className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors w-full text-left rounded-md hover:bg-white/5">
                        <LogOut size={18} strokeWidth={1.5} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen">
                {/* Top Navigation / Search Header */}
                <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-50 px-8 py-4 flex items-center justify-between">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-none rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                                placeholder="Search for tracks, artists, or moods..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <button className="p-2 text-gray-400 hover:text-black transition-colors relative">
                            <Bell size={20} strokeWidth={1.5} />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-gray-200 border border-gray-100 overflow-hidden cursor-pointer">
                            {/* Avatar placeholder */}
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

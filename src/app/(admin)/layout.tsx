
import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                        AuraStream Factory
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavLink href="/admin" icon="📊">Dashboard</NavLink>
                    <NavLink href="/admin/upload" icon="☁️">Upload New</NavLink>
                    <NavLink href="/admin/qc" icon="🎧">QC Station</NavLink>
                    <NavLink href="/admin/catalog" icon="📂">Catalog</NavLink>
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                        <NavLink href="/admin/users" icon="👥">Users</NavLink>
                        <NavLink href="/admin/settings" icon="⚙️">Settings</NavLink>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-medium dark:text-white">Admin User</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header (Visible only on small screens) */}
                <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <span className="font-bold">Factory</span>
                    <button className="p-2">☰</button>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <span className="text-lg">{icon}</span>
            {children}
        </Link>
    );
}

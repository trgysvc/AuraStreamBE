
import Link from 'next/link';

export default function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white dark:bg-black font-sans text-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/store" className="flex items-center space-x-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                                Sonaraura
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/store" className="transition-colors hover:text-primary">
                                Browse
                            </Link>
                            <Link href="/store/curated" className="transition-colors hover:text-primary text-gray-500 dark:text-gray-400">
                                Curated
                            </Link>
                            <Link href="/store/pricing" className="transition-colors hover:text-primary text-gray-500 dark:text-gray-400">
                                Pricing
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium hover:underline">
                            Log in
                        </Link>
                        <Link href="/signup" className="hidden sm:inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-white">
                            Start Free Trial
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 py-12 bg-gray-50 dark:bg-gray-900/50">
                <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                            <li><Link href="#">Music Library</Link></li>
                            <li><Link href="#">SFX</Link></li>
                            <li><Link href="#">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                            <li><Link href="#">About</Link></li>
                            <li><Link href="#">Careers</Link></li>
                            <li><Link href="#">Blog</Link></li>
                        </ul>
                    </div>
                    {/* ... more columns */}
                </div>
            </footer>
        </div>
    );
}

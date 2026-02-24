import { SidebarFilter } from '@/components/feature/venue/SidebarFilter';
import { TrackTable } from '@/components/feature/venue/TrackTable';
import { getStoreTracks_Action } from '@/app/actions/store';

export const dynamic = 'force-dynamic';

export default async function VenuePage({
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const genres = typeof resolvedSearchParams.genre === 'string' ? resolvedSearchParams.genre.split(',') : undefined;

    // Reusing the store action with filters
    const tracks = await getStoreTracks_Action({ genres });

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0F1115]"> {/* Dark background matching design */}
            {/* Sidebar */}
            <SidebarFilter />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto pb-32"> {/* pb-32 for player space */}
                {/* Search Bar */}
                <div className="w-full max-w-xl mb-8">
                    <input
                        type="text"
                        placeholder="Search for contents"
                        className="w-full bg-gray-800 border-none rounded-lg px-4 py-3 text-gray-200 focus:ring-1 focus:ring-gray-700 placeholder-gray-500"
                    />
                </div>

                <TrackTable tracks={tracks} />
            </main>
        </div>
    );
}

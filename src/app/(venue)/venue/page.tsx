export default function VenueDashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Venue Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        Player Visualization
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-2">Schedule</h2>
                    <p>Current Zone: Main Hall</p>
                    <p>Next: Upbeat Pop (14:00)</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
                    <h2 className="text-xl font-semibold mb-2">Status</h2>
                    <p className="text-green-500 font-bold">Online</p>
                    <p>Cache: 98%</p>
                </div>
            </div>
        </div>
    );
}

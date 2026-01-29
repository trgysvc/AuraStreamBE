export default function CreatorStore() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Creator Store</h1>
            <div className="flex gap-4 mb-8">
                <input type="text" placeholder="Search tracks..." className="flex-1 p-3 rounded border dark:bg-gray-800 dark:border-gray-700" />
                <button className="px-6 py-3 bg-blue-600 text-white rounded">Search</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        Track {i}
                    </div>
                ))}
            </div>
        </div>
    );
}

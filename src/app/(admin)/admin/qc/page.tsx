'use client';

import { useState, useEffect } from 'react';
import { getPendingTracks_Action, approveTrack_Action, rejectTrack_Action } from '@/app/actions/qc';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

// Define a type for the track based on what we get from DB
// Updated to allow null created_at
type Track = {
    id: string;
    title: string;
    bpm: number | null;
    genre: string | null;
    created_at: string | null;
};

export default function QCStationPage() {
    const [queue, setQueue] = useState<Track[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Load initial data
    useEffect(() => {
        async function loadQueue() {
            setLoading(true);
            // Cast the result to the expected type to satisfy TS if the server action returns slightly different types
            const tracks = await getPendingTracks_Action() as unknown as Track[];
            setQueue(tracks);
            if (tracks.length > 0 && !selectedTrack) {
                setSelectedTrack(tracks[0]);
            }
            setLoading(false);
        }
        loadQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        const tracks = await getPendingTracks_Action() as unknown as Track[];
        setQueue(tracks);
        setLoading(false);
    }

    const handleApprove = async () => {
        if (!selectedTrack) return;
        setProcessing(true);

        const result = await approveTrack_Action(selectedTrack.id);

        if (result.success) {
            // Remove from local queue
            const nextQueue = queue.filter(t => t.id !== selectedTrack.id);
            setQueue(nextQueue);
            setSelectedTrack(nextQueue[0] || null);
        } else {
            alert(result.error);
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!selectedTrack) return;
        const reason = prompt("Rejection reason:");
        if (!reason) return;

        setProcessing(true);
        const result = await rejectTrack_Action(selectedTrack.id, reason);

        if (result.success) {
            const nextQueue = queue.filter(t => t.id !== selectedTrack.id);
            setQueue(nextQueue);
            setSelectedTrack(nextQueue[0] || null);
        }
        setProcessing(false);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">QC Station</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>Refresh</Button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
                {/* Left: Queue List */}
                <div className="col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium flex justify-between">
                        <span>Pending Queue</span>
                        <span className="bg-primary/10 text-primary px-2 rounded-full text-xs flex items-center">{queue.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : queue.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No tracks pending QC</div>
                        ) : (
                            queue.map(track => (
                                <div
                                    key={track.id}
                                    onClick={() => setSelectedTrack(track)}
                                    className={`p-3 rounded cursor-pointer border transition-colors ${selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-sm truncate">{track.title}</h4>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Pending</span>
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                                        <span>{track.bpm || '-'} BPM • {track.genre || 'Unknown'}</span>
                                        <span>{track.created_at ? new Date(track.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Main Work Area */}
                <div className="col-span-2 flex flex-col gap-6">
                    {selectedTrack ? (
                        <>
                            {/* Waveform Area Placeholder (Eventually connect AudioEngine here) */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center min-h-[200px] relative">
                                <div className="text-gray-400 text-center">
                                    <p className="text-4xl mb-2">🎵</p>
                                    <p>Waveform Visualizer for: <span className="text-primary">{selectedTrack.title}</span></p>
                                    <p className="text-xs mt-2">ID: {selectedTrack.id}</p>
                                </div>
                            </div>

                            {/* Metadata Form */}
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="font-medium mb-4">Metadata Validation</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Input label="Title" defaultValue={selectedTrack.title} disabled={processing} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
                                        <select className="w-full p-2 text-sm border rounded block bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 dark:text-white focus:border-primary focus:ring-primary" defaultValue={selectedTrack.genre || ''} disabled={processing}>
                                            <option value="">Select...</option>
                                            <option value="Techno">Techno</option>
                                            <option value="House">House</option>
                                            <option value="Pop">Pop</option>
                                            <option value="Cinematic">Cinematic</option>
                                            <option value="Lo-Fi">Lo-Fi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                                    <Button
                                        className="flex-1 bg-status-success hover:bg-green-600"
                                        onClick={handleApprove}
                                        disabled={processing}
                                        isLoading={processing}
                                    >
                                        [A] Approve & Process
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="flex-1"
                                        onClick={handleReject}
                                        disabled={processing}
                                        isLoading={processing}
                                    >
                                        [R] Reject
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                            Select a track from the queue to review
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { writeBatch, doc, Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import AuthGuard from '@/app/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [progress, setProgress] = useState(0);
    const [dataInput, setDataInput] = useState('');
    const router = useRouter();

    const handleClearData = async () => {
        if (!user) return;
        if (!confirm('Are you sure you want to DELETE ALL visits and measurements for this user? This cannot be undone.')) return;

        try {
            setStatus('loading');
            setMessage('Deleting existing data...');

            const batchSize = 400;
            const visitsRef = collection(db, 'visits');
            const qVisits = query(visitsRef, where('userId', '==', user.uid));

            const measurementsRef = collection(db, 'measurements');
            const qMeasurements = query(measurementsRef, where('userId', '==', user.uid));

            const [visitsSnapshot, measurementsSnapshot] = await Promise.all([
                getDocs(qVisits),
                getDocs(qMeasurements)
            ]);

            const totalDocs = visitsSnapshot.size + measurementsSnapshot.size;

            if (totalDocs === 0) {
                setStatus('success');
                setMessage('No data found to delete.');
                return;
            }

            const allDocs = [...visitsSnapshot.docs, ...measurementsSnapshot.docs];
            const chunks = [];

            for (let i = 0; i < allDocs.length; i += batchSize) {
                chunks.push(allDocs.slice(i, i + batchSize));
            }

            let deletedCount = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(docSnapshot => {
                    batch.delete(docSnapshot.ref);
                });
                await batch.commit();
                deletedCount += chunk.length;
                setProgress(Math.round((deletedCount / totalDocs) * 100));
            }

            setStatus('success');
            setMessage(`Successfully deleted ${deletedCount} records.`);

        } catch (error: any) {
            console.error('Clear failed:', error);
            setStatus('error');
            setMessage(error.message || 'Clear failed');
        }
    };

    const handleMigration = async () => {
        if (!user) return;

        try {
            setStatus('loading');
            setMessage('Parsing data...');

            const rows = dataInput.split('\n').map(row => row.trim()).filter(row => row.length > 0);

            if (rows.length === 0) {
                throw new Error('No data provided');
            }

            setMessage(`Found ${rows.length} rows. Starting import...`);

            const batchSize = 400;
            const chunks = [];

            for (let i = 0; i < rows.length; i += batchSize) {
                chunks.push(rows.slice(i, i + batchSize));
            }

            let processedCount = 0;
            let visitCount = 0;
            let measurementCount = 0;
            let skippedCount = 0;

            for (const chunk of chunks) {
                const batch = writeBatch(db);

                chunk.forEach(rowStr => {
                    // Handle both tab and multiple spaces which might happen during copy paste
                    const cells = rowStr.split(/\t+/);

                    // Format expected: date | type | muscle | fat
                    if (cells.length < 2) {
                        console.warn('Skipping invalid row:', rowStr);
                        skippedCount++;
                        return;
                    }

                    const dateStr = cells[0];
                    const type = cells[1];

                    if (!dateStr || !type) return;

                    let date;
                    try {
                        // Handle potentially just "YYYY-MM-DD" dates by appending time if needed, though Date() usually handles it
                        date = new Date(dateStr);
                        if (isNaN(date.getTime())) throw new Error('Invalid Date');
                    } catch (e) {
                        console.warn('Skipping invalid date:', dateStr);
                        skippedCount++;
                        return;
                    }

                    const timestamp = Timestamp.fromDate(date);

                    if (type.trim() === 'visit') {
                        const visitId = `legacy_${date.getTime()}`;
                        const visitRef = doc(db, 'visits', visitId);
                        batch.set(visitRef, {
                            userId: user.uid,
                            date: date.toISOString(),
                            timestamp: timestamp,
                            importedAt: Timestamp.now(),
                            source: 'legacy_import'
                        });
                        visitCount++;
                    } else if (type.trim() === 'body_measurement') {
                        // muscle and fat might use comma as decimal separator based on user input
                        const muscleStr = cells[2]?.replace(',', '.') || '0';
                        const fatStr = cells[3]?.replace(',', '.') || '0';

                        const muscleMass = parseFloat(muscleStr);
                        const fatMass = parseFloat(fatStr);

                        const measurementId = `legacy_${date.getTime()}`;
                        const measurementRef = doc(db, 'measurements', measurementId);

                        batch.set(measurementRef, {
                            userId: user.uid,
                            date: date.toISOString(),
                            timestamp: timestamp,
                            muscle: isNaN(muscleMass) ? 0 : muscleMass,
                            fat: isNaN(fatMass) ? 0 : fatMass,
                            source: 'legacy_import'
                        });
                        measurementCount++;
                    } else {
                        skippedCount++;
                    }
                });

                await batch.commit();
                processedCount += chunk.length;
                setProgress(Math.round((processedCount / rows.length) * 100));
            }

            setStatus('success');
            setMessage(`Imported: ${visitCount} visits, ${measurementCount} measurements. (Skipped ${skippedCount} lines)`);

        } catch (error: any) {
            console.error('Migration failed:', error);
            setStatus('error');
            setMessage(error.message || 'Migration failed');
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Data Migration Tool</h1>
                        <button
                            onClick={handleClearData}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded"
                        >
                            ⚠️ Clear All My Data
                        </button>
                    </div>

                    <div className="mb-6 text-gray-300">
                        <p className="mb-2">Paste your legacy data below.</p>
                        <p className="text-sm text-gray-400">Format: Date [tab] Type [tab] Muscle [tab] Fat</p>
                        <p className="text-sm text-gray-400">The import will apply to the currently logged in user: <span className="text-blue-400 font-bold">{user?.email || user?.displayName}</span></p>
                    </div>

                    <textarea
                        className="w-full h-64 bg-gray-700 text-sm font-mono p-4 rounded mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`2025-04-01T00:40:04.448Z\tvisit\n2025-05-25\tbody_measurement\t29,1\t33,1`}
                        value={dataInput}
                        onChange={(e) => setDataInput(e.target.value)}
                    />

                    {status === 'idle' && (
                        <button
                            onClick={handleMigration}
                            disabled={!dataInput}
                            className={`w-full font-bold py-3 px-4 rounded transition-colors ${!dataInput ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            Start Import
                        </button>
                    )}

                    {status === 'loading' && (
                        <div className="text-center">
                            <div className="mb-2 text-blue-400">Processing... {progress}%</div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-sm text-gray-400">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="text-green-400 text-xl mb-4">✓ Complete</div>
                            <p className="mb-6">{message}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => { setStatus('idle'); setDataInput(''); setMessage(''); }}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
                                >
                                    Import More
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">⚠ Error</div>
                            <p className="mb-6 text-red-300">{message}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}

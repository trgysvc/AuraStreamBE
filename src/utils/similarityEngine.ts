/**
 * similarityEngine.ts
 * 
 * Core mathematical engine for the AuraStream Smart Similarity UI.
 * Compares a reference slice of a 1000-point peak array against other tracks
 * using a sliding window algorithm with dynamic stepping and local normalization.
 */

export interface TrackData {
    id: string;
    name: string;
    peakData: number[];
    durationMs: number;
}

export interface SimilarityMatch {
    trackId: string;
    score: number; // 0.0 to 1.0 (1.0 = perfect match)
    matchStartIndex: number;
    matchEndIndex: number;
    matchStartMs: number;
    matchEndMs: number;
}

/**
 * Normalizes an array of numbers to a 0.0 - 1.0 local scale.
 * This prevents pure volume differences from skewing rhythm/energy comparison.
 */
function normalizeLocalSlice(slice: number[]): number[] {
    if (!slice.length) return [];
    const min = Math.min(...slice);
    const max = Math.max(...slice);

    if (max === min) return slice.map(() => 0); // Flatline

    return slice.map((val) => (val - min) / (max - min));
}

/**
 * Calculates Mean Squared Error between two equal-length arrays.
 * Lower MSE = higher similarity.
 */
function calculateMSE(arr1: number[], arr2: number[]): number {
    if (arr1.length !== arr2.length || arr1.length === 0) return Infinity;
    let sum = 0;
    for (let i = 0; i < arr1.length; i++) {
        const diff = arr1[i] - arr2[i];
        sum += diff * diff;
    }
    return sum / arr1.length;
}

/**
 * Finds the most similar section in a target track compared to a reference slice.
 */
export function findSimilarSections(
    referenceData: number[],
    refStartIndex: number,
    refEndIndex: number,
    targetTracks: TrackData[],
    stepSize: number = 5 // User specified optimization! Reduces loop iterations by 80%
): SimilarityMatch[] {

    // Guard clauses
    if (refStartIndex >= refEndIndex || refEndIndex > referenceData.length) return [];

    const referenceSliceRaw = referenceData.slice(refStartIndex, refEndIndex);
    const normalizedRefSlice = normalizeLocalSlice(referenceSliceRaw);
    const windowLength = normalizedRefSlice.length;

    const results: SimilarityMatch[] = [];

    for (const target of targetTracks) {
        // Skip if target doesn't have enough data
        if (!target.peakData || target.peakData.length < windowLength) continue;

        let bestScore = -Infinity;
        let bestMatchIndex = 0;

        // Sliding Window across the target track's 1000 points
        for (let i = 0; i <= target.peakData.length - windowLength; i += stepSize) {
            const targetSliceRaw = target.peakData.slice(i, i + windowLength);
            const normalizedTargetSlice = normalizeLocalSlice(targetSliceRaw);

            // Calculate MSE then invert it to get a "similarity score" where 1.0 is highest
            const mse = calculateMSE(normalizedRefSlice, normalizedTargetSlice);
            // MSE is between 0 and 1 (since both arrays are bounded 0-1).
            // Score = 1 - MSE
            const score = Math.max(0, 1 - mse);

            if (score > bestScore) {
                bestScore = score;
                bestMatchIndex = i;
            }
        }

        // Convert indices back to milliseconds for the UI
        const targetPoints = target.peakData.length;
        const msPerPoint = target.durationMs / targetPoints;

        results.push({
            trackId: target.id,
            score: bestScore,
            matchStartIndex: bestMatchIndex,
            matchEndIndex: bestMatchIndex + windowLength,
            matchStartMs: bestMatchIndex * msPerPoint,
            matchEndMs: (bestMatchIndex + windowLength) * msPerPoint,
        });
    }

    // Sort descending by highest score
    return results.sort((a, b) => b.score - a.score);
}

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export const WatermarkService = {
    /**
     * Injects a unique identifier into the audio file.
     * Currently uses high-fidelity metadata injection as a proxy for steganography.
     * Future: Add actual LSB or frequency-based steganography using a Python DSP worker.
     */
    async injectWatermark(filePath: string, assetId: string, ownerId: string): Promise<void> {
        console.log(`Watermarking Asset: ${assetId} for Owner: ${ownerId}`);
        
        try {
            // Using FFmpeg to inject a custom 'comment' or 'encoded_by' field that is hard to strip
            // but readable by our scanners.
            const metadataStr = `sonaraura_id:${assetId}|owner:${ownerId}`;
            
            // Re-encode or update metadata without re-encoding audio to preserve quality
            const outputPath = filePath.replace(path.extname(filePath), `_wm${path.extname(filePath)}`);
            
            await execAsync(`ffmpeg -i "${filePath}" -metadata comment="${metadataStr}" -metadata copyright="Sonaraura AI" -c copy "${outputPath}"`);
            
            console.log(`Watermark injected successfully into ${outputPath}`);
        } catch (e) {
            console.error('Watermarking failed:', e);
            throw e;
        }
    }
};

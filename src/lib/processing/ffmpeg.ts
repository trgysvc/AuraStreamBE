
import { spawn } from 'child_process';
// Removed unused imports: path, fs

export const FFmpegService = {
    /**
     * Transcodes a raw file to AAC (Stream optimized) with optional pitch shift
     */
    async transcode(inputPath: string, outputPath: string, options: { 
        bitrate?: string, 
        pitchRatio?: number,
        normalize?: boolean
    } = {}): Promise<void> {
        const { bitrate = '256k', pitchRatio = 1.0, normalize = true } = options;

        return new Promise((resolve, reject) => {
            const args = ['-i', inputPath];

            const filters: string[] = [];

            // 1. Loudness Normalization (-14 LUFS)
            if (normalize) {
                filters.push('loudnorm=I=-14:LRA=11:TP=-1.5');
            }

            // 2. High-Fidelity Pitch Shifting (Keeping tempo)
            if (pitchRatio !== 1.0) {
                // Formula: asetrate=sample_rate*ratio, atempo=1/ratio
                // This is a robust way to change pitch without rubberband
                // Note: we need to know the input sample rate, usually 44100 or 48000
                // For simplicity, we'll force resample to 44100
                filters.push(`aresample=44100,asetrate=44100*${pitchRatio},atempo=${1/pitchRatio}`);
            }

            if (filters.length > 0) {
                args.push('-af', filters.join(','));
            }

            args.push(
                '-c:a', 'aac',
                '-b:a', bitrate,
                '-movflags', '+faststart',
                '-y',
                outputPath
            );

            const ffmpeg = spawn('ffmpeg', args);

            ffmpeg.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`FFmpeg exited with code ${code}`));
            });

            ffmpeg.on('error', (err) => reject(err));
        });
    },

    /**
     * Legacy helper - now uses transcode internally
     */
    async transcodeToAAC(inputPath: string, outputPath: string): Promise<void> {
        return this.transcode(inputPath, outputPath, { normalize: false });
    },

    /**
     * Legacy helper - now uses transcode internally
     */
    async normalizeLoudness(inputPath: string, outputPath: string): Promise<void> {
        return this.transcode(inputPath, outputPath, { bitrate: '320k' }); // Higher bitrate for normalization
    },

    /**
     * Generates a waveform JSON for visualization
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async generateWaveform(inputPath: string): Promise<number[]> {
        // Mock implementation for MVP
        // In production: use 'audiowaveform' binary or ffmpeg filter
        return Array.from({ length: 100 }, () => Math.random());
    }
};

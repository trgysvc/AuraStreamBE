export class AudioEngine {
    private context: AudioContext | null = null;
    private gainNode: GainNode | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private is432Hz: boolean = false;

    constructor() {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
        }
    }

    public async loadTrack(url: string): Promise<void> {
        if (!this.context) return;

        // Fetch audio data
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

        this.playbuffer(audioBuffer);
    }

    private playbuffer(buffer: AudioBuffer) {
        if (!this.context || !this.gainNode) return;

        // Stop previous track if playing
        if (this.currentSource) {
            this.currentSource.stop();
        }

        this.currentSource = this.context.createBufferSource();
        this.currentSource.buffer = buffer;

        // Apply 432Hz tuning if enabled
        if (this.is432Hz) {
            // 440Hz -> 432Hz ratio is approx 0.981818
            this.currentSource.playbackRate.value = 0.981818;
        } else {
            this.currentSource.playbackRate.value = 1.0;
        }

        this.currentSource.connect(this.gainNode);
        this.currentSource.start(0);
    }

    public setVolume(value: number) {
        if (this.gainNode) {
            this.gainNode.gain.value = value;
        }
    }

    public toggle432Hz(enabled: boolean) {
        this.is432Hz = enabled;
        if (this.currentSource) {
            // Smooth transition for pitch shift
            const targetRate = enabled ? 0.981818 : 1.0;
            this.currentSource.playbackRate.setTargetAtTime(targetRate, this.context!.currentTime, 0.1);
        }
    }

    public resume() {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
    }
}

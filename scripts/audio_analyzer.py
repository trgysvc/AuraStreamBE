
import sys
import librosa
import json
import warnings
import numpy as np
import soundfile as sf
import hashlib

# Suppress warnings for clean output
warnings.filterwarnings('ignore')

def embed_watermark(y, watermark_text):
    """
    Embeds a watermark into the audio signal using LSB (Least Significant Bit) steganography.
    This is designed to be inaudible while providing a retrievable digital signature.
    """
    # 1. Convert watermark to bits
    # We use a hash to keep it fixed length and robust
    watermark_hash = hashlib.sha256(watermark_text.encode()).hexdigest()
    binary_watermark = ''.join(format(ord(c), '08b') for c in watermark_hash)
    
    # 2. Convert audio to 16-bit PCM equivalent for LSB manipulation
    # librosa loads as float32 [-1, 1], we scale to int16 range
    y_int = (y * 32767).astype(np.int16)
    
    # 3. Embed bits
    data_index = 0
    # Spread the watermark across the file (every Nth sample) to increase robustness
    step = len(y_int) // len(binary_watermark)
    if step < 1: step = 1
    
    for i in range(0, len(y_int), step):
        if data_index < len(binary_watermark):
            bit = int(binary_watermark[data_index])
            # Clear the LSB and set it to our watermark bit
            y_int[i] = (y_int[i] & ~1) | bit
            data_index += 1
    
    # 4. Convert back to float32
    y_watermarked = y_int.astype(np.float32) / 32767.0
    return y_watermarked

def analyze_audio(file_path, watermark_uuid=None):
    try:
        # Load audio file
        y, sr = librosa.load(file_path)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # 1. Extract BPM
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 2. Extract Key
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_index = chroma.mean(axis=1).argmax()
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = notes[key_index]
        
        # 3. Energy estimate
        rms = librosa.feature.rms(y=y)
        energy = float(rms.mean() * 100)
        
        # 4. Extract Waveform (100 points)
        total_samples = len(y)
        points = 100
        hop_length = total_samples // points
        if hop_length < 1: hop_length = 1
        
        waveform = []
        for i in range(0, total_samples, hop_length):
            chunk = y[i:i+hop_length]
            if len(chunk) > 0:
                peak = float(max(abs(chunk)))
                waveform.append(round(peak, 4))
        
        max_val = max(waveform) if waveform else 0
        if max_val > 0:
            waveform = [round(x / max_val, 3) for x in waveform]
        
        # 5. WATERMARKING (If UUID provided)
        if watermark_uuid:
            y = embed_watermark(y, watermark_uuid)
            # Save the watermarked file back to the same path
            sf.write(file_path, y, sr)

        result = {
            "duration": round(duration, 2),
            "bpm": int(float(tempo)),
            "key": key,
            "energy": round(energy, 2),
            "waveform": waveform,
            "watermarked": True if watermark_uuid else False
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # arg1: file_path, arg2: watermark_uuid (optional)
        path = sys.argv[1]
        uuid = sys.argv[2] if len(sys.argv) > 2 else None
        analyze_audio(path, uuid)

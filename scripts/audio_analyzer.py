
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
        
        # 4. Extract Acoustic Matrix (Exactly 5000 points, 54 features)
        total_samples = len(y)
        track_id = sys.argv[3] if len(sys.argv) > 3 else "unknown"
        frames_target = 5000
        hop_length = total_samples // frames_target
        if hop_length < 1: hop_length = 1

        def trim_expand(feat):
            if feat.ndim == 1:
                if len(feat) >= frames_target:
                    return feat[:frames_target]
                else:
                    return np.pad(feat, (0, frames_target - len(feat)), 'edge')
            else:
                if feat.shape[1] >= frames_target:
                    return feat[:, :frames_target]
                else:
                    return np.pad(feat, ((0, 0), (0, frames_target - feat.shape[1])), 'edge')

        rms_feat = librosa.feature.rms(y=y, hop_length=hop_length)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop_length)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop_length)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr, hop_length=hop_length)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, hop_length=hop_length)
        spectral_flatness = librosa.feature.spectral_flatness(y=y, hop_length=hop_length)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y=y, hop_length=hop_length)
        mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop_length, n_mfcc=20)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
        
        # Tonnetz requires strictly valid chroma. If chroma has all zeros, it might throw a warning, but librosa handles it.
        tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(y), sr=sr, chroma=chroma)
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr, hop_length=hop_length)

        rms_feat = trim_expand(rms_feat[0])
        onset_env = trim_expand(onset_env)
        # Normalize RMS and Onset to 0.0 - 1.0 safely
        if np.max(rms_feat) > 0:
            rms_feat = rms_feat / np.max(rms_feat)
        if np.max(onset_env) > 0:
            onset_env = onset_env / np.max(onset_env)

        spectral_centroid = trim_expand(spectral_centroid[0])
        spectral_bandwidth = trim_expand(spectral_bandwidth[0])
        spectral_rolloff = trim_expand(spectral_rolloff[0])
        spectral_flatness = trim_expand(spectral_flatness[0])
        zero_crossing_rate = trim_expand(zero_crossing_rate[0])

        mfcc = trim_expand(mfcc)
        chroma = trim_expand(chroma)
        tonnetz = trim_expand(tonnetz)
        spectral_contrast = trim_expand(spectral_contrast)

        times = librosa.frames_to_time(np.arange(frames_target), sr=sr, hop_length=hop_length)
        
        matrix = []
        chroma_names = ["C", "C_sharp", "D", "D_sharp", "E", "F", "F_sharp", "G", "G_sharp", "A", "A_sharp", "B"]
        for i in range(frames_target):
            frame = {
                "frame_index": i,
                "t": round(float(times[i]), 4),
                "rms": round(float(rms_feat[i]), 4),
                "onset_strength": round(float(onset_env[i]), 4),
                "spectral_centroid": round(float(spectral_centroid[i]), 4),
                "spectral_bandwidth": round(float(spectral_bandwidth[i]), 4),
                "spectral_rolloff": round(float(spectral_rolloff[i]), 4),
                "spectral_flatness": round(float(spectral_flatness[i]), 4),
                "zero_crossing_rate": round(float(zero_crossing_rate[i]), 4)
            }
            for m in range(20):
                frame[f"mfcc_{m+1}"] = round(float(mfcc[m, i]), 4)
            for c in range(12):
                frame[f"chroma_{chroma_names[c]}"] = round(float(chroma[c, i]), 4)
            for tz in range(6):
                frame[f"tonnetz_{tz+1}"] = round(float(tonnetz[tz, i]), 4)
            for sc in range(7):
                frame[f"contrast_{sc+1}"] = round(float(spectral_contrast[sc, i]), 4)
            matrix.append(frame)
            
        matrix_file_path = f"/tmp/{track_id}_acoustic_matrix.json"
        with open(matrix_file_path, 'w') as f:
            json.dump(matrix, f)
        
        # 5. WATERMARKING (If UUID provided)
        if watermark_uuid:
            y = embed_watermark(y, watermark_uuid)
            # Save the watermarked file back to the same path, strictly as WAV
            # subtype='PCM_16' ensures standard 16-bit WAV compatible with ffmpeg
            sf.write(file_path, y, sr, format='WAV', subtype='PCM_16')

        result = {
            "duration": round(duration, 2),
            "bpm": int(float(tempo)),
            "key": key,
            "energy": round(energy, 2),
            "matrix_file_path": matrix_file_path,
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

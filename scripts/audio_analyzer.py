
import sys
import librosa
import json
import warnings

# Suppress warnings for clean output
warnings.filterwarnings('ignore')

def analyze_audio(file_path):
    try:
        # Load audio file
        y, sr = librosa.load(file_path)
        
        # 1. Extract BPM
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 2. Extract Key
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        key_index = chroma.mean(axis=1).argmax()
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key = notes[key_index]
        
        # 3. Energy estimate (RMS energy)
        rms = librosa.feature.rms(y=y)
        energy = float(rms.mean() * 100) # Scale for easier reading
        
        # 4. Extract Waveform (100 points)
        # Resample to a small number of points for visualization
        # We want ~100 points. 
        # Strategy: distinct max peaks in windows
        total_samples = len(y)
        points = 100
        hop_length = total_samples // points
        if hop_length < 1: hop_length = 1
        
        waveform = []
        for i in range(0, total_samples, hop_length):
            chunk = y[i:i+hop_length]
            if len(chunk) > 0:
                # Get max amplitude in this chunk
                peak = float(max(abs(chunk)))
                waveform.append(round(peak, 4))
        
        # Normalize if max is > 0 (avoid div by zero)
        max_val = max(waveform) if waveform else 0
        if max_val > 0:
            waveform = [round(x / max_val, 3) for x in waveform]
        
        # Ensure we have exactly 100 points (handle rounding errors)
        if len(waveform) > points:
            waveform = waveform[:points]
        while len(waveform) < points:
             waveform.append(0.0)

        result = {
            "bpm": int(float(tempo)),
            "key": key,
            "energy": round(energy, 2),
            "waveform": waveform
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_audio(sys.argv[1])

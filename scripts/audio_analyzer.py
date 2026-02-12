
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
        
        result = {
            "bpm": int(float(tempo)),
            "key": key,
            "energy": round(energy, 2)
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        analyze_audio(sys.argv[1])

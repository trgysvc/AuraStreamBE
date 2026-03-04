
import os
from pathlib import Path
from mutagen.id3 import ID3, TIT2
from mutagen.mp3 import MP3

PROCESSED_DIR = Path('/Users/trgysvc/Music/Suno_03_EnergyFitness/Bushido Beats_Processed')

# Mapping for unique track names based on narratives
RENAME_MAP = {
    "Kusanagi’s Edge (Kusanagi no Tsurugi).mp3": "Kusanagi’s Edge",
    "Kusanagi’s Edge (Kusanagi no Tsurugi) (2).mp3": "Stormborn Steel",
    
    "The Red Torii Sprint.mp3": "The Red Torii Sprint",
    "The Red Torii Sprint (2).mp3": "Sacred Portal",
    
    "Oni’s Iron Club (Kanabo Strength).mp3": "Oni’s Iron Club",
    "Oni’s Iron Club (Kanabo Strength) (2).mp3": "Shattered Marble",
    
    "Neon Shibuya Pulse.mp3": "Neon Shibuya Pulse",
    "Neon Shibuya Pulse (2).mp3": "Electric Intersection",
    
    "The Way of the Ronin.mp3": "The Way of the Ronin",
    "The Way of the Ronin (2).mp3": "Dust and Independence"
}

def finalize_album():
    print(f"Finalizing Bushido Beats Album in {PROCESSED_DIR}...")
    
    files = list(PROCESSED_DIR.glob('*.mp3'))
    
    for mp3_path in files:
        filename = mp3_path.name
        if filename in RENAME_MAP:
            new_title = RENAME_MAP[filename]
            new_filename = f"{new_title}.mp3"
            new_path = PROCESSED_DIR / new_filename
            
            print(f"Refining: {filename} -> {new_title}")
            
            # 1. Update ID3 Title
            audio = MP3(mp3_path, ID3=ID3)
            audio.tags.add(TIT2(encoding=3, text=new_title))
            audio.save()
            
            # 2. Rename File
            os.rename(mp3_path, new_path)
        else:
            print(f"Skipping (No map): {filename}")

if __name__ == "__main__":
    finalize_album()

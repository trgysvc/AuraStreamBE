
import os
import json
import re
import shutil
from pathlib import Path

# Use mutagen for robust tagging
try:
    from mutagen.id3 import ID3, TIT2, TPE1, TCON, COMM, USLT
    from mutagen.mp3 import MP3
    MUTAGEN_AVAILABLE = True
except ImportError:
    MUTAGEN_AVAILABLE = False

SOURCE_DIR = Path('/Users/trgysvc/Music/Suno_03_Social_Dining')
OUTPUT_DIR = Path('/Users/trgysvc/Music/Suno_03_Social_Dining_Processed')

OUTPUT_DIR.mkdir(exist_ok=True)

def clean_text(text):
    if not text: return ""
    # Replace underscores and dashes with spaces for display/tagging
    return text.replace('_', ' ').replace('-', ' ').strip()

def get_unique_filename(base_name, tags_str, current_index):
    # Differentiate variations by including first tag or mood if duplicate title exists
    tags_list = [t.strip() for t in tags_str.split(',') if t.strip()]
    tag_suffix = f" ({tags_list[0]})" if tags_list else ""
    # If the title already has something similar, don't double up
    if tag_suffix.lower() in base_name.lower():
        tag_suffix = ""
    
    # We'll use a simple counter for the final filename if title+tag still collide
    return f"{base_name}{tag_suffix}"

def process_files():
    if not MUTAGEN_AVAILABLE:
        print("Mutagen not found. Please run: pip install mutagen")
        return

    processed_names = {}

    # List all mp3 files
    mp3_files = sorted(list(SOURCE_DIR.glob('*.mp3')))
    print(f"Found {len(mp3_files)} MP3 files.")
    
    for mp3_path in mp3_files:
        txt_path = SOURCE_DIR / (mp3_path.name + '.txt')
        
        if not txt_path.exists():
            print(f"Skipping {mp3_path.name}: No metadata file found.")
            continue

        try:
            content = txt_path.read_text(encoding='utf-8')
            # Extract JSON part from the bottom of the file
            json_match = re.search(r'--- Raw API Response ---\s*({.*})', content, re.DOTALL)
            if not json_match:
                print(f"Skipping {mp3_path.name}: Could not find JSON metadata.")
                continue
                
            metadata = json.loads(json_match.group(1))
            
            raw_title = metadata.get('title', 'Unknown Title')
            artist = metadata.get('display_name', 'turgay')
            genre_tags = metadata.get('display_tags', 'Ambient')
            
            # Metadata info
            prompt = metadata.get('metadata', {}).get('tags', '')
            lyrics_and_atmosphere = metadata.get('metadata', {}).get('prompt', '')
            
            # 1. Clean up title (remove underscores, fix casing)
            clean_title = clean_text(raw_title)
            
            # 2. Handle duplicates by using tags or increment
            base_id = clean_title.lower()
            if base_id not in processed_names:
                processed_names[base_id] = 1
                final_title = clean_title
            else:
                processed_names[base_id] += 1
                # Include first tag to differentiate
                first_tag = genre_tags.split(',')[0].strip() if genre_tags else "version"
                final_title = f"{clean_title} ({first_tag})"
                
                # Double check if this new title is also taken
                final_id = final_title.lower()
                if final_id in processed_names:
                     processed_names[final_id] += 1
                     final_title = f"{final_title} v{processed_names[final_id]}"
                else:
                     processed_names[final_id] = 1

            new_filename = f"{final_title}.mp3"
            new_path = OUTPUT_DIR / new_filename

            # Create a clean copy first (avoid modifying originals)
            shutil.copy2(mp3_path, new_path)

            # 3. ID3 Tagging on the NEW file
            audio = MP3(new_path, ID3=ID3)
            try:
                audio.add_tags()
            except:
                pass
            
            # TIT2: Title, TPE1: Artist, TCON: Genre
            audio.tags.add(TIT2(encoding=3, text=final_title))
            audio.tags.add(TPE1(encoding=3, text=artist))
            audio.tags.add(TCON(encoding=3, text=genre_tags))
            # COMM: Comments (Prompt), USLT: Lyrics
            audio.tags.add(COMM(encoding=3, lang='eng', desc='Prompt', text=prompt))
            audio.tags.add(USLT(encoding=3, lang='eng', desc='Atmosphere', text=lyrics_and_atmosphere))
            
            audio.save()
            print(f"✅ Processed: {new_filename}")

        except Exception as e:
            print(f"❌ Error processing {mp3_path.name}: {str(e)}")

if __name__ == "__main__":
    process_files()

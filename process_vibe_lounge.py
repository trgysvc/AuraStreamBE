
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

SOURCE_DIR = Path('/Users/trgysvc/Music/Suno_03_Vibe_Lounge')
OUTPUT_DIR = Path('/Users/trgysvc/Music/Suno_03_Vibe_Lounge_Processed')
MAPPING_FILE = Path('/Users/trgysvc/Documents/Developer info and Docs/AuraStream/prompts/VELVET_ARCHITECTURE_MAPPING.md')

def load_venue_mapping():
    mapping = {}
    if not MAPPING_FILE.exists():
        return mapping
    
    content = MAPPING_FILE.read_text()
    # Match table rows: | ID | Title | Venues | Vibe |
    rows = re.findall(r'\| \d+ \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|', content)
    for title, venues, vibes in rows:
        mapping[title.strip().lower()] = {
            'venues': venues.strip(),
            'vibes': vibes.strip()
        }
    return mapping

def clean_text(text):
    if not text: return ""
    # Remove Suno-specific prefix if exists
    text = re.sub(r'^My_Workspace-', '', text)
    # Remove ID-like strings at the end
    text = re.sub(r'-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', '', text)
    return text.replace('_', ' ').replace('-', ' ').strip()

def process_files():
    if not MUTAGEN_AVAILABLE:
        print("Mutagen not found.")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    venue_map = load_venue_mapping()
    processed_names = {}

    mp3_files = sorted(list(SOURCE_DIR.glob('*.mp3')))
    print(f"Found {len(mp3_files)} MP3 files in {SOURCE_DIR}")
    
    for mp3_path in mp3_files:
        txt_path = SOURCE_DIR / (mp3_path.name + '.txt')
        
        if not txt_path.exists():
            continue

        try:
            content = txt_path.read_text(encoding='utf-8')
            json_match = re.search(r'--- Raw API Response ---\s*({.*})', content, re.DOTALL)
            if not json_match:
                continue
                
            metadata = json.loads(json_match.group(1))
            
            raw_title = metadata.get('title', 'Unknown Title')
            artist = "Sonaraura Studio"
            genre_tags = metadata.get('display_tags', 'Lounge')
            
            prompt = metadata.get('metadata', {}).get('tags', '')
            lyrics_and_atmosphere = metadata.get('metadata', {}).get('prompt', '')
            
            # 1. Clean up title
            clean_title = clean_text(raw_title)
            
            # 2. Handle duplicates
            base_id = clean_title.lower()
            if base_id not in processed_names:
                processed_names[base_id] = 1
                final_title = clean_title
            else:
                processed_names[base_id] += 1
                tag_hint = genre_tags.split(',')[0].strip() if genre_tags else "v" + str(processed_names[base_id])
                final_title = f"{clean_title} ({tag_hint})"
                if final_title.lower() in processed_names:
                    final_title = f"{clean_title} ({tag_hint}) {processed_names[base_id]}"

            # 3. Lookup Venue/Vibe from mapping
            extra_info = ""
            match_info = venue_map.get(clean_title.lower())
            if match_info:
                extra_info = f"Target Venues: {match_info['venues']} | Mood: {match_info['vibes']}"

            new_filename = f"{final_title}.mp3"
            new_path = OUTPUT_DIR / new_filename
            
            shutil.copy2(mp3_path, new_path)

            # 4. ID3 Tagging
            audio = MP3(new_path, ID3=ID3)
            try:
                audio.add_tags()
            except:
                pass
            
            audio.tags.add(TIT2(encoding=3, text=final_title))
            audio.tags.add(TPE1(encoding=3, text=artist))
            audio.tags.add(TCON(encoding=3, text=genre_tags))
            
            full_comment = f"{extra_info}\n\nPrompt: {prompt}".strip()
            audio.tags.add(COMM(encoding=3, lang='eng', desc='Metadata', text=full_comment))
            audio.tags.add(USLT(encoding=3, lang='eng', desc='Atmosphere', text=lyrics_and_atmosphere))
            
            audio.save()
            print(f"✅ Processed: {new_filename}")

        except Exception as e:
            print(f"❌ ERR {mp3_path.name}: {str(e)}")

    print(f"\nFinished. Files are in: {OUTPUT_DIR}")

if __name__ == "__main__":
    process_files()

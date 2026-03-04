
import os
import json
import re
import shutil
from pathlib import Path

# Use mutagen for robust tagging
try:
    from mutagen.id3 import ID3, TIT2, TPE1, TALB, TCON, COMM, USLT
    from mutagen.mp3 import MP3
    MUTAGEN_AVAILABLE = True
except ImportError:
    MUTAGEN_AVAILABLE = False

SOURCE_DIR = Path('/Users/trgysvc/Music/Suno_03_EnergyFitness/Bushido Beats')
OUTPUT_DIR = Path('/Users/trgysvc/Music/Suno_03_EnergyFitness/Bushido Beats_Processed')
PROMPT_FILE = Path('/Users/trgysvc/Documents/Developer info and Docs/AuraStream/prompts/Week3_SportsFitness.md')

def load_narratives():
    narratives = {}
    if not PROMPT_FILE.exists():
        print(f"Warning: Prompt file not found at {PROMPT_FILE}")
        return narratives
    
    content = PROMPT_FILE.read_text(encoding='utf-8')
    # Match Title and Narrative
    # 1. Kusanagi’s Edge (Kusanagi no Tsurugi)\n\nNarrative: Efsanevi kılıç...
    sections = re.split(r'\n\d+\.\s*', content)
    for section in sections:
        lines = section.strip().split('\n')
        if not lines: continue
        
        title_line = lines[0].strip()
        # Extract title before parentheses if any
        title_match = re.match(r'^([^(\n]+)', title_line)
        if title_match:
            clean_title = title_match.group(1).strip().lower()
            narr_match = re.search(r'Narrative:\s*(.*)', section)
            if narr_match:
                narratives[clean_title] = narr_match.group(1).strip()
    
    return narratives

def clean_title_text(text):
    if not text: return ""
    # Remove My_Workspace-
    text = re.sub(r'^My_Workspace-', '', text)
    # Remove Suno IDs (-abc1234...)
    text = re.sub(r'-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$', '', text)
    # Replace underscores/dashes with spaces
    text = text.replace('_', ' ').replace('-', ' ').strip()
    return text

def process_bushido():
    if not MUTAGEN_AVAILABLE:
        print("Mutagen not found.")
        return

    if not SOURCE_DIR.exists():
        print(f"Source dir not found: {SOURCE_DIR}")
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    narrative_map = load_narratives()
    processed_titles = {}

    mp3_files = sorted(list(SOURCE_DIR.glob('*.mp3')))
    print(f"Processing {len(mp3_files)} files from {SOURCE_DIR}")

    for mp3_path in mp3_files:
        # Check for metadata file
        txt_path = SOURCE_DIR / (mp3_path.name + '.txt')
        if not txt_path.exists():
            # Fallback for .mp3.txt
            txt_path = Path(str(mp3_path) + '.txt')
        
        if not txt_path.exists():
            print(f"Skipping {mp3_path.name}: No metadata file.")
            continue

        try:
            content = txt_path.read_text(encoding='utf-8')
            json_match = re.search(r'--- Raw API Response ---\s*({.*})', content, re.DOTALL)
            if not json_match:
                print(f"Skipping {mp3_path.name}: No JSON in metadata.")
                continue
                
            metadata = json.loads(json_match.group(1))
            raw_title = metadata.get('title', 'Unknown')
            genre_tags = metadata.get('display_tags', '')
            suno_prompt = metadata.get('metadata', {}).get('tags', '')
            atmosphere = metadata.get('metadata', {}).get('prompt', '')

            # 1. Title Normalization
            clean_title = clean_title_text(raw_title)
            
            # 2. Duplicate Handling
            title_id = clean_title.lower()
            if title_id not in processed_titles:
                processed_titles[title_id] = 1
                final_title = clean_title
            else:
                processed_titles[title_id] += 1
                final_title = f"{clean_title} ({processed_titles[title_id]})"

            # 3. Match Narrative
            # Try exact, then starts with
            narrative = "No narrative found."
            search_title = clean_title.lower()
            if search_title in narrative_map:
                narrative = narrative_map[search_title]
            else:
                # Fuzzy match for titles like "Kusanagi’s Edge (Kusanagi no Tsurugi)"
                for k, v in narrative_map.items():
                    if k in search_title or search_title in k:
                        narrative = v
                        break

            # 4. Final Metadata Preparation
            new_filename = f"{final_title}.mp3"
            new_path = OUTPUT_DIR / new_filename
            shutil.copy2(mp3_path, new_path)

            # 5. ID3 Tagging
            audio = MP3(new_path, ID3=ID3)
            try:
                audio.add_tags()
            except:
                pass
            
            # Album and Artist
            audio.tags.add(TIT2(encoding=3, text=final_title))
            audio.tags.add(TPE1(encoding=3, text="Sonaraura Studio"))
            audio.tags.add(TALB(encoding=3, text="Bushido Beats"))
            
            # Genre
            final_genre = f"{genre_tags}, Workout"
            audio.tags.add(TCON(encoding=3, text=final_genre))

            # Comments with Venue/Vibe/Theme/Narrative
            comment_text = (
                f"Target Venues: Gym & CrossFit, Fitness Studio, Dojo | "
                f"Mood: Workout, High Energy | "
                f"Theme: Bushido Beats, Sports & Action | "
                f"Narrative: {narrative}\n\n"
                f"Technical Prompt: {suno_prompt}"
            )
            audio.tags.add(COMM(encoding=3, lang='eng', desc='Metadata', text=comment_text))
            
            # Atmosphere/Lyrics in USLT
            audio.tags.add(USLT(encoding=3, lang='eng', desc='Atmosphere', text=atmosphere))
            
            audio.save()
            print(f"✅ Processed: {new_filename}")

        except Exception as e:
            print(f"❌ Error {mp3_path.name}: {str(e)}")

    print(f"\nCompleted. Files available in: {OUTPUT_DIR}")

if __name__ == "__main__":
    process_bushido()

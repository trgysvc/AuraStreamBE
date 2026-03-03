import os
import json
import re
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv('/Users/trgysvc/Developer/AuraStreamBE/.env.local')
url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
supabase: Client = create_client(url, key)

def get_all_txt_files(directory):
    txt_files = []
    for root, dirs, files in os.walk(directory):
        if 'Processed' in root or 'Trash' in root:
            continue
        for file in files:
            if file.endswith('.txt'):
                txt_files.append(os.path.join(root, file))
    return txt_files

def normalize_title(title):
    title = re.sub(r'\(.*?\)', '', title) # Remove anything in parentheses
    title = re.sub(r'[^a-zA-Z0-9\s]', '', title) # Remove special chars
    return ' '.join(title.split()).lower().strip() # normalize space and lower

def main():
    print("Fetching tracks from database...")
    response = supabase.table('tracks').select('id, title, genre').execute()
    db_tracks = response.data
    
    problematic = [t for t in db_tracks if not t.get('genre') or t.get('genre', '').lower() in ['ambient', 'unknown', '']]
    print(f"Found {len(problematic)} tracks with generic/missing genre.")
    
    txt_files = get_all_txt_files('/Users/trgysvc/Music')
    print(f"Found {len(txt_files)} local metadata files.")
    
    metadata_map = {}
    for file_path in txt_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            title_match = re.search(r'Title:\s*(.+)', content)
            if not title_match: continue
            title = title_match.group(1).strip()
            
            json_match = re.search(r'---\s*Raw API Response\s*---\s*(\{.*\})', content, re.DOTALL)
            genre = ''
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    genre = data.get('display_tags', '')
                except:
                    pass
                    
            if title and genre and genre.lower() != 'ambient':
                norm_title = normalize_title(title)
                metadata_map[norm_title] = genre
        except Exception as e:
            pass

    print(f"Parsed {len(metadata_map)} valid genres from text files.")
    
    suggestions = []
    for track in problematic:
        db_title = normalize_title(track['title'])
        if db_title in metadata_map:
            genre = metadata_map[db_title]
            if genre and genre != track.get('genre'):
                suggestions.append({
                    'id': track['id'],
                    'title': track['title'],
                    'current_genre': track.get('genre', ''),
                    'suggested_genre': genre
                })
                
    print(f"\nFound {len(suggestions)} matches:")
    for s in suggestions:
        print(f"- {s['title']}: {s['current_genre']} -> {s['suggested_genre']}")
        
    with open('genre_suggestions.json', 'w') as f:
        json.dump(suggestions, f, indent=2)
    print("\nSaved suggestions to genre_suggestions.json")

if __name__ == '__main__':
    main()

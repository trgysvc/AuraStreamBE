
import os
import shutil
from datetime import datetime
from pathlib import Path

source_dir = Path('/Users/trgysvc/Music/Suno_V5_week3_social_dining')
target_dir = Path('/Users/trgysvc/Music/Suno_V5_March2_Exact_Created')

target_dir.mkdir(exist_ok=True)

count = 0
for item in source_dir.iterdir():
    if item.is_file():
        # Get birth time (creation time) on macOS
        stat = item.stat()
        try:
            # st_birthtime is specific to BSD/macOS
            creation_time = datetime.fromtimestamp(stat.st_birthtime)
        except AttributeError:
            # Fallback to mtime if birthtime is not available
            creation_time = datetime.fromtimestamp(stat.st_ctime)
            
        if creation_time.year == 2026 and creation_time.month == 3 and creation_time.day == 2:
            shutil.copy2(item, target_dir / item.name)
            count += 1

print(f"Total files with exact creation date March 2nd: {count}")

for title in "Calm v. Disquiet" "My Light Will Go On" "3 Bandits" "A Jazzy Winter Scenery" "Crowds and a Glass"; do
  echo "Searching for $title..."
  find /Users/trgysvc/Music -type f -name "*.txt" | xargs grep -i -l "$(echo $title | sed 's/v\./vs/g; s/[^a-zA-Z0-9 ]//g')" || true
done

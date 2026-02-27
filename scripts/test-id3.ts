import jsmediatags from 'jsmediatags';

const filePath = '/Users/trgysvc/Developer/AuraStreamBE/Velvet Neon Gravity.mp3';

console.log(`Reading ID3 tags for: ${filePath}`);

jsmediatags.read(filePath, {
    onSuccess: function (tag: any) {
        console.log('\n✅ Successfully read tags:');

        const tags: any = tag.tags || {};

        console.log({
            Title: tags.title || 'Not Found',
            Artist: tags.artist || 'Not Found',
            Album: tags.album || 'Not Found',
            Year: tags.year || 'Not Found',
            Genre: tags.genre || 'Not Found',
            Track: tags.track || 'Not Found',
            BPM: tags.TBPM?.data || tags.bpm || 'Not Found',
            HasPicture: !!tags.picture,
            HasLyrics: !!(tags.lyrics?.lyrics || tags.USLT?.lyrics)
        });

        // Print all raw tag keys to see exactly what's available
        console.log('\n📋 Raw Tag Keys Available:');
        console.log(Object.keys(tags));
    },
    onError: function (error) {
        console.error('❌ Error reading tags:', error.type, error.info);
    }
});

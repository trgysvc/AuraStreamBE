import fs from 'fs';
import path from 'path';

const rootDir = '/Users/trgysvc/Developer/AuraStreamBE';
const excludeDirs = ['node_modules', '.next', '.git', 'docs', '1_projectdocumentation']; // Docs can be updated separately if needed, but let's do them too
const targetFiles = [
    'PROGRESS.md',
    'README.md',
    'supabase/schema.sql',
    'src/app/(creator)/layout.tsx',
    'src/app/actions/venue.ts',
    'src/app/actions/store.ts',
    'src/app/account/page.tsx',
    'src/app/(auth)/signup/page.tsx',
    'src/app/page.tsx',
    'src/app/pricing/page.tsx',
    'src/app/(admin)/layout.tsx',
    'src/components/feature/creator/Library.tsx',
    'src/components/feature/venue/TrackTable.tsx',
    'src/components/feature/licensing/LicenseWizard.tsx',
    'src/lib/processing/worker.ts',
    'src/lib/logic/OfflineManager.ts'
];

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    // Replace AuraStream with Sonaraura (case sensitive)
    let newContent = content.replace(/AuraStream/g, 'Sonaraura');
    // Also handle Aura Stream
    newContent = newContent.replace(/Aura Stream/g, 'Sonaraura');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
}

targetFiles.forEach(file => {
    const fullPath = path.join(rootDir, file);
    replaceInFile(fullPath);
});

// Also search and replace in docs
const docsDir = path.join(rootDir, 'docs');
if (fs.existsSync(docsDir)) {
    fs.readdirSync(docsDir).forEach(file => {
        if (file.endsWith('.md')) {
            replaceInFile(path.join(docsDir, file));
        }
    });
}

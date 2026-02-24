const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'messages', 'en.json');
const trPath = path.join(__dirname, '..', 'messages', 'tr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));

function compare(enObj, trObj, currentPath = '') {
    const missingKeys = [];
    const identicalKeys = [];

    for (const key in enObj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;

        if (!(key in trObj)) {
            missingKeys.push(fullPath);
        } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
            const { missing, identical } = compare(enObj[key], trObj[key], fullPath);
            missingKeys.push(...missing);
            identicalKeys.push(...identical);
        } else {
            if (enObj[key] === trObj[key] && enObj[key] !== "" && typeof enObj[key] === 'string') {
                // If they are identical, it might be untranslated
                // excluding some specific cases like brand names or small words
                if (enObj[key].length > 3) {
                    identicalKeys.push(fullPath);
                }
            }
        }
    }
    return { missing: missingKeys, identical: identicalKeys };
}

const result = compare(en, tr);

console.log('--- Missing Keys in tr.json ---');
console.log(result.missing.join('\n'));
console.log('\n--- potentially Untranslated (Identical) Keys ---');
console.log(result.identical.join('\n'));

// Now check if tr.json has keys that en.json doesn't have
function findExtraKeys(enObj, trObj, currentPath = '') {
    const extraKeys = [];
    for (const key in trObj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        if (!(key in enObj)) {
            extraKeys.push(fullPath);
        } else if (typeof trObj[key] === 'object' && trObj[key] !== null && !Array.isArray(trObj[key])) {
            extraKeys.push(...findExtraKeys(enObj[key], trObj[key], fullPath));
        }
    }
    return extraKeys;
}

const extra = findExtraKeys(en, tr);
console.log('\n--- Extra Keys in tr.json (Not in en.json) ---');
console.log(extra.join('\n'));

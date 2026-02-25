const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'messages', 'en.json');
const trPath = path.join(__dirname, 'messages', 'tr.json');

const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const trJson = JSON.parse(fs.readFileSync(trPath, 'utf8'));

const pages = [
    "how-it-works", "account-setup", "core-stack", "ai-engine", "strategic-intel",
    "frequency-eng", "karaoke-engine", "weather-ai", "watermarking",
    "interactive-waveforms", "sync-precision", "biorhythm-ml", "edge-roi",
    "revenue-intel", "churn-heartbeat", "ui-evolution", "enterprise-hq",
    "playlist-editor", "smart-flow", "scheduling", "b2b-licensing",
    "direct-licensing", "upload-qc", "revenue-share", "tailor-process",
    "project-soul"
];

const contentEn = {};
const contentTr = {};

pages.forEach(p => {
    const titleEn = enJson.HowItWorks.pages[p] || "Untitled";
    const titleTr = trJson.HowItWorks.pages[p] || "İsimsiz";

    contentEn[p] = {
        title: titleEn,
        p1: `Welcome to the ${titleEn} section. Sonaraura is designed from the ground up to seamlessly integrate this capability into your workflow.`,
        p2: `We provide comprehensive tools, metrics, and artificial intelligence models to ensure that this feature operates at peak efficiency, empowering both venues and creators inside our continuous feedback loop.`
    };

    contentTr[p] = {
        title: titleTr,
        p1: `${titleTr} bölümüne hoş geldiniz. Sonaraura, bu yeteneği iş akışınıza sorunsuz bir şekilde entegre etmek için sıfırdan tasarlanmıştır.`,
        p2: `Bu özelliğin en yüksek verimlilikte çalışmasını sağlamak için kapsamlı araçlar, metrikler ve yapay zeka modelleri sunarak hem mekanları hem de içerik üreticilerini sürekli geri bildirim döngümüzde güçlendiriyoruz.`
    };
});

if (!enJson.HowItWorks.content) enJson.HowItWorks.content = {};
enJson.HowItWorks.content = { ...enJson.HowItWorks.content, ...contentEn };

if (!trJson.HowItWorks.content) trJson.HowItWorks.content = {};
trJson.HowItWorks.content = { ...trJson.HowItWorks.content, ...contentTr };

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 4));
fs.writeFileSync(trPath, JSON.stringify(trJson, null, 4));

console.log("Translations successfully updated.");

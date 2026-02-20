import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, X, Shield, Activity, Cloud, Mic, Play, Lock, BarChart3, Clock, Zap, Layers, Layout } from 'lucide-react';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/db/server';

export default async function AdvertPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen bg-[#111111] text-white font-sans selection:bg-purple-500 selection:text-white">
            <MainHeader initialUser={user} />

            {/* Hero Section */}
            <section className="relative h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/advert/advert_hero_background.png"
                        alt="The Future of Sound"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/30 via-transparent to-[#111111] z-10" />
                </div>

                <div className="relative z-20 max-w-5xl w-full text-center space-y-8 animate-fade-in-up">
                    <p className="text-sm md:text-base font-bold uppercase tracking-[0.3em] text-purple-400">
                        The Future of Sound
                    </p>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        SONARAURA
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-300 font-light max-w-3xl mx-auto italic">
                        "Sesin Mimarisi, Zekanın Frekansı."
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/signup" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center">
                            Start Creating <ArrowRight size={20} />
                        </Link>
                        <Link href="#features" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10">
                            Explore Technology
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 md:px-12 bg-[#111111]">
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Sektörde İlk ve Tek</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Sonaraura, dinleyiciyi biyolojik düzeyde etkileyen bir deneyim ve işletmeler için eşsiz bir zeka sunar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1: Frequency Engineering */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/molecular_sound_frequency.png"
                                alt="Molecular Sound"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Activity className="text-purple-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Frekans Mühendisliği</h3>
                                <p className="text-gray-400 text-sm">432Hz (Huzur) ve 528Hz (Odak) modlarına saniyeler içinde, BPM bozulmadan geçiş.</p>
                            </div>
                        </div>

                        {/* Feature 2: Aura Karaoke Engine */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/aura_karaoke_lyrics.png"
                                alt="Aura Karaoke"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Mic className="text-pink-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Aura Karaoke Engine</h3>
                                <p className="text-gray-400 text-sm">Kelime kelime senkronize sözler. Müzikle birlikte parlayan ve canlanan kelimeler.</p>
                            </div>
                        </div>

                        {/* Feature 3: Weather-Aware AI */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/weather_aware_ai_sound.png"
                                alt="Weather Aware AI"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Cloud className="text-blue-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Weather-Aware AI</h3>
                                <p className="text-gray-400 text-sm">Mekanınızın zekası dış dünyayla senkronize. Hava durumuna göre otomatik optimizasyon.</p>
                            </div>
                        </div>

                        {/* Feature 4: Smart Flow */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="/images/advert/smart_flow_schedule.png"
                                alt="Smart Flow"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Zap className="text-yellow-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Smart Flow</h3>
                                <p className="text-gray-400 text-sm">Otonom Müzik Direktörü. Sabah sakin, akşam sofistike geçişleri Aura yapar.</p>
                            </div>
                        </div>

                        {/* Feature 5: Enterprise HQ */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000"
                                alt="Enterprise HQ"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Layers className="text-indigo-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">Enterprise HQ</h3>
                                <p className="text-gray-400 text-sm">Binlerce şubeyi tek merkezden kontrol edin. Cihaz sağlığı ve anlık senkronizasyon.</p>
                            </div>
                        </div>

                        {/* Feature 6: Playlist Studio */}
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-colors">
                            <Image
                                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000"
                                alt="Playlist Studio"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-8 flex flex-col justify-end">
                                <Layout className="text-pink-400 mb-4" size={32} />
                                <h3 className="text-xl font-bold mb-2">High-Fidelity Editor</h3>
                                <p className="text-gray-400 text-sm">Sürükle-bırak hassasiyetiyle kusursuz çalma listeleri oluşturun ve anında yayınlayın.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table Section */}
            <section className="py-24 px-6 md:px-12 bg-zinc-900/30">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Karşılaştırmalı Avantajlar</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="py-6 px-4 text-gray-400 font-medium">Özellik</th>
                                    <th className="py-6 px-4 text-gray-400 font-medium">Geleneksel Streaming</th>
                                    <th className="py-6 px-4 text-white font-bold text-xl">Sonaraura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { feature: 'Real-time Hz Tuning', traditional: '❌ Yok', aura: '✅ 432Hz / 528Hz (BPM Korumalı)' },
                                    { feature: 'Word-Level Sync (Karaoke)', traditional: '⚠️ Sınırlı', aura: '✅ Canlı Kelime Parlatma (Glow)' },
                                    { feature: 'Hava Durumu Awareness', traditional: '❌ Yok', aura: '✅ Canlı Lokasyon Senkronlu' },
                                    { feature: 'Otonom Flow Scheduling', traditional: '⚠️ Sınırlı', aura: '✅ 24h Görsel Editör & Otomatik Geçiş' },
                                    { feature: 'Digital Watermarking', traditional: '❌ Yok (Sadece ID3)', aura: '✅ Sinyal Seviyesinde (LSB v1)' },
                                    { feature: 'YouTube Dispute Center', traditional: '❌ Yok', aura: '✅ Otomatik Hak İtirazı (Pro)' },
                                    { feature: 'Metadata Extraction', traditional: '❌ Manuel', aura: '✅ Otonom Bulk Ingest (BPM, Key)' },
                                    { feature: 'Duration Precision', traditional: '⚠️ Tahmini / Hatalı', aura: '✅ Real-time File Sync (Frame-Perfect)' },
                                    { feature: 'Infrastructure ROI', traditional: '❌ Yok', aura: '✅ JIT Rendering & Content Gap Analysis' },
                                    { feature: 'Special Production', traditional: '❌ Yok', aura: '✅ Aura Tailor (Music on Request) Hub' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 font-medium">{row.feature}</td>
                                        <td className="py-4 px-4 text-gray-500">{row.traditional}</td>
                                        <td className="py-4 px-4 text-purple-300 font-semibold shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-500/5 rounded-lg">{row.aura}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="py-24 px-6 md:px-12 bg-[#111111] overflow-hidden">
                <div className="max-w-[1400px] mx-auto space-y-32">

                    {/* Deep Dive 1: Signal Protection */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 order-2 md:order-1 relative">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/signal_protection_watermark.png"
                                    alt="Signal Protection"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Decorative blurred blob */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-[80px]" />
                        </div>
                        <div className="flex-1 space-y-6 order-1 md:order-2">
                            <div className="p-3 bg-blue-500/10 rounded-lg inline-block text-blue-400"><Shield size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">Sinyal Seviyesinde Koruma</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Ses dosyasının içine, duyulmayan dijital bir UUID mühürlüyoruz (Steganography). Dosya ismi veya formatı değişse bile (WAV → MP3), parçanın mülkiyeti teknik olarak ispatlanabilir.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>LSB Watermarking</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>YouTube Dispute Ready</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Deep Dive 2: Interactive Waveforms */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6 md:order-2">
                            <div className="p-3 bg-pink-500/10 rounded-lg inline-block text-pink-400"><Activity size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">Interactive Discovery Waveforms</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Liste içindeki her parça kendi canlı "Zaman Dalgası"na sahiptir. Sadece dinlemez, sesin dokusunu listede gezerken görür ve istediğiniz saniyeye dalga üzerinden atlayabilirsiniz.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Canlı Visualizer</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Doku Analizi</span></li>
                            </ul>
                        </div>
                        <div className="flex-1 relative md:order-1">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-pink-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/interactive_waveforms_discovery.png"
                                    alt="Interactive Waveforms"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/30 rounded-full blur-[80px]" />
                        </div>
                    </div>

                    {/* Deep Dive 3: AI Analytics */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 order-2 md:order-1 relative">
                            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl shadow-green-900/20 border border-white/10">
                                <Image
                                    src="/images/advert/elite_ai_analytics_dashboard.png"
                                    alt="AI Analytics"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-green-500/10 rounded-full blur-[100px]" />
                        </div>
                        <div className="flex-1 space-y-6 order-1 md:order-2">
                            <div className="p-3 bg-green-500/10 rounded-lg inline-block text-green-400"><BarChart3 size={24} /></div>
                            <h3 className="text-3xl md:text-5xl font-bold">Elite AI Analytics</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Sadece dinleme sayılarını değil; arama terimlerini, sistem gecikmelerini ve üretim boşluklarını analiz eder. Veriyi "Nereye yatırım yapmalıyım?" sorusuna yanıta dönüştürür.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>JIT Rendering & ROI</span></li>
                                <li className="flex items-center gap-3"><Check className="text-green-400" size={18} /> <span>Churn Heartbeat</span></li>
                            </ul>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 text-center bg-gradient-to-t from-purple-900/20 to-transparent border-t border-white/5">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tight">Mekanınızın Ruhu, Sizin Sesiniz.</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Milisaniye hassasiyetinde otonom bir ses fabrikası ile tanışın.
                    </p>
                    <Link href="/signup" className="inline-block px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        Hemen Başlayın
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

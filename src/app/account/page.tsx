'use client';

import { createClient } from '@/lib/db/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Settings, 
    CreditCard, 
    Shield, 
    Bell, 
    LogOut,
    Save,
    Loader2
} from 'lucide-react';

export default function AccountPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);

    const [data, setData] = useState({
        full_name: '',
        display_name: '',
        legal_name: '',
        industry: '',
        website: '',
        logo_url: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, tenants(*)')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                const t = profileData.tenants;
                setTenant(t);
                setData({
                    full_name: profileData.full_name || '',
                    display_name: t?.display_name || '',
                    legal_name: t?.legal_name || '',
                    industry: t?.industry || '',
                    website: t?.website || '',
                    logo_url: t?.logo_url || ''
                });
            }
            setLoading(false);
        };

        fetchUserData();
    }, [supabase, router]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update Profile
            await supabase
                .from('profiles')
                .update({ full_name: data.full_name })
                .eq('id', user.id);

            // Update Tenant
            if (tenant?.id) {
                await supabase
                    .from('tenants')
                    .update({
                        display_name: data.display_name,
                        legal_name: data.legal_name,
                        industry: data.industry,
                        website: data.website,
                        logo_url: data.logo_url
                    })
                    .eq('id', tenant.id);
            }
            
            alert('Settings saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-indigo-500 animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-16 max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Settings</h1>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            Sonaraura {profile?.subscription_tier?.toUpperCase() || 'FREE'} Member
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl flex items-center gap-3"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left: Nav */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 ml-4">Navigation</p>
                    <AccountNavLink icon={User} label="Personal Profile" active />
                    <AccountNavLink icon={Shield} label="Business Entity" />
                    <AccountNavLink icon={CreditCard} label="Billing & Plan" />
                    <AccountNavLink icon={Bell} label="Notifications" />
                    <div className="pt-8">
                        <button 
                            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all w-full font-bold text-sm uppercase tracking-widest"
                        >
                            <LogOut size={18} /> Log Out
                        </button>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Personal Section */}
                    <section className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Personal Identity</h3>
                            <p className="text-zinc-500 text-sm font-medium">Your global identifier within the Sonaraura ecosystem.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Full Name" 
                                value={data.full_name} 
                                onChange={val => setData({...data, full_name: val})} 
                                placeholder="Your Name" 
                            />
                            <InputField 
                                label="Email Address" 
                                value={profile?.email || ''} 
                                readOnly 
                            />
                        </div>
                    </section>

                    {/* Business Section */}
                    <section className="space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Business Intelligence</h3>
                            <p className="text-zinc-500 text-sm font-medium">Required for B2B Licensing and custom Aura tuning profiles.</p>
                        </div>
                        <div className="space-y-6">
                            <InputField 
                                label="Brand Display Name" 
                                value={data.display_name} 
                                onChange={val => setData({...data, display_name: val})} 
                                placeholder="e.g. Aura Coffee Frankfurt" 
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField 
                                    label="Legal Entity Name" 
                                    value={data.legal_name} 
                                    onChange={val => setData({...data, legal_name: val})} 
                                    placeholder="Legal Name Co. Ltd." 
                                />
                                <InputField 
                                    label="Industry / Sector" 
                                    value={data.industry} 
                                    onChange={val => setData({...data, industry: val})} 
                                    placeholder="Hospitality" 
                                />
                            </div>
                            <InputField 
                                label="Website URL" 
                                value={data.website} 
                                onChange={val => setData({...data, website: val})} 
                                placeholder="https://..." 
                            />
                            <InputField 
                                label="Brand Logo URL" 
                                value={data.logo_url} 
                                onChange={val => setData({...data, logo_url: val})} 
                                placeholder="https://image.com/logo.png" 
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function AccountNavLink({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full group ${active ? 'bg-white text-black shadow-2xl' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Icon size={20} className={active ? 'text-indigo-500' : 'text-zinc-600 group-hover:text-indigo-400'} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </button>
    );
}

function InputField({ label, value, onChange, placeholder, readOnly = false }: { label: string, value: string, onChange?: (v: string) => void, placeholder?: string, readOnly?: boolean }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">{label}</label>
            <input 
                value={value}
                onChange={e => onChange?.(e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all ${readOnly ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

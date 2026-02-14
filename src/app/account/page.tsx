'use client';

import { createClient } from '@/lib/db/client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Shield, 
    CreditCard, 
    Bell, 
    LogOut,
    Save,
    Loader2
} from 'lucide-react';

interface ProfileData {
    id: string;
    email: string;
    full_name?: string;
    subscription_tier: string;
    billing_details?: BillingDetails;
    tenants?: TenantData;
}

interface BillingDetails {
    type: 'individual' | 'corporate';
    full_name?: string; // For individual
    tckn?: string; // For individual
    company_name?: string; // For corporate
    tax_office?: string; // For corporate
    tax_id?: string; // For corporate (VKN)
    billing_email: string;
    phone?: string;
    address: {
        line1: string;
        city: string;
        country: string;
        zip?: string;
    };
}

interface TenantData {
    id: string;
    display_name?: string;
    legal_name?: string;
    industry?: string;
    website?: string;
    logo_url?: string;
}

import { getMyProfileWithTenant_Action, updateTenantIdentity_Action } from '@/app/actions/account/tenant';

export default function AccountPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [tenant, setTenant] = useState<TenantData | null>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        display_name: '',
        legal_name: '',
        industry: '',
        website: '',
        logo_url: ''
    });

    const [billingData, setBillingData] = useState<BillingDetails>({
        type: 'individual',
        billing_email: '',
        address: {
            line1: '',
            city: '',
            country: 'TR',
            zip: ''
        }
    });

    const [activeSection, setActiveSection] = useState<'personal' | 'business' | 'billing' | 'notifications'>('personal');

    const personalRef = React.useRef<HTMLDivElement>(null);
    const businessRef = React.useRef<HTMLDivElement>(null);
    const billingRef = React.useRef<HTMLDivElement>(null);
    const notificationsRef = React.useRef<HTMLDivElement>(null);

    const scrollTo = (section: 'personal' | 'business' | 'billing' | 'notifications') => {
        setActiveSection(section);
        const refs = {
            personal: personalRef,
            business: businessRef,
            billing: billingRef,
            notifications: notificationsRef
        };
        refs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const validateTCKN = (tckn: string) => {
        if (!/^[0-9]{11}$/.test(tckn)) return false;
        if (parseInt(tckn[10]) % 2 !== 0) return false;
        return true;
    };

    const validateVKN = (vkn: string) => {
        return /^[0-9]{10,11}$/.test(vkn);
    };

    const validateAddress = (addr: string) => addr.length >= 10;

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                // 1. Ensure Auth
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // 2. Fetch Profile
                const { data: profileRecord, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                let currentProfile = profileRecord;

                if (!currentProfile || profileError) {
                    const { data: newProfile } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            full_name: user.user_metadata?.full_name || '',
                            subscription_tier: 'free'
                        })
                        .select()
                        .single();
                    currentProfile = newProfile;
                }

                if (currentProfile) {
                    setProfile(currentProfile as ProfileData);
                    
                    if (currentProfile.billing_details) {
                        setBillingData(currentProfile.billing_details as BillingDetails);
                    } else {
                        setBillingData(prev => ({ ...prev, billing_email: user.email || '' }));
                    }

                    const { data: tenantRecord } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('owner_id', user.id)
                        .single();

                    setTenant(tenantRecord || null);

                    setFormData({
                        full_name: currentProfile.full_name || user.user_metadata?.full_name || '',
                        display_name: tenantRecord?.display_name || '',
                        legal_name: tenantRecord?.legal_name || '',
                        industry: tenantRecord?.industry || '',
                        website: tenantRecord?.website || '',
                        logo_url: tenantRecord?.logo_url || ''
                    });
                }
            } catch (err) {
                console.error('Account data sync error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [supabase, router]);

    const handleSave = async () => {
        // Validation
        if (billingData.type === 'individual') {
            if (billingData.tckn && !validateTCKN(billingData.tckn)) {
                alert('Geçersiz TC Kimlik No.');
                return;
            }
        } else {
            if (!billingData.tax_id || !validateVKN(billingData.tax_id)) {
                alert('Geçersiz Vergi Kimlik No (VKN).');
                return;
            }
            if (!billingData.tax_office) {
                alert('Vergi Dairesi boş bırakılamaz.');
                return;
            }
        }

        if (!validateAddress(billingData.address.line1)) {
            alert('Adres alanı en az 10 karakter olmalıdır.');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    full_name: formData.full_name,
                    billing_details: billingData
                })
                .eq('id', user.id);
            
            if (profileError) throw profileError;

            // Update Tenant Identity
            if (tenant?.id) {
                const { error: tenantError } = await supabase
                    .from('tenants')
                    .update({
                        display_name: formData.display_name,
                        legal_name: formData.legal_name,
                        industry: formData.industry,
                        website: formData.website,
                        logo_url: formData.logo_url
                    })
                    .eq('id', tenant.id);
                
                if (tenantError) throw tenantError;
            } else {
                const { data: newTenant, error: createError } = await supabase
                    .from('tenants')
                    .insert({
                        owner_id: user.id,
                        display_name: formData.display_name,
                        legal_name: formData.legal_name,
                        industry: formData.industry,
                        website: formData.website,
                        logo_url: formData.logo_url
                    })
                    .select()
                    .single();
                
                if (createError) throw createError;
                setTenant(newTenant);
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
                    <AccountNavLink 
                        icon={User} 
                        label="Personal Profile" 
                        active={activeSection === 'personal'} 
                        onClick={() => scrollTo('personal')}
                    />
                    <AccountNavLink 
                        icon={Shield} 
                        label="Business Entity" 
                        active={activeSection === 'business'} 
                        onClick={() => scrollTo('business')}
                    />
                    <AccountNavLink 
                        icon={CreditCard} 
                        label="Billing & Plan" 
                        active={activeSection === 'billing'} 
                        onClick={() => scrollTo('billing')}
                    />
                    <AccountNavLink 
                        icon={Bell} 
                        label="Notifications" 
                        active={activeSection === 'notifications'} 
                        onClick={() => scrollTo('notifications')}
                    />
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
                    <section ref={personalRef} id="personal" className="space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Personal Identity</h3>
                            <p className="text-zinc-500 text-sm font-medium">Your global identifier within the Sonaraura ecosystem.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField 
                                label="Full Name" 
                                value={formData.full_name} 
                                onChange={val => setFormData({...formData, full_name: val})} 
                                placeholder="Your Name" 
                            />
                            <InputField 
                                label="Email Address" 
                                value={profile?.email || ''} 
                                readOnly 
                            />
                        </div>
                    </section>

                    {/* Business/Billing Section */}
                    <section ref={businessRef} id="business" className="space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Billing & Entity Info</h3>
                            <p className="text-zinc-500 text-sm font-medium">Configure your tax and billing preferences for legal compliance.</p>
                        </div>

                        {/* Toggle */}
                        <div className="flex bg-white/5 p-1 rounded-2xl w-fit">
                            <button 
                                onClick={() => setBillingData({...billingData, type: 'individual'})}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingData.type === 'individual' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Bireysel
                            </button>
                            <button 
                                onClick={() => setBillingData({...billingData, type: 'corporate'})}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billingData.type === 'corporate' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Kurumsal
                            </button>
                        </div>

                        <div className="space-y-6 animate-in fade-in duration-500">
                            {billingData.type === 'individual' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField 
                                            label="Ad Soyad" 
                                            value={billingData.full_name || ''} 
                                            onChange={val => setBillingData({...billingData, full_name: val})} 
                                            placeholder="Kimlikteki tam adınız" 
                                        />
                                        <InputField 
                                            label="TC Kimlik No" 
                                            value={billingData.tckn || ''} 
                                            onChange={val => setBillingData({...billingData, tckn: val})} 
                                            placeholder="11 haneli TCKN" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InputField 
                                        label="Şirket Tam Ünvanı" 
                                        value={billingData.company_name || ''} 
                                        onChange={val => setBillingData({...billingData, company_name: val})} 
                                        placeholder="Resmi şirket adınız" 
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField 
                                            label="Vergi Dairesi" 
                                            value={billingData.tax_office || ''} 
                                            onChange={val => setBillingData({...billingData, tax_office: val})} 
                                            placeholder="Örn: Zincirlikuyu V.D." 
                                        />
                                        <InputField 
                                            label="Vergi No / VKN" 
                                            value={billingData.tax_id || ''} 
                                            onChange={val => setBillingData({...billingData, tax_id: val})} 
                                            placeholder="10 veya 11 haneli VKN" 
                                        />
                                    </div>
                                    <InputField 
                                        label="Telefon" 
                                        value={billingData.phone || ''} 
                                        onChange={val => setBillingData({...billingData, phone: val})} 
                                        placeholder="+90 ..." 
                                    />
                                </>
                            )}

                            <InputField 
                                label="Fatura E-Postası" 
                                value={billingData.billing_email} 
                                onChange={val => setBillingData({...billingData, billing_email: val})} 
                                placeholder="muhasebe@sirket.com" 
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField 
                                    label="Ülke" 
                                    value={billingData.address.country} 
                                    onChange={val => setBillingData({...billingData, address: {...billingData.address, country: val}})} 
                                    placeholder="Türkiye" 
                                />
                                <InputField 
                                    label="Şehir" 
                                    value={billingData.address.city} 
                                    onChange={val => setBillingData({...billingData, address: {...billingData.address, city: val}})} 
                                    placeholder="İstanbul" 
                                />
                            </div>

                            <InputField 
                                label="Açık Adres" 
                                value={billingData.address.line1} 
                                onChange={val => setBillingData({...billingData, address: {...billingData.address, line1: val}})} 
                                placeholder="Mahalle, Sokak, No..." 
                            />
                            
                            <InputField 
                                label="Posta Kodu" 
                                value={billingData.address.zip || ''} 
                                onChange={val => setBillingData({...billingData, address: {...billingData.address, zip: val}})} 
                                placeholder="34000" 
                            />
                        </div>
                    </section>

                    {/* Billing Section (Placeholder) */}
                    <section ref={billingRef} id="billing" className="space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Billing & Plan</h3>
                            <p className="text-zinc-500 text-sm font-medium">Manage your subscription and payment methods.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Billing management coming soon</p>
                        </div>
                    </section>

                    {/* Notifications Section (Placeholder) */}
                    <section ref={notificationsRef} id="notifications" className="space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Notifications</h3>
                            <p className="text-zinc-500 text-sm font-medium">Configure how you want to be reached.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Notification settings coming soon</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function AccountNavLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all w-full group ${active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
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

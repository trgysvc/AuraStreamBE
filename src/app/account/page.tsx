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
import { getMyProfileWithTenant_Action, updateTenantIdentity_Action } from '@/app/actions/account/tenant';

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
    full_name?: string; 
    tckn?: string; 
    company_name?: string; 
    tax_office?: string; 
    tax_id?: string; 
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
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

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
        if (billingData.type === 'individual') {
            if (billingData.tckn && !validateTCKN(billingData.tckn)) {
                alert('Invalid TC Identity Number.');
                return;
            }
        } else {
            if (!billingData.tax_id || !validateVKN(billingData.tax_id)) {
                alert('Invalid Tax ID / VKN.');
                return;
            }
            if (!billingData.tax_office) {
                alert('Tax Office cannot be empty.');
                return;
            }
        }

        if (!validateAddress(billingData.address.line1)) {
            alert('Address must be at least 10 characters.');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    full_name: formData.full_name,
                    billing_details: billingData
                })
                .eq('id', user.id);
            
            if (profileError) throw profileError;

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
        <div className="min-h-screen bg-black text-white p-6 md:p-16 max-w-6xl mx-auto space-y-12 md:space-y-16 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8 md:pb-12">
                <div className="space-y-3 md:space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Settings</h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                            Sonaraura {profile?.subscription_tier?.toUpperCase() || 'FREE'} Member
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto px-10 py-4 md:py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
                {/* Left: Nav (Horizontal Scroll on Mobile) */}
                <div className="space-y-4 md:space-y-6">
                    <p className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-8 ml-4">Navigation</p>
                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible -mx-6 px-6 lg:mx-0 lg:px-0 gap-2 md:gap-4 no-scrollbar pb-2 lg:pb-0">
                        <AccountNavLink 
                            icon={User} 
                            label="Personal" 
                            active={activeSection === 'personal'} 
                            onClick={() => scrollTo('personal')}
                        />
                        <AccountNavLink 
                            icon={Shield} 
                            label="Business" 
                            active={activeSection === 'business'} 
                            onClick={() => scrollTo('business')}
                        />
                        <AccountNavLink 
                            icon={CreditCard} 
                            label="Billing" 
                            active={activeSection === 'billing'} 
                            onClick={() => scrollTo('billing')}
                        />
                        <AccountNavLink 
                            icon={Bell} 
                            label="Alerts" 
                            active={activeSection === 'notifications'} 
                            onClick={() => scrollTo('notifications')}
                        />
                    </div>
                    <div className="hidden lg:block pt-8">
                        <button 
                            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all w-full font-bold text-sm uppercase tracking-widest"
                        >
                            <LogOut size={18} /> Log Out
                        </button>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-12 md:space-y-16">
                    {/* Personal Section */}
                    <section ref={personalRef} id="personal" className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Personal Identity</h3>
                            <p className="text-zinc-500 text-xs md:text-sm font-medium">Your global identifier within the Sonaraura ecosystem.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    <section ref={businessRef} id="business" className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Billing & Entity Info</h3>
                            <p className="text-zinc-500 text-xs md:text-sm font-medium">Configure your tax and billing preferences for legal compliance.</p>
                        </div>

                        {/* Toggle */}
                        <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl w-full sm:w-fit">
                            <button 
                                onClick={() => setBillingData({...billingData, type: 'individual'})}
                                className={`flex-1 sm:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${billingData.type === 'individual' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Individual
                            </button>
                            <button 
                                onClick={() => setBillingData({...billingData, type: 'corporate'})}
                                className={`flex-1 sm:flex-none px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${billingData.type === 'corporate' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Corporate
                            </button>
                        </div>

                        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                            {billingData.type === 'individual' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <InputField 
                                            label="Full Name" 
                                            value={billingData.full_name || ''} 
                                            onChange={val => setBillingData({...billingData, full_name: val})} 
                                            placeholder="Your legal name" 
                                        />
                                        <InputField 
                                            label="Identity ID / TCKN" 
                                            value={billingData.tckn || ''} 
                                            onChange={val => setBillingData({...billingData, tckn: val})} 
                                            placeholder="11-digit ID number" 
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InputField 
                                        label="Full Legal Company Name" 
                                        value={billingData.company_name || ''} 
                                        onChange={val => setBillingData({...billingData, company_name: val})} 
                                        placeholder="Your official company title" 
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <InputField 
                                            label="Tax Office" 
                                            value={billingData.tax_office || ''} 
                                            onChange={val => setBillingData({...billingData, tax_office: val})} 
                                            placeholder="e.g. Zincirlikuyu V.D." 
                                        />
                                        <InputField 
                                            label="Tax ID / VKN" 
                                            value={billingData.tax_id || ''} 
                                            onChange={val => setBillingData({...billingData, tax_id: val})} 
                                            placeholder="10 or 11-digit Tax ID" 
                                        />
                                    </div>
                                    <InputField 
                                        label="Phone" 
                                        value={billingData.phone || ''} 
                                        onChange={val => setBillingData({...billingData, phone: val})} 
                                        placeholder="+90 ..." 
                                    />
                                </>
                            )}

                            <InputField 
                                label="Billing Email" 
                                value={billingData.billing_email} 
                                onChange={val => setBillingData({...billingData, billing_email: val})} 
                                placeholder="billing@company.com" 
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <InputField 
                                    label="Country" 
                                    value={billingData.address.country} 
                                    onChange={val => setBillingData({...billingData, address: {...billingData.address, country: val}})} 
                                    placeholder="Turkey" 
                                />
                                <InputField 
                                    label="City" 
                                    value={billingData.address.city} 
                                    onChange={val => setBillingData({...billingData, address: {...billingData.address, city: val}})} 
                                    placeholder="Istanbul" 
                                />
                            </div>

                            <InputField 
                                label="Billing Address" 
                                value={billingData.address.line1} 
                                onChange={val => setBillingData({...billingData, address: {...billingData.address, line1: val}})} 
                                placeholder="Street, District, No..." 
                            />
                            
                            <InputField 
                                label="Zip Code" 
                                value={billingData.address.zip || ''} 
                                onChange={val => setBillingData({...billingData, address: {...billingData.address, zip: val}})} 
                                placeholder="34000" 
                            />
                        </div>
                    </section>

                    {/* Billing Section (Placeholder) */}
                    <section ref={billingRef} id="billing" className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Billing & Plan</h3>
                            <p className="text-zinc-500 text-xs md:text-sm font-medium">Manage your subscription and payment methods.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-[2rem] text-center">
                            <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Billing management coming soon</p>
                        </div>
                    </section>

                    {/* Notifications Section (Placeholder) */}
                    <section ref={notificationsRef} id="notifications" className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Notifications</h3>
                            <p className="text-zinc-500 text-xs md:text-sm font-medium">Configure how you want to be reached.</p>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-2xl md:rounded-[2rem] text-center">
                            <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">Notification settings coming soon</p>
                        </div>
                    </section>

                    {/* Mobile Only: Logout */}
                    <div className="lg:hidden pt-8 pb-12 border-t border-white/5">
                        <button 
                            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                            className="flex items-center justify-center gap-4 px-6 py-4 rounded-xl bg-rose-500/10 text-rose-500 transition-all w-full font-bold text-xs uppercase tracking-widest"
                        >
                            <LogOut size={16} /> Log Out Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountNavLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-center lg:justify-start gap-2 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl transition-all whitespace-nowrap lg:w-full group ${active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
            <Icon size={18} className={active ? 'text-indigo-500' : 'text-zinc-600 group-hover:text-indigo-400'} />
            <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </button>
    );
}

function InputField({ label, value, onChange, placeholder, readOnly = false }: { label: string, value: string, onChange?: (v: string) => void, placeholder?: string, readOnly?: boolean }) {
    return (
        <div className="space-y-1.5 md:space-y-2">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">{label}</label>
            <input 
                value={value}
                onChange={e => onChange?.(e.target.value)}
                readOnly={readOnly}
                placeholder={placeholder}
                className={`w-full bg-[#111] border border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all ${readOnly ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
        </div>
    );
}

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

export default function AccountPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [tenant, setTenant] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        display_name: '',
        legal_name: '',
        industry: '',
        website: '',
        logo_url: '',
        authorized_person_name: '',
        authorized_person_phone: ''
    });

    const [billingData, setBillingData] = useState<any>({
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

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                // Explicit join with specific foreign key to avoid ambiguity
                const { data: profileRecord, error: profileError } = await supabase
                    .from('profiles')
                    .select('*, tenant:tenants!profiles_tenant_id_fkey(*)')
                    .eq('id', user.id)
                    .single();

                let currentProfile = profileRecord;

                if (!currentProfile || profileError) {
                    const { data: simpleProfile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (simpleProfile) {
                        currentProfile = simpleProfile;
                        if (simpleProfile.tenant_id) {
                            const { data: tenantData } = await supabase
                                .from('tenants')
                                .select('*')
                                .eq('id', simpleProfile.tenant_id)
                                .single();
                            (currentProfile as any).tenant = tenantData;
                        }
                    }
                }

                if (currentProfile) {
                    setProfile(currentProfile);

                    if (currentProfile.billing_details) {
                        setBillingData(currentProfile.billing_details);
                    } else {
                        setBillingData((prev: any) => ({ ...prev, billing_email: user.email || '' }));
                    }

                    const tenantRecord = (currentProfile as any).tenant;
                    setTenant(tenantRecord || null);

                    if (tenantRecord) {
                        setBillingData((prev: any) => ({
                            ...prev,
                            tax_id: tenantRecord.vkn || prev.tax_id,
                            tax_office: tenantRecord.tax_office || prev.tax_office,
                            billing_email: tenantRecord.invoice_email || prev.billing_email,
                            phone: tenantRecord.phone || prev.phone,
                            address: {
                                ...prev.address,
                                line1: tenantRecord.billing_address || prev.address.line1
                            }
                        }));
                    }

                    setFormData({
                        full_name: currentProfile.full_name || user.user_metadata?.full_name || '',
                        display_name: tenantRecord?.display_name || '',
                        legal_name: tenantRecord?.legal_name || '',
                        industry: tenantRecord?.industry || '',
                        website: tenantRecord?.website || '',
                        logo_url: tenantRecord?.logo_url || '',
                        authorized_person_name: tenantRecord?.authorized_person_name || '',
                        authorized_person_phone: tenantRecord?.authorized_person_phone || ''
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

            const tenantFields = {
                display_name: formData.display_name,
                legal_name: formData.legal_name,
                industry: formData.industry,
                website: formData.website,
                logo_url: formData.logo_url,
                authorized_person_name: formData.authorized_person_name,
                authorized_person_phone: formData.authorized_person_phone,
                vkn: billingData.type === 'corporate' ? billingData.tax_id : null,
                tax_office: billingData.type === 'corporate' ? billingData.tax_office : null,
                billing_address: billingData.address.line1,
                invoice_email: billingData.billing_email,
                phone: billingData.phone
            };

            let targetTenantId = profile?.tenant_id;

            if (targetTenantId) {
                const { error: tenantError } = await supabase
                    .from('tenants')
                    .update(tenantFields)
                    .eq('id', targetTenantId);

                if (tenantError) throw tenantError;
            } else {
                const { data: newTenant, error: createError } = await supabase
                    .from('tenants')
                    .insert({
                        ...tenantFields,
                        owner_id: user.id,
                        current_plan: 'free'
                    })
                    .select()
                    .single();

                if (createError) throw createError;

                await supabase.from('profiles').update({ tenant_id: newTenant.id }).eq('id', user.id);
                setTenant(newTenant);
            }

            alert('Settings saved successfully!');
            router.refresh();
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8 md:pb-12 pt-8">
                <div className="space-y-3 md:space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Settings</h1>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                            Sonaraura {profile?.subscription_tier === 'enterprise' ? 'Enterprise' : (profile?.subscription_tier?.toUpperCase() || 'FREE')} Member
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
                {/* Nav */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex lg:flex-col gap-2 md:gap-4 no-scrollbar">
                        <AccountNavLink icon={User} label="Personal" active={activeSection === 'personal'} onClick={() => scrollTo('personal')} />
                        <AccountNavLink icon={Shield} label="Business" active={activeSection === 'business'} onClick={() => scrollTo('business')} />
                        <AccountNavLink icon={CreditCard} label="Billing" active={activeSection === 'billing'} onClick={() => scrollTo('billing')} />
                        <AccountNavLink icon={Bell} label="Alerts" active={activeSection === 'notifications'} onClick={() => scrollTo('notifications')} />
                    </div>
                </div>

                {/* Forms */}
                <div className="lg:col-span-2 space-y-12 md:space-y-16">
                    <section ref={personalRef} className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Personal Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <InputField label="Full Name" value={formData.full_name} onChange={val => setFormData({ ...formData, full_name: val })} placeholder="Your Name" />
                            <InputField label="Email Address" value={profile?.email || ''} readOnly />
                        </div>
                    </section>

                    <section ref={businessRef} className="space-y-6 md:space-y-8 scroll-mt-32 pt-4">
                        <h3 className="text-xl md:text-2xl font-black uppercase italic text-white tracking-tight">Corporate & Billing Info</h3>
                        <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl w-full sm:w-fit">
                            <button onClick={() => setBillingData({ ...billingData, type: 'individual' })} className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${billingData.type === 'individual' ? 'bg-white text-black shadow-xl' : 'text-zinc-500'}`}>Individual</button>
                            <button onClick={() => setBillingData({ ...billingData, type: 'corporate' })} className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${billingData.type === 'corporate' ? 'bg-white text-black shadow-xl' : 'text-zinc-500'}`}>Corporate</button>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            {billingData.type === 'individual' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <InputField label="Full Name" value={billingData.full_name || ''} onChange={val => setBillingData({ ...billingData, full_name: val })} placeholder="Legal name" />
                                    <InputField label="TCKN" value={billingData.tckn || ''} onChange={val => setBillingData({ ...billingData, tckn: val })} placeholder="11-digit ID" />
                                </div>
                            ) : (
                                <>
                                    <InputField label="Corporate Display Name" value={formData.display_name || ''} onChange={val => setFormData({ ...formData, display_name: val })} placeholder="e.g. Aracafé Co." />
                                    <InputField label="Official Company Title" value={formData.legal_name || ''} onChange={val => setFormData({ ...formData, legal_name: val })} placeholder="Full legal name" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <InputField label="Authorized Person" value={formData.authorized_person_name || ''} onChange={val => setFormData({ ...formData, authorized_person_name: val })} placeholder="Representative" />
                                        <InputField label="Authorized Phone" value={formData.authorized_person_phone || ''} onChange={val => setFormData({ ...formData, authorized_person_phone: val })} placeholder="+90 ..." />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <InputField label="Tax Office" value={billingData.tax_office || ''} onChange={val => setBillingData({ ...billingData, tax_office: val })} placeholder="Tax Office" />
                                        <InputField label="Tax ID / VKN" value={billingData.tax_id || ''} onChange={val => setBillingData({ ...billingData, tax_id: val })} placeholder="VKN" />
                                    </div>
                                </>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <InputField label="Billing Email" value={billingData.billing_email} onChange={val => setBillingData({ ...billingData, billing_email: val })} placeholder="invoice@..." />
                                <InputField label="General Phone" value={billingData.phone || ''} onChange={val => setBillingData({ ...billingData, phone: val })} placeholder="+90 ..." />
                            </div>
                            <InputField label="Billing Address" value={billingData.address.line1} onChange={val => setBillingData({ ...billingData, address: { ...billingData.address, line1: val } })} placeholder="Address" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <InputField label="City" value={billingData.address.city} onChange={val => setBillingData({ ...billingData, address: { ...billingData.address, city: val } })} placeholder="City" />
                                <InputField label="Zip" value={billingData.address.zip || ''} onChange={val => setBillingData({ ...billingData, address: { ...billingData.address, zip: val } })} placeholder="Zip" />
                                <InputField label="Country" value={billingData.address.country} onChange={val => setBillingData({ ...billingData, address: { ...billingData.address, country: val } })} placeholder="Country" />
                            </div>
                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1">Brand Assets</p>
                                <InputField label="Logo URL" value={formData.logo_url || ''} onChange={val => setFormData({ ...formData, logo_url: val })} placeholder="https://..." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <InputField label="Website" value={formData.website || ''} onChange={val => setFormData({ ...formData, website: val })} placeholder="https://..." />
                                    <InputField label="Industry" value={formData.industry || ''} onChange={val => setFormData({ ...formData, industry: val })} placeholder="e.g. Retail" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function AccountNavLink({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button onClick={onClick} className={`flex items-center justify-center lg:justify-start gap-4 px-6 py-4 rounded-2xl transition-all whitespace-nowrap lg:w-full group ${active ? 'bg-white text-black shadow-2xl scale-[1.02]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            <Icon size={18} className={active ? 'text-indigo-500' : 'text-zinc-600 group-hover:text-indigo-400'} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
        </button>
    );
}

function InputField({ label, value, onChange, placeholder, readOnly = false }: { label: string, value: string, onChange?: (v: string) => void, placeholder?: string, readOnly?: boolean }) {
    return (
        <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">{label}</label>
            <input value={value} onChange={e => onChange?.(e.target.value)} readOnly={readOnly} placeholder={placeholder} className={`w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition-all ${readOnly ? 'opacity-40 cursor-not-allowed' : ''}`} />
        </div>
    );
}

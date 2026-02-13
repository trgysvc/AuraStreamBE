'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Building2,
    CreditCard,
    Palette,
    Upload,
    Check,
    ChevronRight,
    Download,
    FileText,
    PieChart,
    Loader2
} from 'lucide-react';
import { getTenantAction, updateTenantAction, getBillingHistoryAction } from '@/app/actions/account/tenant';

type TabType = 'identity' | 'billing' | 'branding' | 'subscription';

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const [data, setData] = useState<any>(null);
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [result, historyData] = await Promise.all([
                    getTenantAction(),
                    getBillingHistoryAction()
                ]);
                setData(result);
                setBillingHistory(historyData);
            } catch (error) {
                console.error("Failed to load account data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleUpdate = async (formData: any) => {
        setSaving(true);
        try {
            await updateTenantAction(formData);
            const updated = await getTenantAction();
            setData(updated);
            alert('Settings updated successfully!');
        } catch (error) {
            console.error("Update failed:", error);
            alert('Update failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-pink-500" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Account Settings</h1>
                <p className="text-zinc-500 font-medium">Manage your company profile, billing, and brand settings.</p>
            </div>

            <div className="flex items-center gap-2 border-b border-white/5 pb-0 overflow-x-auto no-scrollbar">
                <TabButton active={activeTab === 'identity'} onClick={() => setActiveTab('identity')} icon={Building2} label="Identity" />
                <TabButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={FileText} label="Billing & Tax" />
                <TabButton active={activeTab === 'branding'} onClick={() => setActiveTab('branding')} icon={Palette} label="Branding" />
                <TabButton active={activeTab === 'subscription'} onClick={() => setActiveTab('subscription')} icon={CreditCard} label="Subscription" />
            </div>

            <div className="max-w-4xl">
                {data && activeTab === 'identity' && <IdentitySection profile={data.profile} tenant={data.tenant} onUpdate={handleUpdate} saving={saving} />}
                {data && activeTab === 'billing' && <BillingSection tenant={data.tenant} onUpdate={handleUpdate} saving={saving} />}
                {data && activeTab === 'branding' && <BrandingSection tenant={data.tenant} onUpdate={handleUpdate} saving={saving} />}
                {data && activeTab === 'subscription' && <SubscriptionSection tenant={data.tenant} history={billingHistory} />}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${active ? 'border-pink-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-sm p-8 space-y-8 backdrop-blur-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 border-b border-white/5 pb-4">{title}</h3>
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}

function IdentitySection({ profile, tenant, onUpdate, saving }: any) {
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        avatar_url: profile?.avatar_url || '',
        legal_name: tenant?.legal_name || '',
        display_name: tenant?.display_name || '',
        industry: tenant?.industry || 'Kafe',
        website: tenant?.website || ''
    });

    return (
        <div className="space-y-8">
            <SectionCard title="Personal Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                        <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Avatar URL</label>
                        <input value={formData.avatar_url} onChange={e => setFormData({ ...formData, avatar_url: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://image-url.com/avatar.jpg" />
                    </div>
                    <div className="space-y-2 opacity-50">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                        <input value={profile?.email || ''} readOnly className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none cursor-not-allowed" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Account Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Legal Name / Billing Name</label>
                            <input value={formData.legal_name} onChange={e => setFormData({ ...formData, legal_name: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="e.g. Doyuran Gıda Turizm Ltd. Şti." />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Display Name / Nickname</label>
                        <input value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="e.g. Espresso Lab" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Industry / Use Case</label>
                        <select value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors appearance-none text-white">
                            <option>Kafe</option><option>Restoran</option><option>Otel</option><option>Gym</option><option>Spa</option><option>Mağaza</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Website (Optional)</label>
                            <input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://www.company.com" />
                        </div>
                    </div>
                </div>
            </SectionCard>

            <button disabled={saving} onClick={() => onUpdate(formData)} className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save All Settings'}
            </button>
        </div>
    );
}

function BillingSection({ tenant, onUpdate, saving }: any) {
    const [data, setData] = useState({
        tax_office: tenant?.tax_office || '',
        vkn: tenant?.vkn || '',
        billing_address: tenant?.billing_address || '',
        invoice_email: tenant?.invoice_email || '',
        phone: tenant?.phone || '',
        authorized_person_name: tenant?.authorized_person_name || '',
        authorized_person_phone: tenant?.authorized_person_phone || ''
    });

    return (
        <SectionCard title="Billing & Tax Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Tax Office</label>
                    <input value={data.tax_office} onChange={e => setData({ ...data, tax_office: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Tax Number / VKN</label>
                    <input value={data.vkn} onChange={e => setData({ ...data, vkn: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" maxLength={11} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Billing Address</label>
                    <textarea value={data.billing_address} onChange={e => setData({ ...data, billing_address: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors min-h-[100px]" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">E-Invoice Email</label>
                    <input value={data.invoice_email} onChange={e => setData({ ...data, invoice_email: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Corporate Phone</label>
                    <input value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="+90" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Authorized Name</label>
                    <input value={data.authorized_person_name} onChange={e => setData({ ...data, authorized_person_name: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" />
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Authorized Phone</label>
                    <input value={data.authorized_person_phone} onChange={e => setData({ ...data, authorized_person_phone: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="+90" />
                </div>
            </div>
            <button disabled={saving} onClick={() => onUpdate(data)} className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
                {saving ? 'Saving...' : 'Update Billing'}
            </button>
        </SectionCard>
    );
}

function BrandingSection({ tenant, onUpdate, saving }: any) {
    const [data, setData] = useState({
        brand_color: tenant?.brand_color || '#EC4899',
        volume_limit: tenant?.volume_limit || 100,
        logo_url: tenant?.logo_url || ''
    });

    return (
        <SectionCard title="Experience & Player Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Brand Color</label>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-white/10 shadow-xl" style={{ backgroundColor: data.brand_color }} />
                        <input type="color" value={data.brand_color} onChange={e => setData({ ...data, brand_color: e.target.value })} className="w-12 h-12 bg-transparent border-none cursor-pointer" />
                        <input type="text" value={data.brand_color} onChange={e => setData({ ...data, brand_color: e.target.value })} className="bg-black border border-white/10 rounded-sm px-4 py-2 text-sm font-mono w-24 uppercase" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Master Volume Limit: {data.volume_limit}%</label>
                    <input type="range" min="0" max="100" value={data.volume_limit} onChange={e => setData({ ...data, volume_limit: parseInt(e.target.value) })} className="w-full accent-pink-500" />
                    <p className="text-[10px] text-zinc-600 font-medium italic leading-relaxed">Limits the maximum output volume for all player instances in your venue.</p>
                </div>
                <div className="space-y-4 md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Logo URL</label>
                    <input value={data.logo_url} onChange={e => setData({ ...data, logo_url: e.target.value })} className="w-full bg-black border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://image-url.com/logo.png" />
                </div>
            </div>
            <button disabled={saving} onClick={() => onUpdate(data)} className="bg-white text-black px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all mt-8">
                {saving ? 'Saving...' : 'Apply Branding'}
            </button>
        </SectionCard>
    );
}

function SubscriptionSection({ tenant, history }: any) {
    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-zinc-100 to-white p-10 rounded-sm text-black flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-pink-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full mb-2">
                        {tenant?.plan_status?.toUpperCase() || 'FREE'}
                    </div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Sonaraura {tenant?.current_plan?.toUpperCase() || 'FREE'}</h2>
                    <p className="font-bold text-zinc-500 uppercase text-[10px] tracking-widest pt-2">Next payment: {tenant?.subscription_id ? 'Scheduled' : 'No Active Subscription'}</p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <Link href="/pricing" className="px-10 py-4 bg-black text-white text-center rounded-full font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">Upgrade Plan</Link>
                </div>
            </div>

            <SectionCard title="Usage Summary">
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active Venues</p>
                            <h4 className="text-2xl font-black">Unlimited <span className="text-sm font-medium text-zinc-500 lowercase">access</span></h4>
                        </div>
                        <PieChart className="text-pink-500" size={32} />
                    </div>
                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 w-[100%] rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Invoice History">
                {history.length > 0 ? (
                    <div className="space-y-4">
                        {history.map((inv: any, i: number) => (
                            <div key={inv.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                                <div className="flex items-center gap-3">
                                    <Download className="text-zinc-600 group-hover:text-white transition-colors cursor-pointer" size={16} />
                                    <span className="text-xs font-bold text-zinc-300 uppercase">{new Date(inv.created_at).toLocaleDateString()} - {inv.plan_id}</span>
                                </div>
                                <span className="text-xs font-black italic">${inv.amount}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest text-center py-8">No billing history found.</p>
                )}
            </SectionCard>
        </div>
    );
}

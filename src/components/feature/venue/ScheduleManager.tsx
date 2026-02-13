'use client';

import React, { useState } from 'react';
import { Clock, Calendar, Plus, Trash2, Zap, Settings2, X, Check } from 'lucide-react';

interface ScheduleRule {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    days: string[];
    moods: string[];
    genres: string[];
}

const ALL_GENRES = ['Ambient', 'Chill', 'Cinematic', 'Electronic', 'Jazz', 'Lounge', 'Pop', 'Lo-Fi', 'Classical', 'Deep House'];
const ALL_MOODS = ['Happy', 'Melancholic', 'Energetic', 'Dark', 'Hopeful', 'Aggressive', 'Relaxing'];

const SimpleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    return (
        <div className="group/tooltip relative flex items-center justify-center">
            {children}
            <div className="absolute bottom-full mb-2 hidden group-hover/tooltip:block whitespace-nowrap rounded bg-zinc-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl border border-white/10 z-50">
                {text}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
            </div>
        </div>
    );
};

export function ScheduleManager() {
    const [rules, setRules] = useState<ScheduleRule[]>([
        { id: '1', name: 'Morning Awakening', startTime: '08:00', endTime: '11:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], moods: ['Chill', 'Hopeful'], genres: ['Ambient', 'Lo-Fi'] },
        { id: '2', name: 'Lunch Rush', startTime: '12:00', endTime: '14:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], moods: ['Energetic', 'Happy'], genres: ['Pop', 'Electronic'] },
        { id: '3', name: 'Evening Vibes', startTime: '18:00', endTime: '23:00', days: ['Fri', 'Sat'], moods: ['Dark', 'Cinematic'], genres: ['Jazz', 'Deep House'] },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<ScheduleRule | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ScheduleRule>>({
        name: '',
        startTime: '09:00',
        endTime: '17:00',
        days: ['Mon'],
        moods: ['Chill'],
        genres: ['Ambient']
    });

    const openAddModal = () => {
        setEditingRule(null);
        setFormData({ name: '', startTime: '09:00', endTime: '17:00', days: ['Mon'], moods: ['Chill'], genres: ['Ambient'] });
        setIsModalOpen(true);
    };

    const openEditModal = (rule: ScheduleRule) => {
        setEditingRule(rule);
        setFormData(rule);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (editingRule) {
            setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...formData } as ScheduleRule : r));
        } else {
            const newRule = {
                ...formData,
                id: Math.random().toString(36).substr(2, 9),
            } as ScheduleRule;
            setRules([...rules, newRule]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this rule?')) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-white italic uppercase">Smart Flow Management</h2>
                    <p className="text-zinc-500 font-medium mt-1 text-[15px]">Aura automatically adjusts the frequency and energy based on these rules.</p>
                </div>
                <SimpleTooltip text="Create a new scheduling rule">
                    <button 
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        <Plus size={18} strokeWidth={3} /> Add New Rule
                    </button>
                </SimpleTooltip>
            </div>

            {/* Timeline Visualization */}
            <div className="bg-[#1E1E22] p-10 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Zap size={240} strokeWidth={1} />
                </div>
                
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10 flex items-center gap-2">
                    <Clock size={14} /> 24h Activity Distribution
                </h3>
                
                <div className="h-32 w-full bg-black/20 rounded-2xl relative flex items-end px-4 gap-1.5 border border-white/5 pb-8">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const hourStr = i.toString().padStart(2, '0');
                        const isActive = rules.some(r => {
                            const start = parseInt(r.startTime.split(':')[0]);
                            const end = parseInt(r.endTime.split(':')[0]);
                            return i >= start && i < end;
                        });

                        return (
                            <div key={i} className="flex-1 h-20 flex flex-col justify-end group cursor-help relative">
                                <div 
                                    className={`w-full rounded-t-sm transition-all duration-700 ease-out ${
                                        isActive ? 'h-[70%] bg-indigo-500/40 group-hover:bg-indigo-500/60' : 'h-[15%] bg-white/5'
                                    }`} 
                                />
                                <div className="absolute -bottom-6 left-0 right-0 text-center">
                                    <span className={`text-[9px] font-black transition-colors ${i % 3 === 0 ? 'text-zinc-500' : 'text-zinc-800'}`}>
                                        {hourStr}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rules.map((rule) => (
                    <div key={rule.id} className="p-8 rounded-[2rem] bg-[#1E1E22] border border-white/5 hover:border-white/10 transition-all group relative hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-8">
                            <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-all border border-white/5 shadow-inner">
                                <Calendar size={24} className="text-zinc-400 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex gap-1">
                                <SimpleTooltip text="Edit Rule Settings">
                                    <button 
                                        onClick={() => openEditModal(rule)}
                                        className="p-2.5 text-zinc-600 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                                    >
                                        <Settings2 size={18} />
                                    </button>
                                </SimpleTooltip>
                                <SimpleTooltip text="Remove Rule">
                                    <button 
                                        onClick={() => handleDelete(rule.id)}
                                        className="p-2.5 text-zinc-600 hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </SimpleTooltip>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mb-8">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{rule.name}</h4>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                <Clock size={14} className="text-zinc-600" /> {rule.startTime} — {rule.endTime}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {rule.genres?.map(genre => (
                                <span key={genre} className="px-3 py-1 bg-indigo-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-10">
                            {rule.moods.map(mood => (
                                <span key={mood} className="px-3 py-1 bg-pink-500/10 rounded-full text-[9px] font-black uppercase tracking-widest text-pink-400 border border-pink-500/20 italic">
                                    {mood}
                                </span>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-2 overflow-hidden max-w-[120px]">
                                {rule.days.map(day => (
                                    <span key={day} className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter truncate">{day}</span>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 px-4 py-1.5 bg-green-500/5 rounded-full border border-green-500/10">
                                <span className="text-[9px] font-black text-green-500/80 uppercase tracking-widest">Active</span>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Rule Trigger Card */}
                <button 
                    onClick={openAddModal}
                    className="p-8 rounded-[2rem] bg-white/5 border border-dashed border-white/10 hover:bg-white/[0.07] transition-all flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-zinc-400 min-h-[300px]"
                >
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                        <Plus size={32} strokeWidth={1} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-[0.3em]">Configure New Slot</span>
                </button>
            </div>

            {/* Modal - Rule Editor */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#1E1E22] w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white uppercase italic">{editingRule ? 'Edit Rule' : 'New Flow Rule'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Rule Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-zinc-700"
                                        placeholder="e.g. Morning Coffee Vibes"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Start Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.startTime}
                                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">End Time</label>
                                        <input 
                                            type="time" 
                                            value={formData.endTime}
                                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Music Styles (Genres)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_GENRES.map(genre => (
                                            <button 
                                                key={genre}
                                                onClick={() => {
                                                    const current = formData.genres || [];
                                                    setFormData({...formData, genres: current.includes(genre) ? current.filter(g => g !== genre) : [...current, genre]});
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${formData.genres?.includes(genre) ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-black text-zinc-500 border-white/5 hover:border-white/10'}`}
                                            >
                                                {genre}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Target Moods</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_MOODS.map(mood => (
                                            <button 
                                                key={mood}
                                                onClick={() => {
                                                    const current = formData.moods || [];
                                                    setFormData({...formData, moods: current.includes(mood) ? current.filter(m => m !== mood) : [...current, mood]});
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${formData.moods?.includes(mood) ? 'bg-pink-600 text-white border-pink-500 shadow-lg' : 'bg-black text-zinc-500 border-white/5 hover:border-white/10'}`}
                                            >
                                                {mood}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Select Days</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <button 
                                                key={day}
                                                onClick={() => {
                                                    const current = formData.days || [];
                                                    setFormData({...formData, days: current.includes(day) ? current.filter(d => d !== day) : [...current, day]});
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.days?.includes(day) ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-white/5 hover:border-white/20'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                className="w-full py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                <Check size={18} strokeWidth={3} /> Save Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

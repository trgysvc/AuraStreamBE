'use client';

import { createClient } from '@/lib/db/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SignupPage() {
    const t = useTranslations('Auth.signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Redirect to dashboard or success page
            router.push('/dashboard');
            router.refresh();
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple') => {
        console.log(`Social signup trigger: ${provider}`);
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/v1/callback`,
                },
            });

            if (error) throw error;

            if (data?.url) {
                console.log('Redirecting to provider...');
                window.location.href = data.url;
            }
        } catch (error: unknown) {
            console.error('Signup error details:', error);
            const msg = error instanceof Error ? error.message : 'Authentication failed';
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Section: Atmospheric Imagery */}
            <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />
                {/* Background effect using CSS only since image is missing */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                    <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-r from-purple-900/20 to-blue-900/20 blur-3xl animate-pulse" />
                    <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-blue-900/20 to-gray-900/20 blur-3xl" />
                </div>

                <div className="relative z-10 text-white p-12 max-w-lg">
                    <h2 className="text-4xl font-bold tracking-tight mb-6">{t('quote_title')}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        {t('quote_desc')}
                    </p>
                </div>
            </div>

            {/* Right Section: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 sm:p-12 md:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{t('title')}</h1>
                        <p className="text-gray-500">{t('subtitle')}</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('name_label')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all"
                                        placeholder={t('name_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('email_label')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all"
                                        placeholder={t('email_placeholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('password_label')}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition-all"
                                        placeholder={t('password_placeholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-[10px] text-gray-500 text-center">
                            {t('terms_prefix')}{' '}
                            <Link href="/terms" className="text-gray-900 font-semibold hover:underline">
                                {t('terms')}
                            </Link>,{' '}
                            <Link href="/cookies" className="text-gray-900 font-semibold hover:underline">
                                {t('cookie')}
                            </Link>,{' '}
                            <Link href="/privacy" className="text-gray-900 font-semibold hover:underline">
                                {t('privacy')}
                            </Link>.
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-100 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-full text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 transition-colors shadow-lg"
                        >
                            {loading ? t('submitting') : t('submit')}
                            {!loading && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('or_signup_with')}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.225 -9.429 56.472 -10.686 57.325 L -10.686 60.325 L -6.742 60.325 C -4.432 58.182 -3.264 55.024 -3.264 51.509 Z" />
                                    <path fill="#34A853" d="M -14.754 63.239 C -11.516 63.239 -8.801 62.157 -6.760 60.291 L -10.705 57.291 C -11.781 58.019 -13.138 58.489 -14.754 58.489 C -17.885 58.489 -20.533 56.371 -21.480 53.533 L -25.415 53.533 L -25.415 56.616 C -23.465 60.531 -19.402 63.239 -14.754 63.239 Z" />
                                    <path fill="#FBBC05" d="M -21.480 53.533 C -21.716 52.804 -21.846 52.038 -21.846 51.239 C -21.846 50.439 -21.716 49.673 -21.480 48.945 L -21.480 45.862 L -25.415 45.862 C -26.213 47.429 -26.646 49.233 -26.646 51.239 C -26.646 53.245 -26.213 55.047 -25.415 56.614 L -21.480 53.533 Z" />
                                    <path fill="#EA4335" d="M -14.754 43.989 C -12.982 43.989 -11.411 44.597 -10.167 45.812 L -6.703 42.375 C -8.801 40.421 -11.516 39.239 -14.754 39.239 C -19.402 39.239 -23.465 41.948 -25.415 45.862 L -21.480 48.945 C -20.533 46.108 -17.885 43.989 -14.754 43.989 Z" />
                                </g>
                            </svg>
                            {t('continue_google')}
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {t('have_account')}{' '}
                        <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                            {t('login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

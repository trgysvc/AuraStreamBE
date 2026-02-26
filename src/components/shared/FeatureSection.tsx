import React from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

interface FeatureSectionProps {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    icon: React.ElementType;
    reverse?: boolean;
    bgColor?: string;
    link?: string;
    accentColor?: string;
    learnMoreText: string;
    locale?: string;
}

export const FeatureSection = ({
    title,
    subtitle,
    description,
    image,
    icon: Icon,
    reverse = false,
    bgColor = "bg-black",
    link = "/about/howitworks",
    accentColor = "text-white",
    learnMoreText,
    locale
}: FeatureSectionProps) => {
    return (
        <section className={`py-24 md:py-40 px-6 ${bgColor} overflow-hidden border-t border-white/5`}>
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
                <div className={`space-y-6 md:space-y-8 relative z-10 ${reverse ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${accentColor}`} />
                        <span className={`text-xs font-bold tracking-[0.3em] uppercase ${accentColor}`}>{subtitle}</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-white">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        ))}
                    </h2>

                    <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-xl leading-relaxed">
                        {description}
                    </p>

                    <Link
                        href={link}
                        locale={locale}
                        className="inline-flex h-12 items-center justify-center border-b-2 border-white text-sm font-bold uppercase tracking-widest text-white hover:text-zinc-400 hover:border-zinc-400 transition-colors"
                    >
                        {learnMoreText}
                    </Link>
                </div>

                <div className={`relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden ${reverse ? 'lg:order-1' : ''}`}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

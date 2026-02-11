export default function TrackCard({ title, subtitle, image, color }: { title: string; subtitle: string; image?: string; color: string }) {
    return (
        <div className="group cursor-pointer">
            <div className={`relative aspect-square overflow-hidden mb-3 bg-${color}-500 group-hover:shadow-lg transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-black/40" />
                {image ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold opacity-20 text-4xl transform -rotate-12 select-none">AS</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 right-4">
                    <p className="text-white font-bold text-lg md:text-xl leading-snug drop-shadow-md">{title}</p>
                </div>
                {subtitle && (
                    <div className="absolute bottom-4 left-4">
                        <p className="text-white text-xs font-semibold uppercase tracking-wider opacity-80">{subtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

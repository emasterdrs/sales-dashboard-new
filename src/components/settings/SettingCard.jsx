export function SettingCard({ title, icon: Icon, desc, extra, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
                <div className="flex items-start gap-5">
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-900 border border-slate-100 shadow-sm">
                        <Icon size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">{title}</h3>
                        <p className="text-sm font-bold text-slate-400 mt-1">{desc}</p>
                    </div>
                </div>
                {extra}
            </div>
            {children}
        </div>
    );
}

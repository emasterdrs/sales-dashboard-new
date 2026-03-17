import { useState, useRef, useEffect } from 'react';
import { Filter, Target, Zap, Info, AlertCircle } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { supabase } from '../../lib/supabase';
import { generateFullDataset, convertToCSV, downloadCSV } from '../../data/generateSalesData';

export function DataUploadSubView({ setMasterData, masterData, profile, isDemo }) {
    const salesInputRef = useRef(null);
    const targetInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState({ sales: null, target: null });
    const [uploadHistory, setUploadHistory] = useState(() => {
        const saved = localStorage.getItem('dashboard_upload_history');
        return saved ? JSON.parse(saved) : { sales: { filename: '-', time: '-' }, target: { filename: '-', time: '-' } };
    });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        localStorage.setItem('dashboard_upload_history', JSON.stringify(uploadHistory));
    }, [uploadHistory]);

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) setSelectedFiles(prev => ({ ...prev, [type]: file }));
    };

    const handleFileUploadExecute = (type) => {
        const file = selectedFiles[type];
        if (!file) return alert('파일을 선택해 주세요.');
        if (!window.XLSX) return alert('XLSX 라이브러리가 로드되지 않았습니다.');

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = window.XLSX.read(bstr, { type: 'binary' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                let rows = window.XLSX.utils.sheet_to_json(ws);

                if (rows.length === 0) throw new Error('데이터가 없습니다.');

                const months = [...new Set(rows.map(r => String(r['년도월'])))];
                const mapped = rows.map(row => {
                    const clean = (v) => String(v || '').trim().replace(/^'/, '');
                    if (type === 'sales') return {
                        company_id: profile.company_id,
                        year_month: clean(row['년도월']),
                        team_name: clean(row['영업팀']),
                        person_name: clean(row['영업사원명']),
                        customer_code: clean(row['거래처코드']),
                        customer_name: clean(row['거래처명']),
                        type_name: clean(row['품목유형']),
                        item_code: clean(row['품목코드']),
                        item_name: clean(row['품목명']),
                        amount: Number(row['금액'] || row['매출금액'] || 0)
                    };
                    return {
                        company_id: profile.company_id,
                        year_month: clean(row['년도월']),
                        team_name: clean(row['영업팀']),
                        person_name: clean(row['영업사원명']),
                        amount: Number(row['금액'] || row['목표금액'] || 0)
                    };
                });

                const tableName = type === 'sales' ? 'sales_actual' : 'sales_target';
                await supabase.from(tableName).delete().eq('company_id', profile.company_id).in('year_month', months);

                const limit = (profile?.plan === 'free' || !profile?.plan) ? 100 : Infinity;
                const finalData = mapped.slice(0, limit);
                if (mapped.length > limit) alert('FREE 플랜은 100건으로 제한됩니다.');

                const CHUNK = 1000;
                for (let i = 0; i < finalData.length; i += CHUNK) {
                    await supabase.from(tableName).insert(finalData.slice(i, i + CHUNK));
                }

                const now = new Date();
                const timeStr = now.toLocaleString();
                setUploadHistory(p => ({ ...p, [type]: { filename: file.name, time: timeStr } }));
                setSelectedFiles(p => ({ ...p, [type]: null }));
                alert('업로드 완료!');
            } catch (e) {
                alert(`오류: ${e.message}`);
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleDownloadExample = (type, mode = 'example') => {
        let data = [];
        if (mode === 'example') {
            const dataset = generateFullDataset();
            data = type === 'sales' ? dataset.actual : dataset.target;
        } else {
            data = type === 'sales' ? [{ '년도월': '202601', '영업팀': '1팀', '영업사원명': '홍길동', '거래처코드': 'C001', '거래처명': '가나다', '품목유형': '치즈', '품목코드': 'P001', '품목명': '상품A', '매출금액': 1000000 }] : [{ '년도월': '202601', '영업팀': '1팀', '영업사원명': '홍길동', '목표금액': 1200000 }];
        }
        downloadCSV(convertToCSV(data), `${type}_data.csv`);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white border-2 border-indigo-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex gap-5">
                    <div className="p-4 bg-indigo-500 text-white rounded-2xl shadow-lg"><Zap size={24} /></div>
                    <div>
                        <h4 className="text-xl font-black mb-3">Data Upload Master Guide</h4>
                        <p className="text-sm font-bold text-slate-500">정확한 분석을 위해 표준 양식을 준수해 주세요.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SettingCard title="매출 실적 파일" icon={Filter} desc="ERP 마스터 데이터 업로드" extra={<div className="flex gap-2"><button onClick={() => handleDownloadExample('sales')} className="text-xs text-indigo-600">양식 다운로드</button></div>}>
                    <div className="space-y-4">
                        <input type="file" ref={salesInputRef} className="hidden" onChange={e => handleFileSelect(e, 'sales')} accept=".csv,.xlsx" />
                        <div className="flex gap-2">
                            <button onClick={() => salesInputRef.current.click()} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">파일 찾기</button>
                            <button onClick={() => handleFileUploadExecute('sales')} disabled={isDemo || isUploading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">업로드</button>
                        </div>
                        <p className="text-xs text-slate-400">최근: {uploadHistory.sales.filename} ({uploadHistory.sales.time})</p>
                    </div>
                </SettingCard>

                <SettingCard title="목표 데이터 파일" icon={Target} desc="연간/월간 목표 업로드" extra={<div className="flex gap-2"><button onClick={() => handleDownloadExample('target')} className="text-xs text-emerald-600">양식 다운로드</button></div>}>
                    <div className="space-y-4">
                        <input type="file" ref={targetInputRef} className="hidden" onChange={e => handleFileSelect(e, 'target')} accept=".csv,.xlsx" />
                        <div className="flex gap-2">
                            <button onClick={() => targetInputRef.current.click()} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">파일 찾기</button>
                            <button onClick={() => handleFileUploadExecute('target')} disabled={isDemo || isUploading} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold">업로드</button>
                        </div>
                        <p className="text-xs text-slate-400">최근: {uploadHistory.target.filename} ({uploadHistory.target.time})</p>
                    </div>
                </SettingCard>
            </div>
        </div>
    );
}

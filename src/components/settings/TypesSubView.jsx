import { useState, useEffect } from 'react';
import { Type, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

export function TypesSubView({ setMasterData, masterData, profile, isDemo }) {
    const { loadSettings, saveSettings } = useSettings(profile?.company_id);
    const [types, setTypes] = useState([{ id: 'T01', name: '영업유형' }]);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [typeEditName, setTypeEditName] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const settings = await loadSettings();
            if (settings?.types) setTypes(settings.types);
        };
        fetch();
    }, [loadSettings]);

    const saveChanges = async (updatedTypes) => {
        if (isDemo) return;
        const current = await loadSettings() || {};
        const success = await saveSettings({ ...current, types: updatedTypes });
        if (success && masterData) setMasterData({ ...masterData });
    };

    const handleAddType = () => {
        const newType = { id: `T${Date.now()}`, name: `새 유형${types.length + 1}` };
        const updated = [...types, newType];
        setTypes(updated);
        saveChanges(updated);
        setEditingTypeId(newType.id);
        setTypeEditName(newType.name);
    };

    const handleDeleteType = (id) => {
        if (!confirm('유형을 삭제하시겠습니까?')) return;
        const updated = types.filter(t => t.id !== id);
        setTypes(updated);
        saveChanges(updated);
    };

    const handleSaveTypeEdit = (id) => {
        if (!typeEditName.trim()) return;
        const updated = types.map(t => t.id === id ? { ...t, name: typeEditName } : t);
        setTypes(updated);
        setEditingTypeId(null);
        saveChanges(updated);
    };

    const handleMove = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= types.length) return;
        const updated = [...types];
        [updated[index], updated[target]] = [updated[target], updated[index]];
        setTypes(updated);
        saveChanges(updated);
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 p-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-amber-50 rounded-2xl text-amber-500"><Type size={24} /></div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">품목 유형 관리</h3>
                    <p className="text-sm text-slate-400 font-bold">배치 순서에 따라 메인 대시보드 순서가 결정됩니다.</p>
                </div>
            </div>
            <div className="max-w-3xl space-y-3">
                {types.map((type, index) => (
                    <div key={type.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white">
                        {editingTypeId === type.id ? (
                            <input autoFocus value={typeEditName} onChange={e => setTypeEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTypeEdit(type.id)} className="px-3 py-1.5 border rounded" />
                        ) : (
                            <span className="font-extrabold">{type.name}</span>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setTypeEditName(type.name); setEditingTypeId(type.id); }} className="text-xs text-slate-400">수정</button>
                            <button onClick={() => handleDeleteType(type.id)} className="text-xs text-slate-400">삭제</button>
                            <button onClick={() => handleMove(index, -1)} disabled={index === 0}><ArrowUp size={14} /></button>
                            <button onClick={() => handleMove(index, 1)} disabled={index === types.length - 1}><ArrowDown size={14} /></button>
                        </div>
                    </div>
                ))}
                <button onClick={handleAddType} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-black">+ 새로운 유형 추가</button>
            </div>
        </div>
    );
}

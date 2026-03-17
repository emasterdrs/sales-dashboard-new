import { useState, useEffect } from 'react';
import { Users, Building2, Info, ArrowUp, ArrowDown } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { useSettings } from '../../hooks/useSettings';

export function OrganizationSubView({ setMasterData, masterData, profile, isDemo }) {
    const { loadSettings, saveSettings } = useSettings(profile?.company_id);
    const [teams, setTeams] = useState([{ id: 1, name: '영업팀' }]);
    const [salespersons, setSalespersons] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const [editingTeamId, setEditingTeamId] = useState(null);
    const [teamEditName, setTeamEditName] = useState('');

    const [editingSpId, setEditingSpId] = useState(null);
    const [spEditName, setSpEditName] = useState('');

    const [selectedTeamIds, setSelectedTeamIds] = useState(new Set());
    const [selectedSpIds, setSelectedSpIds] = useState(new Set());

    useEffect(() => {
        const fetch = async () => {
            const settings = await loadSettings();
            if (settings) {
                if (settings.teams) setTeams(settings.teams);
                if (settings.salespersons) setSalespersons(settings.salespersons);
            }
        };
        fetch();
    }, [loadSettings]);

    const saveChanges = async (newTeams, newSps) => {
        if (isDemo) return;
        const current = await loadSettings() || {};
        const newData = { ...current, teams: newTeams, salespersons: newSps };
        const success = await saveSettings(newData);
        if (success && setMasterData && masterData) {
            setMasterData({ ...masterData });
        }
    };

    const handleAddTeam = () => {
        const newTeam = { id: Date.now(), name: '새 영업팀' };
        const updated = [...teams, newTeam];
        setTeams(updated);
        saveChanges(updated, salespersons);
        setEditingTeamId(newTeam.id);
        setTeamEditName('새 영업팀');
    };

    const handleDeleteTeam = (id) => {
        if (!window.confirm('해당 팀을 삭제하시겠습니까? 데이터는 "기타" 팀으로 집계됩니다.')) return;
        const updated = teams.filter(t => t.id !== id);
        setTeams(updated);
        if (selectedTeam === id) setSelectedTeam(null);
        saveChanges(updated, salespersons);
    };

    const handleSaveTeamEdit = (id) => {
        const updated = teams.map(t => t.id === id ? { ...t, name: teamEditName } : t);
        setTeams(updated);
        setEditingTeamId(null);
        saveChanges(updated, salespersons);
    };

    const handleAddSp = () => {
        if (!selectedTeam) return alert('먼저 팀을 선택해주세요.');
        const newSp = { id: Date.now(), teamId: selectedTeam, name: '새 사원' };
        const updated = [...salespersons, newSp];
        setSalespersons(updated);
        saveChanges(teams, updated);
        setEditingSpId(newSp.id);
        setSpEditName('새 사원');
    };

    const handleDeleteSp = (id) => {
        const updated = salespersons.filter(s => s.id !== id);
        setSalespersons(updated);
        saveChanges(teams, updated);
    };

    const handleSaveSpEdit = (id) => {
        const updated = salespersons.map(s => s.id === id ? { ...s, name: spEditName } : s);
        setSalespersons(updated);
        setEditingSpId(null);
        saveChanges(teams, updated);
    };

    const currentSpList = salespersons.filter(s => s.teamId === selectedTeam);

    const swap = (list, i, j) => {
        const newList = [...list];
        [newList[i], newList[j]] = [newList[j], newList[i]];
        return newList;
    };

    const handleMoveTeam = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= teams.length) return;
        const updated = swap(teams, index, target);
        setTeams(updated);
        saveChanges(updated, salespersons);
    };

    const handleMoveSp = (spId, direction) => {
        const idx = salespersons.findIndex(s => s.id === spId);
        const target = idx + direction;
        if (target < 0 || target >= salespersons.length) return;
        const updated = swap(salespersons, idx, target);
        setSalespersons(updated);
        saveChanges(teams, updated);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SettingCard title="영업팀 관리" icon={Users} desc={
                <>
                    활성 영업팀 및 조직 체계 구성
                    <span className="block mt-1.5 text-[12px] font-bold text-slate-400">
                        <Info size={12} className="inline mr-1" /> 배치 순서에 따라 대시보드 순서가 결정됩니다.
                    </span>
                </>
            }>
                <div className="space-y-3">
                    {teams.map((team, index) => (
                        <div
                            key={team.id}
                            className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl border ${selectedTeam === team.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}
                            onClick={() => setSelectedTeam(team.id)}
                        >
                            {editingTeamId === team.id ? (
                                <input autoFocus value={teamEditName} onChange={e => setTeamEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveTeamEdit(team.id)} className="px-3 py-1 border rounded" onClick={e => e.stopPropagation()} />
                            ) : (
                                <span className="font-extrabold">{team.name}</span>
                            )}
                            <div className="flex items-center gap-2">
                                <button onClick={e => { e.stopPropagation(); setTeamEditName(team.name); setEditingTeamId(team.id); }} className="text-xs text-slate-400 hover:text-indigo-600">수정</button>
                                <button onClick={e => { e.stopPropagation(); handleDeleteTeam(team.id); }} className="text-xs text-slate-400 hover:text-rose-500">삭제</button>
                                <button onClick={e => { e.stopPropagation(); handleMoveTeam(index, -1); }} disabled={index === 0}><ArrowUp size={14} /></button>
                                <button onClick={e => { e.stopPropagation(); handleMoveTeam(index, 1); }} disabled={index === teams.length - 1}><ArrowDown size={14} /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={handleAddTeam} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-black">+ 새로운 영업팀 추가</button>
                </div>
            </SettingCard>

            <SettingCard title="영업사원 마스터" icon={Building2} desc={selectedTeam ? `팀: ${teams.find(t => t.id === selectedTeam)?.name}` : "팀을 선택해주세요"}>
                {selectedTeam ? (
                    <div className="space-y-3">
                        {currentSpList.map((sp, idx) => (
                            <div key={sp.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                {editingSpId === sp.id ? (
                                    <input autoFocus value={spEditName} onChange={e => setSpEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveSpEdit(sp.id)} className="px-2 py-1 border rounded" />
                                ) : (
                                    <span className="font-bold">{sp.name}</span>
                                )}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setSpEditName(sp.name); setEditingSpId(sp.id); }} className="text-xs text-slate-400">수정</button>
                                    <button onClick={() => handleDeleteSp(sp.id)} className="text-xs text-slate-400">삭제</button>
                                    <button onClick={() => handleMoveSp(sp.id, -1)}><ArrowUp size={14} /></button>
                                    <button onClick={() => handleMoveSp(sp.id, 1)}><ArrowDown size={14} /></button>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddSp} className="w-full py-4 border-2 border-dashed rounded-2xl text-slate-400 font-black">+ 사원 추가</button>
                    </div>
                ) : (
                    <div className="py-12 text-center text-slate-400">팀을 선택해주세요.</div>
                )}
            </SettingCard>
        </div>
    );
}

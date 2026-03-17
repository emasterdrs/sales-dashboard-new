export const TEAM_COLORS = {
    '영업1팀': { main: '#6366f1', grad: 'from-indigo-600 to-blue-500' },
    '영업2팀': { main: '#10b981', grad: 'from-emerald-600 to-teal-500' },
    '영업3팀': { main: '#f59e0b', grad: 'from-amber-600 to-orange-500' },
    '영업4팀': { main: '#ef4444', grad: 'from-rose-600 to-pink-500' },
    '영업5팀': { main: '#8b5cf6', grad: 'from-violet-600 to-purple-500' },
    '전체': { main: '#3b82f6', grad: 'from-blue-600 to-indigo-500' },
    '기타': { main: '#94a3b8', grad: 'from-slate-400 to-slate-500' }
};

export const CHART_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#0ea5e9', '#d946ef', '#f97316', '#14b8a6', '#64748b'
];

export const CURRENCY_UNITS = [
    { key: '100M', label: '억원', divisor: 100000000, suffix: '억' },
    { key: '1M', label: '백만원', divisor: 1000000, suffix: '백만' },
    { key: '1K', label: '천원', divisor: 1000, suffix: '천' },
    { key: '1', label: '원', divisor: 1, suffix: '원' }
];

export const WEIGHT_UNITS = [
    { key: 'TON', label: '톤(Ton)', divisor: 1000, suffix: '톤' },
    { key: 'KG', label: '킬로그램(KG)', divisor: 1, suffix: 'kg' },
    { key: 'BOX', label: '박스(Box)', divisor: 10, suffix: 'box' },
    { key: 'EA', label: '개(EA)', divisor: 1, suffix: 'ea' }
];

export const TEST_ACCOUNTS = {
    FREE: 'free@test.com',
    PRO: 'pro@test.com',
    ULTRA: 'enterprise@test.com',
    MASTER: 'emasterdrs@gmail.com'
};

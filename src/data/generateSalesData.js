/**
 * [프로젝트 30억] 표준 데이터 생성 엔진
 * 기획안의 [매출업로드 표준 항목] 및 [목표업로드 표준 항목] 기반
 */
import { SALESPERSONS, ALL_CUSTOMERS, ALL_PRODUCTS } from './foodDistributionData.js';
import { GENERAL_SALESPERSONS, GENERAL_CUSTOMERS, GENERAL_PRODUCTS, GENERAL_TEAMS } from './generalData.js';

// 1. 유틸리티 함수
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 매출 데이터 생성 (팀별 가중치 반영)
 */
export function generateStandardSalesData(year, month, targetAmount, teamWeights, isGeneral = false) {
    const data = [];
    const yearMonth = `${year}${(month).toString().padStart(2, '0')}`;

    const sourceSps = isGeneral ? GENERAL_SALESPERSONS : SALESPERSONS;
    const sourceCustomers = isGeneral ? GENERAL_CUSTOMERS : ALL_CUSTOMERS;
    const sourceProducts = isGeneral ? GENERAL_PRODUCTS : ALL_PRODUCTS;

    // 각 팀별로 배분된 금액에 따라 데이터 생성
    Object.entries(teamWeights).forEach(([team, weight]) => {
        const teamTargetAmount = targetAmount * weight;
        let teamCurrentAmount = 0;

        // 해당 팀 사원들
        const teamSps = sourceSps.filter(sp => sp.team === team);
        if (teamSps.length === 0) return;

        while (teamCurrentAmount < teamTargetAmount) {
            const sp = teamSps[Math.floor(Math.random() * teamSps.length)];
            const customersOfSp = sourceCustomers.filter(c => c.salespersonId === sp.id);
            if (customersOfSp.length === 0) continue;

            const customer = customersOfSp[Math.floor(Math.random() * customersOfSp.length)];
            const product = sourceProducts[Math.floor(Math.random() * sourceProducts.length)];

            // 금액을 균일하게 배분하기 위해 랜덤성 조절
            const quantity = randomInt(5, 50); // 수량 조정
            const amount = Math.round(quantity * product.unitPrice);
            const weight_val = (quantity * (0.5 + Math.random() * 2)).toFixed(2);

            data.push({
                '년도월': yearMonth,
                '영업팀': sp.team,
                '영업사원명': sp.name,
                '거래처코드': customer.code,
                '거래처명': customer.name,
                '품목유형': product.type,
                '품목코드': product.code,
                '품목명': product.name,
                '매출금액': amount,
                '중량(KG)': isGeneral ? 0 : parseFloat(weight_val) // 일반 상품은 중량 생략 가능
            });

            teamCurrentAmount += amount;
            if (data.length > 20000) break; // 안전장치
        }
    });

    return data;
}

/**
 * 목표 데이터 생성 (팀별 가중치 반영)
 */
export function generateTargetData(year, month, totalTarget, teamWeights, isGeneral = false) {
    const data = [];
    const yearMonth = `${year}${(month).toString().padStart(2, '0')}`;
    const sourceSps = isGeneral ? GENERAL_SALESPERSONS : SALESPERSONS;

    Object.entries(teamWeights).forEach(([team, weight]) => {
        const teamTarget = totalTarget * weight;
        const teamSps = sourceSps.filter(sp => sp.team === team);
        if (teamSps.length === 0) return;

        const targetPerSp = Math.round(teamTarget / teamSps.length);

        teamSps.forEach(sp => {
            data.push({
                '년도월': yearMonth,
                '영업팀': sp.team,
                '영업사원명': sp.name,
                '거래처코드': '',
                '거래처명': '',
                '품목유형': '',
                '목표금액': targetPerSp
            });
        });
    });

    return data;
}

/**
 * 전 기간 데이터셋 생성
 */
export function generateFullDataset(isGeneral = false) {
    const years = [2024, 2025, 2026];
    const teamWeights = isGeneral ? {
        'Consumer Electronics': 0.35,
        'Lifestyle & Home': 0.2,
        'Digital & IT': 0.25,
        'Fashion & Beauty': 0.1,
        'Outdoors & Sports': 0.1
    } : {
        '영업1팀': 0.2,
        '영업2팀': 0.3,
        '영업3팀': 0.25,
        '영업4팀': 0.15,
        '영업5팀': 0.1
    };

    const fullActual = [];
    const fullTarget = [];

    years.forEach(year => {
        const monthsInYear = year === 2026 ? 3 : 12;

        let yearlyActualTarget = 0;
        if (year === 2024) yearlyActualTarget = isGeneral ? 120000000000 : 400000000000;
        else if (year === 2025) yearlyActualTarget = isGeneral ? 150000000000 : 450000000000;
        else if (year === 2026) yearlyActualTarget = isGeneral ? 15000000000 * 12 : 43000000000 * 12;

        const monthlyActualGoal = year === 2026 ? (isGeneral ? 15000000000 : 43000000000) : Math.round(yearlyActualTarget / 12);

        for (let month = 1; month <= monthsInYear; month++) {
            const achievementRate = 0.95 + (Math.random() * 0.15); // 좀 더 현실적인 편차
            const monthlyTargetAmount = isGeneral ? Math.round(monthlyActualGoal * 0.9) : Math.round(monthlyActualGoal / achievementRate);
            const monthlyActualAmount = Math.round(monthlyTargetAmount * achievementRate);

            let actualToGen = monthlyActualAmount;
            if (year === 2026 && month === 3) {
                actualToGen = Math.round(monthlyActualAmount * 0.66); // 20일치 정도
            }

            fullActual.push(...generateStandardSalesData(year, month, actualToGen, teamWeights, isGeneral));
            fullTarget.push(...generateTargetData(year, month, monthlyTargetAmount, teamWeights, isGeneral));
        }
    });

    return { actual: fullActual, target: fullTarget };
}

/**
 * CSV 변환 함수
 */
export function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(header => {
            const val = row[header];
            // 쉼표 포함 시 따옴표 처리
            if (typeof val === 'string' && val.includes(',')) {
                return `"${val}"`;
            }
            return val;
        }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
}

/**
 * 브라우저 다운로드
 */
export function downloadCSV(csvContent, filename) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

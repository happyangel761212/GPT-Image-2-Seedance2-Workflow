import type { SurveyResponse } from '../types/survey';

export function calculateDigitalScore(response: Partial<SurveyResponse>): number {
  let score = 0;

  const smartphoneScores: Record<string, number> = {
    '기본 통화·문자 중심': 1,
    '앱 사용 가능': 2,
    '다양한 앱을 능숙하게 사용': 3,
    '모바일로 문서·콘텐츠 제작 가능': 4,
  };
  score += smartphoneScores[response.smartphoneLevel || ''] || 0;

  const confidenceScores: Record<string, number> = {
    '매우 낮음': 1,
    '낮음': 2,
    '보통': 3,
    '높음': 4,
    '매우 높음': 5,
  };
  score += confidenceScores[response.digitalConfidence || ''] || 0;

  score += Math.min(response.digitalTools?.length || 0, 5);

  const laptopScores: Record<string, number> = {
    '없음': 0,
    '가져오기 어려움': 1,
    '가져올 수 있음': 2,
    '있음': 3,
  };
  score += laptopScores[response.laptopStatus || ''] || 0;

  return Math.min(Math.round((score / 17) * 100), 100);
}

export function calculateAIScore(response: Partial<SurveyResponse>): number {
  let score = 0;

  const expScores: Record<string, number> = {
    '전혀 없음': 0,
    '이름만 들어봄': 1,
    '1~2번 사용': 2,
    '가끔 사용': 3,
    '자주 사용': 4,
  };
  score += expScores[response.aiExperience || ''] || 0;

  const usedServices = response.usedAIServices?.filter(s => s !== '없음') || [];
  score += Math.min(usedServices.length, 4);

  score += Math.min(response.aiUsagePurpose?.filter(p => p !== '사용 경험 없음').length || 0, 4);

  const paidServices = response.paidAIServices?.filter(s => s !== '없음') || [];
  score += paidServices.length > 0 ? 3 : 0;

  return Math.min(Math.round((score / 15) * 100), 100);
}

export function classifyCompetencyGroup(digitalScore: number, aiScore: number, response: Partial<SurveyResponse>): string {
  const hasPaidAI = (response.paidAIServices?.filter(s => s !== '없음').length || 0) > 0;
  const isWorkPurpose = response.educationPurpose === '업무 활용';
  const isLifePurpose = ['자기계발', '자녀교육', '단순 호기심'].includes(response.educationPurpose || '');

  if (digitalScore < 30 && aiScore < 20) return '디지털 입문형';
  if (digitalScore < 60 && aiScore < 30) return 'AI 첫걸음형';
  if (aiScore >= 60 && hasPaidAI) return '고급확장형';
  if (isWorkPurpose && aiScore >= 30) return '업무활용형';
  if (isLifePurpose || digitalScore >= 40) return '생활활용형';
  return 'AI 첫걸음형';
}

export function getRecommendedDirections(response: Partial<SurveyResponse>, competencyGroup: string): string[] {
  const directions: string[] = [];

  if (competencyGroup === '디지털 입문형') {
    directions.push('기초 개념 중심', '스마트폰 실습 중심');
  } else if (competencyGroup === 'AI 첫걸음형') {
    directions.push('기초 개념 중심', '프롬프트 실습 중심');
  } else if (competencyGroup === '생활활용형') {
    directions.push('프롬프트 실습 중심', '콘텐츠 제작 중심');
  } else if (competencyGroup === '업무활용형') {
    directions.push('업무 자동화 중심', '프롬프트 실습 중심');
    if (['있음', '가져올 수 있음'].includes(response.laptopStatus || '')) {
      directions.push('노트북 실습 중심');
    }
  } else if (competencyGroup === '고급확장형') {
    directions.push('업무 자동화 중심', '콘텐츠 제작 중심');
  }

  if (['없음', '가져오기 어려움'].includes(response.laptopStatus || '') && !directions.includes('스마트폰 실습 중심')) {
    directions.push('스마트폰 실습 중심');
  }

  return [...new Set(directions)];
}

export function analyzeResponses(responses: SurveyResponse[]): {
  avgDigitalScore: number;
  avgAIScore: number;
  laptopAvailableRate: number;
  aiExperienceRate: number;
  paidAIRate: number;
  groupDistribution: Record<string, number>;
  recommendedReport: string;
  topDirections: string[];
} {
  if (responses.length === 0) {
    return {
      avgDigitalScore: 0,
      avgAIScore: 0,
      laptopAvailableRate: 0,
      aiExperienceRate: 0,
      paidAIRate: 0,
      groupDistribution: {},
      recommendedReport: '응답 데이터가 없습니다.',
      topDirections: [],
    };
  }

  const avgDigitalScore = Math.round(responses.reduce((sum, r) => sum + r.digitalScore, 0) / responses.length);
  const avgAIScore = Math.round(responses.reduce((sum, r) => sum + r.aiScore, 0) / responses.length);

  const laptopAvailable = responses.filter(r => ['있음', '가져올 수 있음'].includes(r.laptopStatus)).length;
  const laptopAvailableRate = Math.round((laptopAvailable / responses.length) * 100);

  const aiExperienced = responses.filter(r => !['전혀 없음', '이름만 들어봄'].includes(r.aiExperience)).length;
  const aiExperienceRate = Math.round((aiExperienced / responses.length) * 100);

  const paidAI = responses.filter(r => r.paidAIServices.filter(s => s !== '없음').length > 0).length;
  const paidAIRate = Math.round((paidAI / responses.length) * 100);

  const groupDistribution: Record<string, number> = {};
  responses.forEach(r => {
    groupDistribution[r.competencyGroup] = (groupDistribution[r.competencyGroup] || 0) + 1;
  });

  const directionCounts: Record<string, number> = {};
  responses.forEach(r => {
    r.recommendedDirection.forEach(d => {
      directionCounts[d] = (directionCounts[d] || 0) + 1;
    });
  });
  const topDirections = Object.entries(directionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([d]) => d);

  const dominantGroup = Object.entries(groupDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  const reportMap: Record<string, string> = {
    '디지털 입문형': `이번 교육 참여자는 디지털 기기 사용에 익숙하지 않은 입문자가 많습니다. 스마트폰 기본 활용부터 시작하여 AI 개념을 쉽게 연결하는 단계별 접근이 필요합니다.`,
    'AI 첫걸음형': `이번 교육 참여자는 AI에 대한 기본 개념이 부족한 초급자가 많으므로 기본 개념 설명과 쉬운 프롬프트 실습을 먼저 진행하는 것이 적합합니다.`,
    '생활활용형': `참여자 대부분이 일상생활에서의 AI 활용을 원하고 있습니다. ChatGPT를 활용한 생활 밀착형 실습 위주로 교육을 구성하세요.`,
    '업무활용형': `업무 효율화에 관심이 높은 참여자들입니다. 문서 작성 자동화, 데이터 분석 등 실무 중심의 AI 활용 실습을 중점적으로 구성하세요.`,
    '고급확장형': `AI 유료 서비스 경험자 비율이 높고 활용 수준이 높습니다. 고급 프롬프트 엔지니어링과 AI 자동화 워크플로우 구성에 집중하세요.`,
  };

  const recommendedReport = reportMap[dominantGroup] || `전체 ${responses.length}명의 응답을 기반으로 교육 방향을 분석했습니다. 디지털 점수 ${avgDigitalScore}점, AI 활용도 ${avgAIScore}점으로 기초 중심의 맞춤형 교육이 권장됩니다.`;

  return {
    avgDigitalScore,
    avgAIScore,
    laptopAvailableRate,
    aiExperienceRate,
    paidAIRate,
    groupDistribution,
    recommendedReport,
    topDirections,
  };
}

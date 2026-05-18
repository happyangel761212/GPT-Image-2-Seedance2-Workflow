import * as XLSX from 'xlsx';
import type { SurveyResponse } from '../types/survey';

export function exportToExcel(responses: SurveyResponse[]): void {
  const data = responses.map(r => ({
    '제출일시': new Date(r.submittedAt).toLocaleString('ko-KR'),
    '이름': r.name,
    '연령대': r.ageGroup,
    '직업/활동': r.occupation,
    '교육 참여 목적': r.educationPurpose,
    '학습 목표': r.learningGoals.join(', '),
    '노트북 보유': r.laptopStatus,
    '스마트폰 수준': r.smartphoneLevel,
    '디지털 자신감': r.digitalConfidence,
    '사용 디지털 도구': r.digitalTools.join(', '),
    'AI 사용 경험': r.aiExperience,
    '사용해본 AI 서비스': r.usedAIServices.join(', '),
    'AI 유료 결제': r.paidAIServices.join(', '),
    'AI 사용 목적': r.aiUsagePurpose.join(', '),
    'AI 자가진단 수준': r.aiSelfLevel,
    '현재 어려운 점': r.currentChallenges.join(', '),
    '강사에게 전할 말': r.messageToInstructor,
    '디지털 친숙도 점수': r.digitalScore,
    'AI 활용도 점수': r.aiScore,
    '역량 그룹': r.competencyGroup,
    '추천 교육 방향': r.recommendedDirection.join(', '),
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const colWidths = [
    { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
    { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 25 },
    { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
    { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 30 },
    { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 },
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '설문 응답');
  XLSX.writeFile(wb, 'ai-learning-survey-responses.xlsx');
}

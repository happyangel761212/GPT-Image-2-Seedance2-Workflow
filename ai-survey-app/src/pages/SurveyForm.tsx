import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { saveResponse } from '../utils/storage';
import { calculateDigitalScore, calculateAIScore, classifyCompetencyGroup, getRecommendedDirections } from '../utils/scoring';
import type { SurveyResponse } from '../types/survey';

const TOTAL_STEPS = 5;

const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];
const OCCUPATIONS = ['학생', '직장인', '자영업', '프리랜서', '주부', '은퇴자', '강사', '기타'];
const EDUCATION_PURPOSES = ['업무 활용', '자기계발', '자녀교육', '창업·부업', '강의 준비', '콘텐츠 제작', '단순 호기심'];
const LEARNING_GOALS = [
  'AI 기본 이해',
  'ChatGPT 사용법',
  '프롬프트 작성법',
  '업무·생활 활용법',
  '문서작성 자동화',
  '발표자료 제작',
  '이미지·영상 생성',
  '콘텐츠 제작',
  '수익화·창업 아이디어',
  '나에게 맞는 AI 활용법',
];
const LAPTOP_STATUSES = ['있음', '가져올 수 있음', '가져오기 어려움', '없음'];
const SMARTPHONE_LEVELS = [
  '기본 통화·문자 중심',
  '앱 사용 가능',
  '다양한 앱을 능숙하게 사용',
  '모바일로 문서·콘텐츠 제작 가능',
];
const DIGITAL_CONFIDENCES = ['매우 낮음', '낮음', '보통', '높음', '매우 높음'];
const DIGITAL_TOOLS = ['카카오톡', '구글', '네이버', '유튜브', '엑셀', '파워포인트', '줌', '노션', '캔바', '기타'];
const AI_EXPERIENCES = ['전혀 없음', '이름만 들어봄', '1~2번 사용', '가끔 사용', '자주 사용'];
const AI_SERVICES = ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity', 'Canva AI', '뤼튼', '기타', '없음'];
const PAID_AI_SERVICES = ['ChatGPT Plus', 'Claude Pro', 'Gemini Advanced', 'Perplexity Pro', '기타', '없음'];
const AI_USAGE_PURPOSES = [
  '질문·검색',
  '글쓰기',
  '문서요약',
  '이미지 생성',
  '발표자료 제작',
  '공부·학습',
  '업무자동화',
  '아이디어 정리',
  '사용 경험 없음',
];
const AI_SELF_LEVELS = ['완전 입문', '초급', '중급', '고급', '전문가'];
const CURRENT_CHALLENGES = [
  '어디서 시작할지 모르겠음',
  'AI 답변을 믿어도 되는지 모르겠음',
  '프롬프트를 어떻게 써야 할지 모르겠음',
  '질문을 어떻게 해야 할지 모르겠음',
  '실생활에 어떻게 연결할지 모르겠음',
  '기기 사용이 익숙하지 않음',
  '유료 결제가 부담됨',
  '특별히 어려운 점 없음',
];

interface FormData {
  name: string;
  ageGroup: string;
  occupation: string;
  educationPurpose: string;
  learningGoals: string[];
  laptopStatus: string;
  smartphoneLevel: string;
  digitalConfidence: string;
  digitalTools: string[];
  aiExperience: string;
  usedAIServices: string[];
  paidAIServices: string[];
  aiUsagePurpose: string[];
  aiSelfLevel: string;
  currentChallenges: string[];
  messageToInstructor: string;
}

const initialFormData: FormData = {
  name: '',
  ageGroup: '',
  occupation: '',
  educationPurpose: '',
  learningGoals: [],
  laptopStatus: '',
  smartphoneLevel: '',
  digitalConfidence: '',
  digitalTools: [],
  aiExperience: '',
  usedAIServices: [],
  paidAIServices: [],
  aiUsagePurpose: [],
  aiSelfLevel: '',
  currentChallenges: [],
  messageToInstructor: '',
};

function ProgressBar({ step, total }: { step: number; total: number }) {
  const percent = ((step - 1) / (total - 1)) * 100;
  const stepLabels = ['기본 정보', '학습 목적', '기기·디지털', 'AI 경험', '어려운 점'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-blue-600">{step} / {total} 단계</span>
        <span className="text-sm text-gray-500">{stepLabels[step - 1]}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${percent === 0 ? 5 : percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, i) => (
          <div
            key={label}
            className={clsx(
              'text-xs font-medium transition-colors',
              i + 1 <= step ? 'text-blue-600' : 'text-gray-300'
            )}
          >
            {i + 1 <= step ? <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> : null}
            <span className="hidden sm:inline">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleSelect({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  cols?: number;
}) {
  return (
    <div className={clsx('grid gap-2', cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-1')}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={clsx(
            'px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-left',
            value === opt
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  cols?: number;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className={clsx('grid gap-2', cols === 2 ? 'grid-cols-2' : cols === 3 ? 'grid-cols-3' : 'grid-cols-1')}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={clsx(
            'px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-left',
            value.includes(opt)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
          )}
        >
          {value.includes(opt) ? '✓ ' : ''}{opt}
        </button>
      ))}
    </div>
  );
}

function FormField({ label, required, hint, children }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

// Step 1: Basic Info
function Step1({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">기본 정보</h2>
        <p className="text-sm text-gray-500">교육생 기본 정보를 입력해 주세요.</p>
      </div>

      <FormField label="이름 (닉네임 가능)" required>
        <input
          type="text"
          value={data.name}
          onChange={e => onChange({ name: e.target.value })}
          className="input-field"
          placeholder="홍길동"
        />
      </FormField>

      <FormField label="연령대" required>
        <SingleSelect
          options={AGE_GROUPS}
          value={data.ageGroup}
          onChange={v => onChange({ ageGroup: v })}
          cols={3}
        />
      </FormField>

      <FormField label="직업 / 현재 활동" required>
        <SingleSelect
          options={OCCUPATIONS}
          value={data.occupation}
          onChange={v => onChange({ occupation: v })}
          cols={2}
        />
      </FormField>
    </div>
  );
}

// Step 2: Learning Purpose
function Step2({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">학습 목적</h2>
        <p className="text-sm text-gray-500">이번 AI 교육에 참여하는 목적을 알려주세요.</p>
      </div>

      <FormField label="이번 교육에 참여하는 주된 목적은 무엇인가요?" required>
        <SingleSelect
          options={EDUCATION_PURPOSES}
          value={data.educationPurpose}
          onChange={v => onChange({ educationPurpose: v })}
          cols={2}
        />
      </FormField>

      <FormField label="이번 교육에서 배우고 싶은 내용은 무엇인가요?" required hint="최대 3가지 선택">
        <MultiSelect
          options={LEARNING_GOALS}
          value={data.learningGoals}
          onChange={v => onChange({ learningGoals: v.slice(0, 3) })}
          cols={2}
        />
        <p className="text-xs text-gray-400 mt-2">{data.learningGoals.length}/3 선택됨</p>
      </FormField>
    </div>
  );
}

// Step 3: Device & Digital
function Step3({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">기기 및 디지털 활용</h2>
        <p className="text-sm text-gray-500">평소 기기 사용 환경과 디지털 활용 수준을 알려주세요.</p>
      </div>

      <FormField label="교육 당일 노트북 지참 여부" required>
        <SingleSelect
          options={LAPTOP_STATUSES}
          value={data.laptopStatus}
          onChange={v => onChange({ laptopStatus: v })}
          cols={2}
        />
      </FormField>

      <FormField label="스마트폰 활용 수준은 어느 정도인가요?" required>
        <SingleSelect
          options={SMARTPHONE_LEVELS}
          value={data.smartphoneLevel}
          onChange={v => onChange({ smartphoneLevel: v })}
          cols={1}
        />
      </FormField>

      <FormField label="디지털 기기 전반에 대한 자신감은 어느 정도인가요?" required>
        <SingleSelect
          options={DIGITAL_CONFIDENCES}
          value={data.digitalConfidence}
          onChange={v => onChange({ digitalConfidence: v })}
          cols={3}
        />
      </FormField>

      <FormField label="평소 자주 사용하는 디지털 도구는 무엇인가요?" hint="해당하는 것 모두 선택">
        <MultiSelect
          options={DIGITAL_TOOLS}
          value={data.digitalTools}
          onChange={v => onChange({ digitalTools: v })}
          cols={3}
        />
      </FormField>
    </div>
  );
}

// Step 4: AI Experience
function Step4({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">AI 서비스 사용 경험</h2>
        <p className="text-sm text-gray-500">현재까지의 AI 활용 경험을 알려주세요.</p>
      </div>

      <FormField label="AI 서비스를 사용해 본 경험이 있으신가요?" required>
        <SingleSelect
          options={AI_EXPERIENCES}
          value={data.aiExperience}
          onChange={v => onChange({ aiExperience: v })}
          cols={1}
        />
      </FormField>

      <FormField label="사용해 본 AI 서비스를 모두 선택해 주세요." hint="해당하는 것 모두 선택 (없으면 '없음' 선택)">
        <MultiSelect
          options={AI_SERVICES}
          value={data.usedAIServices}
          onChange={v => onChange({ usedAIServices: v })}
          cols={2}
        />
      </FormField>

      <FormField label="현재 유료로 사용 중인 AI 서비스가 있나요?" hint="해당하는 것 모두 선택 (없으면 '없음' 선택)">
        <MultiSelect
          options={PAID_AI_SERVICES}
          value={data.paidAIServices}
          onChange={v => onChange({ paidAIServices: v })}
          cols={2}
        />
      </FormField>

      <FormField label="AI 서비스를 주로 어떤 용도로 사용하시나요?" hint="해당하는 것 모두 선택">
        <MultiSelect
          options={AI_USAGE_PURPOSES}
          value={data.aiUsagePurpose}
          onChange={v => onChange({ aiUsagePurpose: v })}
          cols={2}
        />
      </FormField>

      <FormField label="본인의 AI 활용 수준을 어떻게 평가하시나요?" required>
        <SingleSelect
          options={AI_SELF_LEVELS}
          value={data.aiSelfLevel}
          onChange={v => onChange({ aiSelfLevel: v })}
          cols={3}
        />
      </FormField>
    </div>
  );
}

// Step 5: Challenges
function Step5({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">어려운 점 & 강사에게 전할 말</h2>
        <p className="text-sm text-gray-500">마지막 단계입니다. 솔직하게 작성해 주세요.</p>
      </div>

      <FormField label="AI·디지털 기술 활용에서 현재 어려운 점이 있으신가요?" hint="해당하는 것 모두 선택">
        <MultiSelect
          options={CURRENT_CHALLENGES}
          value={data.currentChallenges}
          onChange={v => onChange({ currentChallenges: v })}
          cols={1}
        />
      </FormField>

      <FormField label="강사에게 전하고 싶은 말이 있으신가요?" hint="선택 사항 — 기대하는 것, 궁금한 점, 요청사항 등">
        <textarea
          value={data.messageToInstructor}
          onChange={e => onChange({ messageToInstructor: e.target.value })}
          className="input-field resize-none h-28"
          placeholder="예: 실습 중심으로 알려주세요. / 챗GPT 유료 결제 없이도 배울 수 있나요?"
        />
      </FormField>
    </div>
  );
}

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 1:
      return data.name.trim().length > 0 && data.ageGroup !== '' && data.occupation !== '';
    case 2:
      return data.educationPurpose !== '' && data.learningGoals.length > 0;
    case 3:
      return data.laptopStatus !== '' && data.smartphoneLevel !== '' && data.digitalConfidence !== '';
    case 4:
      return data.aiExperience !== '' && data.aiSelfLevel !== '';
    case 5:
      return true;
    default:
      return false;
  }
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (partial: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...partial }));
  };

  const canProceed = isStepValid(step, formData);

  const handleNext = () => {
    if (step < TOTAL_STEPS && canProceed) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) return;
    setSubmitting(true);

    await new Promise(r => setTimeout(r, 800));

    const digitalScore = calculateDigitalScore(formData);
    const aiScore = calculateAIScore(formData);
    const competencyGroup = classifyCompetencyGroup(digitalScore, aiScore, formData);
    const recommendedDirection = getRecommendedDirections(formData, competencyGroup);

    const response: SurveyResponse = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      submittedAt: new Date().toISOString(),
      ...formData,
      digitalScore,
      aiScore,
      competencyGroup,
      recommendedDirection,
    };

    saveResponse(response);
    navigate('/complete');
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} onChange={handleChange} />;
      case 2: return <Step2 data={formData} onChange={handleChange} />;
      case 3: return <Step3 data={formData} onChange={handleChange} />;
      case 4: return <Step4 data={formData} onChange={handleChange} />;
      case 5: return <Step5 data={formData} onChange={handleChange} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-700 text-sm">AI 교육 사전 진단 설문</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar step={step} total={TOTAL_STEPS} />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all',
                step === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className={clsx(
                  'flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
                  canProceed
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    제출 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    설문 제출하기
                  </>
                )}
              </button>
            )}
          </div>

          {!canProceed && step < TOTAL_STEPS && (
            <p className="text-center text-xs text-gray-400 mt-3">
              필수 항목을 모두 선택해 주세요.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

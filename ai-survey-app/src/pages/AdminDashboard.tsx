import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Laptop, Brain, TrendingUp, Download, Trash2, LogOut,
  Search, Filter, X, ChevronDown, Eye, RefreshCw, Sparkles,
  FileText, AlertTriangle, Database
} from 'lucide-react';
import clsx from 'clsx';
import { getResponses, deleteResponse, clearAllResponses, setAdminSession } from '../utils/storage';
import { analyzeResponses } from '../utils/scoring';
import { exportToExcel } from '../utils/exportExcel';
import { sampleResponses } from '../data/sampleResponses';
import type { SurveyResponse } from '../types/survey';

const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
const GROUP_COLORS: Record<string, string> = {
  '디지털 입문형': '#f59e0b',
  'AI 첫걸음형': '#3b82f6',
  '생활활용형': '#10b981',
  '업무활용형': '#6366f1',
  '고급확장형': '#ec4899',
};

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

interface DetailModalProps {
  response: SurveyResponse;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function DetailModal({ response, onClose, onDelete }: DetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const groupColor = GROUP_COLORS[response.competencyGroup] || '#6366f1';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );

  const Row = ({ label, value }: { label: string; value: string | string[] }) => (
    <div className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <span className="text-sm text-gray-700 font-medium">
        {Array.isArray(value) ? value.join(', ') : value}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h3 className="font-bold text-gray-800">{response.name}</h3>
            <p className="text-xs text-gray-400">{new Date(response.submittedAt).toLocaleString('ko-KR')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{response.digitalScore}</div>
              <div className="text-xs text-blue-500">디지털 점수</div>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-indigo-600">{response.aiScore}</div>
              <div className="text-xs text-indigo-500">AI 점수</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ backgroundColor: groupColor + '20' }}>
              <div className="text-sm font-bold" style={{ color: groupColor }}>{response.competencyGroup}</div>
              <div className="text-xs mt-1" style={{ color: groupColor + 'aa' }}>역량 그룹</div>
            </div>
          </div>

          {/* Recommended Directions */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">추천 교육 방향</h4>
            <div className="flex flex-wrap gap-2">
              {response.recommendedDirection.map(d => (
                <span key={d} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <Section title="기본 정보">
            <Row label="연령대" value={response.ageGroup} />
            <Row label="직업" value={response.occupation} />
            <Row label="교육 목적" value={response.educationPurpose} />
            <Row label="학습 목표" value={response.learningGoals} />
          </Section>

          <Section title="기기 및 디지털">
            <Row label="노트북 지참" value={response.laptopStatus} />
            <Row label="스마트폰 수준" value={response.smartphoneLevel} />
            <Row label="디지털 자신감" value={response.digitalConfidence} />
            <Row label="사용 도구" value={response.digitalTools} />
          </Section>

          <Section title="AI 경험">
            <Row label="AI 사용 경험" value={response.aiExperience} />
            <Row label="사용 AI 서비스" value={response.usedAIServices} />
            <Row label="유료 AI" value={response.paidAIServices} />
            <Row label="AI 활용 목적" value={response.aiUsagePurpose} />
            <Row label="자가 진단" value={response.aiSelfLevel} />
          </Section>

          {response.currentChallenges.length > 0 && (
            <Section title="어려운 점">
              <div className="flex flex-wrap gap-1.5">
                {response.currentChallenges.map(c => (
                  <span key={c} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs">{c}</span>
                ))}
              </div>
            </Section>
          )}

          {response.messageToInstructor && (
            <Section title="강사에게">
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 italic">"{response.messageToInstructor}"</p>
            </Section>
          )}

          {/* Delete */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 flex-1">정말 삭제하시겠습니까?</span>
                <button
                  onClick={() => onDelete(response.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                이 응답 삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('전체');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSampleLoaded, setShowSampleLoaded] = useState(false);

  const loadResponses = () => {
    setResponses(getResponses());
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const analysis = analyzeResponses(responses);

  // Chart data
  const ageData = Object.entries(
    responses.reduce<Record<string, number>>((acc, r) => {
      acc[r.ageGroup] = (acc[r.ageGroup] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const aiExpData = Object.entries(
    responses.reduce<Record<string, number>>((acc, r) => {
      acc[r.aiExperience] = (acc[r.aiExperience] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const groupData = Object.entries(analysis.groupDistribution).map(([name, value]) => ({ name, value }));

  const laptopData = [
    { name: '있음', value: responses.filter(r => r.laptopStatus === '있음').length },
    { name: '가져올 수 있음', value: responses.filter(r => r.laptopStatus === '가져올 수 있음').length },
    { name: '가져오기 어려움', value: responses.filter(r => r.laptopStatus === '가져오기 어려움').length },
    { name: '없음', value: responses.filter(r => r.laptopStatus === '없음').length },
  ].filter(d => d.value > 0);

  // Filtered responses
  const filteredResponses = responses.filter(r => {
    const matchSearch = search === '' ||
      r.name.includes(search) ||
      r.occupation.includes(search) ||
      r.ageGroup.includes(search) ||
      r.competencyGroup.includes(search);
    const matchGroup = filterGroup === '전체' || r.competencyGroup === filterGroup;
    return matchSearch && matchGroup;
  });

  const handleLogout = () => {
    setAdminSession(false);
    navigate('/admin-login', { replace: true });
  };

  const handleDelete = (id: string) => {
    deleteResponse(id);
    setSelectedResponse(null);
    loadResponses();
  };

  const handleClearAll = () => {
    clearAllResponses();
    setShowClearConfirm(false);
    loadResponses();
  };

  const handleLoadSamples = () => {
    const existing = getResponses();
    const combined = [...existing];
    sampleResponses.forEach(s => {
      // Give fresh IDs and timestamps
      combined.push({
        ...s,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    });
    localStorage.setItem('ai_survey_responses', JSON.stringify(combined));
    loadResponses();
    setShowSampleLoaded(true);
    setTimeout(() => setShowSampleLoaded(false), 3000);
  };

  const allGroups = ['전체', ...Object.keys(GROUP_COLORS)];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-base leading-none">설문 분석 대시보드</h1>
              <p className="text-xs text-gray-400 mt-0.5">AI Learning Readiness Survey</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(responses)}
              disabled={responses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">엑셀 다운로드</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* No data banner */}
        {responses.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">아직 응답 데이터가 없습니다</h3>
            <p className="text-sm text-gray-400 mb-6">설문이 제출되면 여기에 분석 결과가 표시됩니다.</p>
            <button
              onClick={handleLoadSamples}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              샘플 데이터 불러오기 (20명)
            </button>
          </div>
        )}

        {showSampleLoaded && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            샘플 데이터 {sampleResponses.length}명이 로드되었습니다.
          </div>
        )}

        {responses.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                label="총 응답자"
                value={responses.length}
                sub="명"
                icon={Users}
                color="bg-blue-500"
              />
              <StatCard
                label="디지털 평균"
                value={`${analysis.avgDigitalScore}점`}
                icon={TrendingUp}
                color="bg-indigo-500"
              />
              <StatCard
                label="AI 활용 평균"
                value={`${analysis.avgAIScore}점`}
                icon={Brain}
                color="bg-purple-500"
              />
              <StatCard
                label="노트북 가능"
                value={`${analysis.laptopAvailableRate}%`}
                sub="지참 가능 비율"
                icon={Laptop}
                color="bg-cyan-500"
              />
              <StatCard
                label="AI 경험자"
                value={`${analysis.aiExperienceRate}%`}
                sub="사용 경험 있음"
                icon={Brain}
                color="bg-violet-500"
              />
              <StatCard
                label="유료 AI 사용"
                value={`${analysis.paidAIRate}%`}
                sub="유료 결제 중"
                icon={TrendingUp}
                color="bg-rose-500"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  연령대 분포
                </h3>
                {ageData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v}명`, '응답자']}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">데이터 없음</div>
                )}
              </div>

              {/* AI Experience */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  AI 사용 경험 분포
                </h3>
                {aiExpData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={aiExpData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {aiExpData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v}명`, '응답자']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">데이터 없음</div>
                )}
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competency Groups */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  역량 그룹 분포
                </h3>
                {groupData.length > 0 ? (
                  <div className="space-y-3">
                    {groupData.map(({ name, value }) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-28 shrink-0">{name}</span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center px-2 transition-all duration-500"
                            style={{
                              width: `${(value / responses.length) * 100}%`,
                              backgroundColor: GROUP_COLORS[name] || '#6366f1',
                            }}
                          >
                            <span className="text-white text-xs font-medium">{value}명</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {Math.round((value / responses.length) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">데이터 없음</div>
                )}
              </div>

              {/* Laptop Status */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-500" />
                  노트북 지참 현황
                </h3>
                {laptopData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={laptopData}
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {laptopData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#06b6d4', '#0ea5e9', '#f59e0b', '#ef4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v}명`, '응답자']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">데이터 없음</div>
                )}
              </div>
            </div>

            {/* Auto Analysis */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                강사용 자동 분석 리포트
              </h3>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.recommendedReport}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">추천 교육 방향 Top 3</h4>
                  <div className="space-y-2">
                    {analysis.topDirections.map((dir, i) => (
                      <div key={dir} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">{dir}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">교육 구성 시 고려사항</h4>
                  <ul className="space-y-1.5 text-sm text-gray-600">
                    {analysis.laptopAvailableRate < 50 && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 text-amber-500 mt-0.5 shrink-0">⚠</span>
                        노트북 지참 가능 인원이 {analysis.laptopAvailableRate}%로 낮습니다. 스마트폰 실습을 병행하세요.
                      </li>
                    )}
                    {analysis.aiExperienceRate < 40 && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 text-blue-500 mt-0.5 shrink-0">ℹ</span>
                        AI 사용 경험자가 {analysis.aiExperienceRate}%입니다. 기초 개념 설명에 충분한 시간을 배정하세요.
                      </li>
                    )}
                    {analysis.paidAIRate > 30 && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 text-green-500 mt-0.5 shrink-0">✓</span>
                        유료 AI 사용자가 {analysis.paidAIRate}%로 상당히 높습니다. 심화 활용법도 포함하세요.
                      </li>
                    )}
                    {analysis.avgAIScore > 50 && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 text-purple-500 mt-0.5 shrink-0">★</span>
                        평균 AI 활용도가 높습니다. 기초 설명을 간략히 하고 실습에 집중하세요.
                      </li>
                    )}
                    {analysis.avgAIScore <= 30 && (
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 text-orange-500 mt-0.5 shrink-0">!</span>
                        전체 AI 활용도가 낮습니다. 쉬운 사례부터 시작하는 단계별 접근을 권장합니다.
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 text-gray-400 mt-0.5 shrink-0">•</span>
                      총 {responses.length}명의 데이터를 기반으로 분석되었습니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Response Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    응답 목록
                    <span className="text-xs font-normal text-gray-400 ml-1">({filteredResponses.length}명)</span>
                  </h3>

                  <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 min-w-0">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="이름, 직업, 그룹 검색..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <select
                        value={filterGroup}
                        onChange={e => setFilterGroup(e.target.value)}
                        className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white transition-all"
                      >
                        {allGroups.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">이름</th>
                      <th className="px-4 py-3 text-left">연령/직업</th>
                      <th className="px-4 py-3 text-left">목적</th>
                      <th className="px-4 py-3 text-center">디지털</th>
                      <th className="px-4 py-3 text-center">AI</th>
                      <th className="px-4 py-3 text-left">역량 그룹</th>
                      <th className="px-4 py-3 text-center">상세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredResponses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                          검색 결과가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredResponses.map(r => (
                        <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                          <td className="px-4 py-3 text-gray-500">{r.ageGroup} / {r.occupation}</td>
                          <td className="px-4 py-3 text-gray-500">{r.educationPurpose}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={clsx(
                              'px-2 py-0.5 rounded-lg text-xs font-semibold',
                              r.digitalScore >= 70 ? 'bg-green-100 text-green-700' :
                              r.digitalScore >= 40 ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            )}>
                              {r.digitalScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={clsx(
                              'px-2 py-0.5 rounded-lg text-xs font-semibold',
                              r.aiScore >= 60 ? 'bg-purple-100 text-purple-700' :
                              r.aiScore >= 30 ? 'bg-indigo-100 text-indigo-700' :
                              'bg-gray-100 text-gray-600'
                            )}>
                              {r.aiScore}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: (GROUP_COLORS[r.competencyGroup] || '#6366f1') + '20',
                                color: GROUP_COLORS[r.competencyGroup] || '#6366f1',
                              }}
                            >
                              {r.competencyGroup}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setSelectedResponse(r)}
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mx-auto hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                데이터 관리
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={handleLoadSamples}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  샘플 데이터 추가 불러오기
                </button>

                {showClearConfirm ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-600">모든 응답 데이터를 삭제하시겠습니까?</span>
                    <button
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      삭제 확인
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    전체 데이터 삭제
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedResponse && (
        <DetailModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Brain, ClipboardList, BarChart3, ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: ClipboardList, title: '맞춤형 사전 진단', desc: '학습자의 현재 수준을 파악하여 최적의 교육 경험을 제공합니다.' },
    { icon: Brain, title: 'AI 수준 분석', desc: 'AI 사용 경험과 디지털 친숙도를 종합적으로 분석합니다.' },
    { icon: BarChart3, title: '데이터 기반 교육 설계', desc: '응답 데이터를 바탕으로 강사가 교육 방향을 최적화합니다.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">AI 학습 준비도 설문</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI 교육 사전 진단 설문
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            AI 교육 전,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              나에게 맞는 학습 출발점
            </span>
            을 확인하세요.
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            기기 사용 수준부터 AI 경험, 배우고 싶은 목표까지 한 번에 파악하여
            <br className="hidden md:block" />
            더 정확한 맞춤형 교육을 준비합니다.
          </p>

          <button
            onClick={() => navigate('/survey')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            설문 시작하기
            <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-gray-400 mt-4">약 5~7분 소요 • 총 20문항</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 animate-slide-up">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/70 backdrop-blur rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">수집된 응답은 교육 목적으로만 활용되며, 외부에 공유되지 않습니다.</p>
        </div>
      </main>
    </div>
  );
}

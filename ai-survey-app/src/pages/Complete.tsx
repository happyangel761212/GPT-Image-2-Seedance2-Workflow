import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function Complete() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          설문이 완료되었습니다!
        </h1>

        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          소중한 응답 감사합니다.
          <br />
          응답 내용을 바탕으로 더욱 맞춤화된
          <br />
          AI 교육을 준비하겠습니다.
        </p>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center gap-3 text-blue-600 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">다음 단계 안내</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            강사가 설문 결과를 분석하여 교육 당일
            최적의 학습 경험을 제공할 예정입니다.
            교육 시작 전까지 궁금한 점이 있으시면
            담당 강사에게 문의해 주세요.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

// ────────────────────────────────────────────────
// DATA CONSTANTS
// ────────────────────────────────────────────────
const EXERCISES = [
  { id: 'walking',      name: '걷기',      emoji: '🚶‍♀️', kcalPerMin: 4  },
  { id: 'cycling',      name: '실내자전거', emoji: '🚴‍♀️', kcalPerMin: 6  },
  { id: 'pilates',      name: '필라테스',   emoji: '🧘‍♀️', kcalPerMin: 4  },
  { id: 'dance',        name: '댄스',      emoji: '💃',  kcalPerMin: 7  },
  { id: 'yoga',         name: '요가',      emoji: '🌿',  kcalPerMin: 3  },
  { id: 'strength',     name: '근력운동',   emoji: '💪',  kcalPerMin: 6  },
  { id: 'stretching',   name: '스트레칭',   emoji: '🤸‍♀️', kcalPerMin: 2  },
  { id: 'hiking',       name: '등산',      emoji: '⛰️',  kcalPerMin: 8  },
  { id: 'swimming',     name: '수영',      emoji: '🏊‍♀️', kcalPerMin: 9  },
  { id: 'running',      name: '러닝',      emoji: '🏃‍♀️', kcalPerMin: 10 },
  { id: 'stairs',       name: '계단오르기', emoji: '🪜',  kcalPerMin: 9  },
  { id: 'hometraining', name: '홈트레이닝', emoji: '🏠',  kcalPerMin: 6  },
]

const TIME_OPTIONS = [10, 20, 30, 40, 60]

const INTENSITY_OPTIONS = [
  { id: 'light',    name: '가볍게 🌸', multiplier: 0.8, bg: 'bg-green-100',  text: 'text-green-700',  ring: 'ring-green-400'  },
  { id: 'moderate', name: '보통 🌤️',  multiplier: 1.0, bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-400' },
  { id: 'hard',     name: '열심히 🔥', multiplier: 1.2, bg: 'bg-red-100',    text: 'text-red-700',    ring: 'ring-red-400'    },
]

const DIET_RECS = {
  none: {
    label: '🌙 오늘은 쉬는 날',
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-700',
    morning: '미역국 + 현미밥 소량 + 두부조림',
    lunch:   '채소 샐러드 + 삶은 달걀 2개 + 감귤',
    dinner:  '된장국 + 나물 반찬 + 잡곡밥 반공기',
    snack:   '무가당 요거트 + 견과류 소량',
  },
  light: {
    label: '🌱 가벼운 운동일',
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-700',
    morning: '그릭요거트 + 견과류 + 바나나',
    lunch:   '닭가슴살 샐러드 + 고구마 1개',
    dinner:  '두부구이 + 채소볶음 + 잡곡밥',
    snack:   '삶은 달걀 1개 + 방울토마토',
  },
  moderate: {
    label: '⚡ 보통 운동일',
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-700',
    morning: '오트밀 + 달걀 2개 + 블루베리',
    lunch:   '현미밥 + 닭가슴살구이 + 샐러드',
    dinner:  '된장찌개 + 잡곡밥 + 나물 2가지',
    snack:   '과일 + 아몬드 한 줌',
  },
  hard: {
    label: '🔥 열심히 운동한 날',
    color: 'bg-orange-50 border-orange-200',
    headerColor: 'bg-orange-100 text-orange-700',
    morning: '오트밀 + 달걀 2개 + 바나나 + 과일',
    lunch:   '현미밥 + 닭가슴살 + 나물 + 미역국',
    dinner:  '연어구이 + 샐러드 + 잡곡밥',
    snack:   '단백질 쉐이크 또는 두유 + 견과류',
  },
}

const MOTIVATIONS = [
  { text: '오늘의 작은 움직임이 내일의 변화를 만듭니다! ✨', emoji: '✨' },
  { text: '천사쌤, 오늘도 몸을 아끼며 멋지게 해냈어요! 💪', emoji: '💪' },
  { text: '완벽하지 않아도 괜찮아요. 기록한 것만으로도 성공입니다! 🌟', emoji: '🌟' },
  { text: '오늘의 10분이 건강한 습관의 시작입니다! 🌱', emoji: '🌱' },
  { text: '몸도 마음도 조금씩 가벼워지고 있어요! 🦋', emoji: '🦋' },
  { text: '운동 완료! 나를 사랑하는 멋진 선택이었어요! 💝', emoji: '💝' },
  { text: '꾸준함이 최고의 운동법이에요. 오늘도 대단해요! 🏆', emoji: '🏆' },
  { text: '건강한 나를 만들어가는 여정, 정말 멋있어요! 🌈', emoji: '🌈' },
  { text: '오늘 흘린 땀 한 방울이 내 몸을 바꾸고 있어요! 💦', emoji: '💦' },
  { text: '포기하지 않은 당신이 이미 승자예요! 🥇', emoji: '🥇' },
]

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

// ────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────
function toDateStr(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function todayStr() {
  return toDateStr(Date.now())
}

function formatKorDate() {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK_DAYS[d.getDay()]})`
}

function formatTime(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function calcCalories(exercise, duration, intensity) {
  const mult = INTENSITY_OPTIONS.find(i => i.id === intensity)?.multiplier || 1
  return Math.round(exercise.kcalPerMin * duration * mult)
}

function getStreak(records) {
  if (records.length === 0) return 0
  const days = [...new Set(records.map(r => toDateStr(r.timestamp)))].sort().reverse()
  let streak = 0
  let cur = new Date()
  cur.setHours(0, 0, 0, 0)
  for (const day of days) {
    const d = new Date(day)
    const diff = Math.round((cur - d) / 86400000)
    if (diff === 0 || diff === streak) {
      streak = diff + 1
      cur = d
    } else break
  }
  return streak
}

function getWeeklyData(records) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const dStr = toDateStr(d.getTime())
    const dayRecs = records.filter(r => toDateStr(r.timestamp) === dStr)
    result.push({
      day: WEEK_DAYS[d.getDay()],
      date: dStr,
      minutes: dayRecs.reduce((s, r) => s + r.duration, 0),
      calories: dayRecs.reduce((s, r) => s + r.calories, 0),
      isToday: i === 0,
    })
  }
  return result
}

function getDietCategory(todayRecs) {
  if (todayRecs.length === 0) return 'none'
  const maxIntensity = todayRecs.reduce((max, r) => {
    const order = { light: 1, moderate: 2, hard: 3 }
    return order[r.intensity] > order[max] ? r.intensity : max
  }, 'light')
  const totalMin = todayRecs.reduce((s, r) => s + r.duration, 0)
  if (totalMin >= 40 || maxIntensity === 'hard') return 'hard'
  if (totalMin >= 20 || maxIntensity === 'moderate') return 'moderate'
  return 'light'
}

// ────────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────────
function Toast({ message, show }) {
  if (!show) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
      <div className="bg-white border border-emerald-200 text-emerald-700 font-semibold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap">
        <span className="text-xl">🎉</span>
        <span>{message}</span>
      </div>
    </div>
  )
}

function SummaryCard({ emoji, label, value, subValue, bgColor, textColor }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm ${bgColor}`}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
      {subValue && <div className={`text-xs font-medium opacity-70 ${textColor}`}>{subValue}</div>}
      <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
    </div>
  )
}

function RecordItem({ record, onDelete }) {
  const ex = EXERCISES.find(e => e.id === record.exerciseId)
  const intOpt = INTENSITY_OPTIONS.find(i => i.id === record.intensity)
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50 animate-fade-in">
      <div className="text-2xl">{ex?.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">{ex?.name}</span>
          <span className="text-green-500 text-xs">✅</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span>{record.duration}분</span>
          <span>·</span>
          <span className={`${intOpt?.text} font-medium`}>{intOpt?.name}</span>
          <span>·</span>
          <span className="text-orange-500 font-semibold">🔥 {record.calories} kcal</span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{formatTime(record.timestamp)}</div>
      </div>
      <button
        onClick={() => onDelete(record.id)}
        className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50 flex-shrink-0"
        aria-label="삭제"
      >
        🗑️
      </button>
    </div>
  )
}

function WeeklyChart({ data, type }) {
  const isMin = type === 'minutes'
  const color = isMin ? '#86efac' : '#fca5a5'
  const label = isMin ? '분' : 'kcal'
  const maxVal = Math.max(...data.map(d => isMin ? d.minutes : d.calories), 1)

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const val = isMin ? d.minutes : d.calories
        const pct = Math.round((val / maxVal) * 100)
        return (
          <div key={d.date} className="flex items-center gap-2">
            <div className={`text-xs font-bold w-5 text-center ${d.isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
              {d.day}
            </div>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                style={{ width: `${Math.max(pct, val > 0 ? 8 : 0)}%`, backgroundColor: d.isToday ? (isMin ? '#22c55e' : '#ef4444') : color }}
              >
                {val > 0 && <span className="text-xs font-bold text-white">{val}</span>}
              </div>
            </div>
            <div className="text-xs text-gray-400 w-12 text-right">{val > 0 ? `${val}${label}` : '-'}</div>
          </div>
        )
      })}
    </div>
  )
}

function ExerciseTypeChart({ todayRecs }) {
  const counts = {}
  todayRecs.forEach(r => {
    counts[r.exerciseId] = (counts[r.exerciseId] || 0) + 1
  })
  const entries = Object.entries(counts)
  if (entries.length === 0) return (
    <div className="text-center text-gray-400 py-4 text-sm">아직 기록이 없어요 🌱</div>
  )
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([id, count]) => {
        const ex = EXERCISES.find(e => e.id === id)
        return (
          <div key={id} className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <span className="text-lg">{ex?.emoji}</span>
            <span className="text-xs font-semibold text-purple-700">{ex?.name}</span>
            <span className="bg-purple-200 text-purple-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ────────────────────────────────────────────────
// MAIN APP
// ────────────────────────────────────────────────
export default function App() {
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem('exercise-records') || '[]') }
    catch { return [] }
  })
  const [selectedEx, setSelectedEx] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedIntensity, setSelectedIntensity] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '' })
  const [motivIdx, setMotivIdx] = useState(0)
  const [showInstall, setShowInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'week' | 'diet'
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  // Persist records
  useEffect(() => {
    localStorage.setItem('exercise-records', JSON.stringify(records))
  }, [records])

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Rotate motivation
  useEffect(() => {
    const id = setInterval(() => {
      setMotivIdx(i => (i + 1) % MOTIVATIONS.length)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const showToast = useCallback((msg) => {
    setToast({ show: true, message: msg })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }, [])

  const today = todayStr()
  const todayRecs = records.filter(r => toDateStr(r.timestamp) === today)
  const totalMinToday = todayRecs.reduce((s, r) => s + r.duration, 0)
  const totalCalToday = todayRecs.reduce((s, r) => s + r.calories, 0)

  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0)
  const weekRecs = records.filter(r => new Date(r.timestamp) >= weekStart)
  const weekCal = weekRecs.reduce((s, r) => s + r.calories, 0)
  const streak = getStreak(records)
  const weeklyData = getWeeklyData(records)
  const dietCat = getDietCategory(todayRecs)
  const diet = DIET_RECS[dietCat]
  const motiv = MOTIVATIONS[motivIdx]

  const canSubmit = selectedEx && selectedTime && selectedIntensity

  function handleAddRecord() {
    if (!canSubmit) return
    const newRecord = {
      id: Date.now(),
      exerciseId: selectedEx.id,
      duration: selectedTime,
      intensity: selectedIntensity,
      calories: calcCalories(selectedEx, selectedTime, selectedIntensity),
      timestamp: Date.now(),
    }
    setRecords(prev => [newRecord, ...prev])
    showToast(`${selectedEx.emoji} ${selectedEx.name} ${selectedTime}분 완료!`)
    setMotivIdx(Math.floor(Math.random() * MOTIVATIONS.length))
    setSelectedEx(null)
    setSelectedTime(null)
    setSelectedIntensity(null)
  }

  function handleDelete(id) {
    setRecords(prev => prev.filter(r => r.id !== id))
    showToast('기록이 삭제되었어요.')
  }

  function handleReset() {
    setShowConfirmReset(false)
    setRecords([])
    showToast('모든 기록이 초기화되었어요.')
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowInstall(false)
    if (outcome === 'accepted') showToast('앱이 설치되었어요! 📱')
  }

  return (
    <div className="min-h-screen pb-20">
      <Toast message={toast.message} show={toast.show} />

      {/* Confirm Reset Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">전체 기록 초기화</h3>
            <p className="text-sm text-gray-500 text-center mb-5">모든 운동 기록이 삭제돼요. 계속할까요?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmReset(false)} className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleReset} className="flex-1 bg-red-400 text-white font-semibold py-3 rounded-2xl hover:bg-red-500 transition-colors">초기화</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-black tracking-tight">🌿 천사쌤 건강 루틴 기록장</h1>
              <p className="text-emerald-100 text-sm mt-0.5">{formatKorDate()}</p>
            </div>
            {showInstall && (
              <button onClick={handleInstall} className="bg-white/20 backdrop-blur text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 hover:bg-white/30 transition-colors flex-shrink-0">
                📱 앱 설치
              </button>
            )}
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 mt-3">
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              {motiv.text}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">

        {/* Summary Cards */}
        <div className="card mb-4 bg-white/90 backdrop-blur">
          <h2 className="text-sm font-bold text-gray-500 mb-3">📊 오늘의 요약</h2>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <SummaryCard emoji="🏃‍♀️" label="운동 횟수" value={`${todayRecs.length}회`} bgColor="bg-emerald-50" textColor="text-emerald-600" />
            <SummaryCard emoji="⏱️" label="총 운동 시간" value={`${totalMinToday}분`} bgColor="bg-blue-50" textColor="text-blue-600" />
            <SummaryCard emoji="🔥" label="소모 칼로리" value={`${totalCalToday}`} subValue="kcal" bgColor="bg-orange-50" textColor="text-orange-600" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SummaryCard emoji="📅" label="이번 주 누적" value={`${weekCal}`} subValue="kcal" bgColor="bg-purple-50" textColor="text-purple-600" />
            <SummaryCard emoji="🔥" label="연속 운동일" value={`${streak}일`} bgColor="bg-pink-50" textColor="text-pink-600" />
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-4 bg-white/80 backdrop-blur rounded-2xl p-1.5 shadow-sm">
          {[['today','🏋️ 운동 기록'],['week','📈 주간 통계'],['diet','🥗 식단 추천']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-emerald-400 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB: Today */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {/* Exercise Logger */}
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-3">🏃‍♀️ 운동 종목 선택</h2>
              <div className="grid grid-cols-3 gap-2">
                {EXERCISES.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedEx(prev => prev?.id === ex.id ? null : ex)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 transition-all duration-200 active:scale-95 ${
                      selectedEx?.id === ex.id
                        ? 'border-emerald-400 bg-emerald-50 shadow-md scale-105'
                        : 'border-gray-100 bg-gray-50 hover:border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="text-2xl">{ex.emoji}</span>
                    <span className={`text-xs font-semibold ${selectedEx?.id === ex.id ? 'text-emerald-700' : 'text-gray-600'}`}>{ex.name}</span>
                    <span className="text-xs text-gray-400">{ex.kcalPerMin}kcal/분</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time + Intensity (show when exercise selected) */}
            {selectedEx && (
              <div className="card animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{selectedEx.emoji}</span>
                  <span className="font-bold text-gray-700">{selectedEx.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{selectedEx.kcalPerMin}kcal/분</span>
                </div>

                <h3 className="text-sm font-bold text-gray-500 mb-2">⏱️ 운동 시간</h3>
                <div className="flex gap-2 mb-4">
                  {TIME_OPTIONS.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(prev => prev === t ? null : t)}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 active:scale-95 ${
                        selectedTime === t
                          ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm scale-105'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200'
                      }`}
                    >
                      {t}분
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-500 mb-2">💪 운동 강도</h3>
                <div className="flex gap-2 mb-4">
                  {INTENSITY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedIntensity(prev => prev === opt.id ? null : opt.id)}
                      className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 active:scale-95 ${
                        selectedIntensity === opt.id
                          ? `border-current ${opt.bg} ${opt.text} shadow-sm scale-105`
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>

                {/* Calorie preview */}
                {selectedTime && selectedIntensity && (
                  <div className="bg-orange-50 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
                    <span className="text-sm text-orange-600 font-medium">예상 소모 칼로리</span>
                    <span className="text-xl font-black text-orange-500">🔥 {calcCalories(selectedEx, selectedTime, selectedIntensity)} kcal</span>
                  </div>
                )}

                <button
                  onClick={handleAddRecord}
                  disabled={!canSubmit}
                  className={`w-full py-4 rounded-2xl text-base font-black transition-all duration-200 active:scale-95 ${
                    canSubmit
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canSubmit ? '✅ 운동 완료 기록하기!' : '시간과 강도를 선택해주세요'}
                </button>
              </div>
            )}

            {/* Today's Records */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-500">📋 오늘의 운동 기록 ({todayRecs.length})</h2>
                {records.length > 0 && (
                  <button onClick={() => setShowConfirmReset(true)} className="text-xs text-red-400 hover:text-red-500 font-medium">전체 초기화</button>
                )}
              </div>
              {todayRecs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🌸</div>
                  <p className="text-gray-400 text-sm">아직 기록이 없어요.</p>
                  <p className="text-gray-400 text-sm">오늘의 첫 운동을 기록해보세요!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayRecs.map(r => (
                    <RecordItem key={r.id} record={r} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>

            {/* Motivation Card */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-5 text-center">
              <div className="text-3xl mb-2">{motiv.emoji}</div>
              <p className="text-purple-700 font-semibold text-sm leading-relaxed">{motiv.text}</p>
              <div className="flex justify-center gap-1 mt-3">
                {MOTIVATIONS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === motivIdx ? 'bg-purple-500' : 'bg-purple-200'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Week */}
        {activeTab === 'week' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-4">⏱️ 최근 7일 운동 시간 (분)</h2>
              <WeeklyChart data={weeklyData} type="minutes" />
            </div>
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-4">🔥 최근 7일 소모 칼로리</h2>
              <WeeklyChart data={weeklyData} type="calories" />
            </div>
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-3">🏃‍♀️ 오늘 운동한 종목</h2>
              <ExerciseTypeChart todayRecs={todayRecs} />
            </div>
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-3">📊 이번 주 통계</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-emerald-600">{weekRecs.length}회</div>
                  <div className="text-xs text-gray-500 mt-1">총 운동 횟수</div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-blue-600">{weekRecs.reduce((s,r)=>s+r.duration,0)}분</div>
                  <div className="text-xs text-gray-500 mt-1">총 운동 시간</div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-orange-600">{weekCal}</div>
                  <div className="text-xs text-gray-500 mt-1">총 소모 칼로리 (kcal)</div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black text-pink-600">{streak}일</div>
                  <div className="text-xs text-gray-500 mt-1">연속 운동일</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Diet */}
        {activeTab === 'diet' && (
          <div className="space-y-4">
            <div className={`card border-2 ${diet.color}`}>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${diet.headerColor}`}>
                {diet.label}
              </div>
              <p className="text-xs text-gray-400 mb-4">⚠️ 일반적인 건강 식단 참고용이며, 의학적 진단이 아닙니다.</p>
              <div className="space-y-3">
                {[
                  { meal: '🌅 아침', content: diet.morning },
                  { meal: '☀️ 점심', content: diet.lunch },
                  { meal: '🌙 저녁', content: diet.dinner },
                  { meal: '🍎 간식', content: diet.snack },
                ].map(({ meal, content }) => (
                  <div key={meal} className="bg-white rounded-2xl p-3 flex gap-3 items-start shadow-sm">
                    <span className="font-bold text-sm text-gray-600 w-14 flex-shrink-0">{meal}</span>
                    <span className="text-sm text-gray-700 leading-relaxed">{content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All categories for reference */}
            <div className="card">
              <h2 className="text-sm font-bold text-gray-500 mb-3">📚 상황별 식단 가이드</h2>
              <div className="space-y-2">
                {Object.entries(DIET_RECS).map(([key, d]) => (
                  <div key={key} className={`rounded-2xl p-3 border ${d.color} ${dietCat === key ? 'ring-2 ring-emerald-300' : 'opacity-70'}`}>
                    <div className={`text-xs font-bold mb-1 ${d.headerColor.split(' ')[1]}`}>
                      {d.label} {dietCat === key && '← 현재'}
                    </div>
                    <div className="text-xs text-gray-600">아침: {d.morning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-gray-100 px-4 py-6">
        <div className="max-w-lg mx-auto text-center space-y-1">
          <div className="text-sm font-bold text-gray-700">🌿 AINEXTEDU 천사쌤</div>
          <div className="text-sm text-gray-500">📞 010-9543-7780</div>
          <a
            href="https://www.ainextedu.co.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-emerald-500 hover:text-emerald-600 font-medium underline underline-offset-2 transition-colors"
          >
            🔗 www.ainextedu.co.kr
          </a>
          <div className="text-xs text-gray-300 pt-2">건강한 하루를 응원합니다 💚</div>
        </div>
      </footer>
    </div>
  )
}

interface Props {
  selected: string[]
  bioMedText: string
  onToggle: (value: string) => void
  onBioMedTextChange: (text: string) => void
  onConfirm: () => void
}

const MEDICATIONS = [
  { id: '메살라진', label: '1. 메살라진', sub: '5-ASA 계열 (아사콜, 펜타사 등)' },
  { id: '스테로이드', label: '2. 스테로이드', sub: '프레드니솔론, 부데소니드 등' },
  { id: '면역조절제', label: '3. 면역조절제', sub: '아자치오프린, 6-MP 등' },
]

export default function MedicationCheckboxes({
  selected,
  bioMedText,
  onToggle,
  onBioMedTextChange,
  onConfirm,
}: Props) {
  const isBioSelected = selected.includes('생물학적 제제')
  const hasSelection = selected.length > 0

  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">R</span>
      </div>
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-gray-800 leading-relaxed mb-3">
          현재 투약 중인 약물을 모두 선택해주세요.
          <span className="text-gray-400 text-xs block mt-0.5">영양식 성분과의 상호작용 확인에 활용됩니다.</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {MEDICATIONS.map((med) => {
            const checked = selected.includes(med.id)
            return (
              <button
                key={med.id}
                onClick={() => onToggle(med.id)}
                className={`text-left p-3 rounded-xl border-2 transition-colors ${
                  checked ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border-2 ${
                    checked ? 'bg-green-600 border-green-600' : 'border-gray-300'
                  }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{med.label}</div>
                    <div className="text-xs text-gray-500">{med.sub}</div>
                  </div>
                </div>
              </button>
            )
          })}

          <button
            onClick={() => onToggle('생물학적 제제')}
            className={`text-left p-3 rounded-xl border-2 transition-colors ${
              isBioSelected ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`w-5 h-5 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border-2 ${
                isBioSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}>
                {isBioSelected && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">4. 생물학적 제제<br/>/ 소분자제제</div>
                {isBioSelected && (
                  <input
                    className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    placeholder="직접 입력 (예: 휴미라, 젤잔즈)"
                    value={bioMedText}
                    onChange={(e) => onBioMedTextChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => onToggle('없음')}
          className={`mt-2 w-full text-left p-2.5 rounded-xl border-2 border-dashed transition-colors text-sm ${
            selected.includes('없음') ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 text-gray-500 hover:border-green-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${
              selected.includes('없음') ? 'bg-green-600 border-green-600' : 'border-gray-300'
            }`}>
              {selected.includes('없음') && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            현재 투약 중인 약물 없음
          </div>
        </button>

        {hasSelection && (
          <button
            onClick={onConfirm}
            className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
          >
            확인
          </button>
        )}
      </div>
    </div>
  )
}

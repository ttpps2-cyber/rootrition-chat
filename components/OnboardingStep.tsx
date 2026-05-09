interface Props {
  question: string
  options: { label: string; value: string }[]
  multiSelect?: boolean
  selected: string[]
  onSelect: (value: string) => void
  onConfirm?: () => void
}

export default function OnboardingStep({
  question,
  options,
  multiSelect = false,
  selected,
  onSelect,
  onConfirm,
}: Props) {
  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">R</span>
      </div>
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-gray-800 leading-relaxed mb-2">
          {question}
        </div>
        <div className="flex flex-wrap gap-2 ml-0">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  isSelected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700 border-green-600 hover:bg-green-50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {multiSelect && selected.length > 0 && onConfirm && (
          <button
            onClick={onConfirm}
            className="mt-2 ml-0 px-4 py-1.5 bg-green-600 text-white rounded-full text-sm hover:bg-green-700"
          >
            확인
          </button>
        )}
      </div>
    </div>
  )
}

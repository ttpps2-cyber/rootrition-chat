import { SkuRecommendation, SkuName } from '@/types/chat'

const SKU_INFO: Record<SkuName, { description: string; keyIngredient: string }> = {
  'UC': {
    description: '궤양성 대장염 관해 유지에 임상 근거가 보고된 바 있는 CGMP 주력 처방입니다.',
    keyIngredient: 'CGMP 30g/일',
  },
  'CD Active': {
    description: '크론병 활동기 영양 지원을 위한 세미엘리멘탈 처방입니다. 가수분해 유청 단백질이 주요 단백질 공급원입니다.',
    keyIngredient: '가수분해 유청 9.3~30g/일',
  },
  'Remission': {
    description: '관해기 유지를 위한 폴리머릭 처방입니다. 락토페린과 프리바이오틱스 혼합물이 포함됩니다.',
    keyIngredient: '락토페린 1g/일, SC-GOS:LC-FOS',
  },
  'Pediatric': {
    description: '소아·청소년 IBD 환자를 위한 BLG 저감 처방입니다. CDED+PEN 프로토콜을 지원합니다.',
    keyIngredient: 'BLG 저감, PEN Step-down',
  },
  'Sarcopenia+': {
    description: '근감소 동반 IBD 환자를 위한 BCAA 강화 처방입니다.',
    keyIngredient: 'BCAA 강화, 단백질 1.2~1.5g/kg',
  },
}

interface Props {
  recommendation: SkuRecommendation
}

export default function SkuCard({ recommendation }: Props) {
  const primary = SKU_INFO[recommendation.primary]
  const secondary = recommendation.secondary ? SKU_INFO[recommendation.secondary] : null

  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">R</span>
      </div>
      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-gray-800 leading-relaxed mb-2">
          프로필에 맞는 루트리션 영양식을 안내드립니다.
        </div>
        <div className="border-2 border-green-600 rounded-xl p-3 bg-white">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-bold text-green-700">{recommendation.primary} SKU</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">추천</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{primary.description}</p>
          <p className="text-xs text-gray-400 mt-1">핵심 성분: {primary.keyIngredient}</p>
        </div>
        {secondary && (
          <div className="border border-orange-300 rounded-xl p-3 bg-orange-50 mt-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-orange-700">{recommendation.secondary} SKU</span>
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded">병기 추천</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{secondary.description}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
          담당 의료진과 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  )
}

import { UserProfile, SkuRecommendation, SkuName } from '../types/chat'

export function routeToSku(profile: UserProfile): SkuRecommendation {
  let primary: SkuName

  if (profile.ageGroup === 'pediatric') {
    primary = 'Pediatric'
  } else if (profile.disease === 'UC' && profile.status === 'active') {
    primary = 'UC'
  } else if (profile.disease === 'CD' && profile.status === 'active') {
    primary = 'CD Active'
  } else if (profile.disease === 'unknown' && profile.status === 'active') {
    primary = 'CD Active'
  } else {
    primary = 'Remission'
  }

  const secondary: SkuName | undefined = profile.concerns.includes('체중·근육량 감소')
    ? 'Sarcopenia+'
    : undefined

  return { primary, secondary }
}

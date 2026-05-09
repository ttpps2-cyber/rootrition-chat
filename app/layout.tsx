import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IBD 맞춤 영양 상담 — 루트리션',
  description: 'IBD(염증성 장질환) 환자를 위한 루트리션 맞춤 영양 상담',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="h-full flex flex-col">
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
        <footer className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-400 text-center leading-relaxed">
          본 콘텐츠는 일반적 영양 정보 제공을 목적으로 하며, 의학적 진단·치료를 대체하지 않습니다.
          개인의 질환 상태에 따른 식이는 반드시 담당 의료진과 상담하시기 바랍니다.
        </footer>
      </body>
    </html>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">페이지를 찾을 수 없습니다</h2>
          <p className="text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>또는 다음 페이지를 방문해보세요:</p>
            <div className="mt-2 space-x-4">
              <Link href="/games/g1" className="text-blue-600 hover:underline">
                BlackSwan 게임
              </Link>
              <Link href="/games/g2" className="text-blue-600 hover:underline">
                Prisoner's Dilemma
              </Link>
              <Link href="/games/g3" className="text-blue-600 hover:underline">
                Signal Decoding
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
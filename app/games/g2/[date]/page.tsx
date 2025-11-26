import { Suspense } from "react"
import DateQuizClient from "./client-page"

export const dynamicParams = false

export async function generateStaticParams() {
  return [{ date: '20250101' }]
}

export default async function DateQuizPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DateQuizClient date={date} />
    </Suspense>
  )
}

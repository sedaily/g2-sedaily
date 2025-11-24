import { Suspense } from "react"
import DateQuizClient from "./client-page"
import { getAvailableDates } from "@/lib/games-data"

export async function generateStaticParams() {
  try {
    const dates = await getAvailableDates("SignalDecoding")
    return dates.map((date) => ({
      date: date.replace(/-/g, ''),
    }))
  } catch {
    return []
  }
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

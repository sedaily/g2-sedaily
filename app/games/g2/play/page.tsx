import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ClientPage from "./client-page"

export default function G2TestPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ClientPage />
    </Suspense>
  )
}

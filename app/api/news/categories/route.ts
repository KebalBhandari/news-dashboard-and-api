import { type NextRequest, NextResponse } from "next/server"
import { CATEGORIES, COUNTRIES, LANGUAGES } from "@/lib/types"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      categories: CATEGORIES,
      countries: COUNTRIES,
      languages: LANGUAGES,
    },
  })
}

import { http } from "@/api/http";
import type { QuoteCalculateRequest, QuoteCalculateResponse } from "@/types/quote";

export async function calculateQuote(payload: QuoteCalculateRequest) {
  const response = await http.post<QuoteCalculateResponse>("/quotes/calculate", payload);
  return response.data;
}

import { http } from "@/api/http";

export interface HealthResponse {
  status: string;
  service: string;
}

export async function getHealth() {
  const response = await http.get<HealthResponse>("/health");
  return response.data;
}

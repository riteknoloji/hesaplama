import { useQuery } from "@tanstack/react-query";

export interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  previousRate?: number;
  change?: number;
  changePercent?: number;
}

async function fetchCurrencyRates(): Promise<ExchangeRate[]> {
  const response = await fetch("/api/currency-rates");
  
  if (!response.ok) {
    throw new Error("Failed to fetch currency rates");
  }

  return response.json();
}

export function useCurrencyRates() {
  return useQuery({
    queryKey: ["/api/currency-rates"],
    queryFn: fetchCurrencyRates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 3,
  });
}

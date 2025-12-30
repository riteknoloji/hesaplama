import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export interface ExchangeRate {
  code: string;
  name: string;
  buyRate: number;
  sellRate: number;
  previousBuyRate?: number;
  previousSellRate?: number;
  buyChange?: number;
  sellChange?: number;
  buyChangePercent?: number;
  sellChangePercent?: number;
}

const MIN_REFETCH_INTERVAL = 15000; // 15 saniye minimum bekleme
let lastFetchTime = 0;

async function fetchCurrencyRates(): Promise<ExchangeRate[]> {
  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;
  
  // Eğer son çekimden beri 15 saniye geçmediyse bekle
  if (lastFetchTime > 0 && timeSinceLastFetch < MIN_REFETCH_INTERVAL) {
    const remainingTime = Math.ceil((MIN_REFETCH_INTERVAL - timeSinceLastFetch) / 1000);
    throw new Error(`Lütfen ${remainingTime} saniye bekleyin`);
  }
  
  const apiBase = (import.meta.env?.VITE_API_URL as string) || "";
  const url = `${apiBase}/api/currency-rates`.replace(/([^:]\/)\/+/, "$1");
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch currency rates");
  }

  lastFetchTime = now;
  return response.json();
}

export function useCurrencyRates() {
  const prevRef = useRef<ExchangeRate[] | undefined>(undefined);

  return useQuery({
    queryKey: ["currency-rates"],
    queryFn: fetchCurrencyRates,
    staleTime: MIN_REFETCH_INTERVAL,
    gcTime: MIN_REFETCH_INTERVAL,
    refetchOnWindowFocus: true, // Pencere tekrar odaklandığında yenile
    refetchOnMount: true, // Komponent mount olduğunda yenile
    retry: 1,
    retryDelay: 3000,
    // enrich data with change and changePercent computed from previous poll
    select(data: ExchangeRate[]) {
      const prev = prevRef.current;
      const transformed = data.map((r) => {
        const prevItem = prev?.find((p) => p.code === r.code);
        let buyChange = 0;
        let sellChange = 0;
        let buyChangePercent = 0;
        let sellChangePercent = 0;
        if (prevItem) {
          if (typeof prevItem.buyRate === "number" && prevItem.buyRate !== 0) {
            buyChange = r.buyRate - prevItem.buyRate;
            buyChangePercent = (buyChange / prevItem.buyRate) * 100;
          }
          if (typeof prevItem.sellRate === "number" && prevItem.sellRate !== 0) {
            sellChange = r.sellRate - prevItem.sellRate;
            sellChangePercent = (sellChange / prevItem.sellRate) * 100;
          }
        }
        return { 
          ...r, 
          buyChange, 
          sellChange, 
          buyChangePercent, 
          sellChangePercent 
        } as ExchangeRate & { 
          buyChange: number; 
          sellChange: number; 
          buyChangePercent: number; 
          sellChangePercent: number; 
        };
      });
      // store raw data for next comparison
      prevRef.current = data.map((d) => ({ 
        code: d.code, 
        name: d.name, 
        buyRate: d.buyRate, 
        sellRate: d.sellRate 
      }));
      return transformed as unknown as ExchangeRate[];
    },
  });
}

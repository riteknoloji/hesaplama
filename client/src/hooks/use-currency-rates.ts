import { useQuery } from "@tanstack/react-query";

export interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  previousRate?: number;
  change?: number;
  changePercent?: number;
}

const CURRENCIES = [
  { code: "USD", name: "Amerikan Doları", series: "TP.DK.USD" },
  { code: "EUR", name: "Euro", series: "TP.DK.EUR" },
  { code: "GBP", name: "İngiliz Sterlini", series: "TP.DK.GBP" },
  { code: "JPY", name: "Japon Yeni", series: "TP.DK.JPY" },
  { code: "CHF", name: "İsviçre Frangı", series: "TP.DK.CHF" },
];

async function fetchCurrencyRates(): Promise<ExchangeRate[]> {
  const apiKey = import.meta.env.VITE_TCMB_API_KEY;
  
  if (!apiKey) {
    throw new Error("TCMB API key not configured");
  }

  try {
    const rates: ExchangeRate[] = [];

    // Fetch rates for each currency in parallel
    const promises = CURRENCIES.map(async (currency) => {
      try {
        // Using TCMB EVDS API endpoint
        const url = new URL("https://evds2.tcmb.gov.tr/service/getdata");
        url.searchParams.append("series", currency.series);
        url.searchParams.append("type", "json");
        url.searchParams.append("key", apiKey);
        url.searchParams.append("startDate", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 7 days
        url.searchParams.append("endDate", new Date().toISOString().split('T')[0]); // Today

        const response = await fetch(url.toString());
        const data = await response.json();

        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const items = data.data.sort((a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
          
          const currentValue = parseFloat(items[0][1]);
          const previousValue = items.length > 1 ? parseFloat(items[1][1]) : currentValue;
          const change = currentValue - previousValue;
          const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

          rates.push({
            code: currency.code,
            name: currency.name,
            rate: currentValue,
            previousRate: previousValue,
            change: change,
            changePercent: changePercent,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${currency.code}:`, error);
      }
    });

    await Promise.all(promises);
    return rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    throw error;
  }
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

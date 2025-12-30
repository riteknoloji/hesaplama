import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

interface ExchangeRate {
  code: string;
  name: string;
  buyRate: number;
  sellRate: number;
}

const CURRENCIES = [
  { code: "USD", name: "Amerikan Doları" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "İngiliz Sterlini" },
  { code: "JPY", name: "Japon Yeni" },
  { code: "CHF", name: "İsviçre Frangı" },
];

async function fetchCurrencyRates(): Promise<ExchangeRate[]> {
  const rates: ExchangeRate[] = [];

  // Try EVDS (TCMB) first if API key is available
  const evdsKey = process.env.TCMB_EVDS_KEY || "YnOXno3Zwp";
  const EVDS_SERIES_BUY: Record<string, string> = {
    USD: "TP.DK.USD.A",
    EUR: "TP.DK.EUR.A",
    GBP: "TP.DK.GBP.A",
    JPY: "TP.DK.JPY.A",
    CHF: "TP.DK.CHF.A",
  };
  const EVDS_SERIES_SELL: Record<string, string> = {
    USD: "TP.DK.USD.S",
    EUR: "TP.DK.EUR.S",
    GBP: "TP.DK.GBP.S",
    JPY: "TP.DK.JPY.S",
    CHF: "TP.DK.CHF.S",
  };

  try {
    if (evdsKey) {
      try {
        const seriesBuy = Object.values(EVDS_SERIES_BUY).join(",");
        const seriesSell = Object.values(EVDS_SERIES_SELL).join(",");
        const allSeries = `${seriesBuy},${seriesSell}`;
        const today = new Date().toISOString().slice(0, 10);
        const url = `https://evds2.tcmb.gov.tr/service/evds/series=${allSeries}&startDate=${today}&endDate=${today}&type=json&key=${evdsKey}`;
        
        console.log(`🔍 Trying TCMB EVDS API for date: ${today}`);
        const resp = await fetch(url);
        
        if (!resp.ok) {
          console.warn(`⚠ EVDS request failed, status: ${resp.status}, statusText: ${resp.statusText}`);
          const errorText = await resp.text().catch(() => "Unable to read error response");
          console.warn(`⚠ EVDS Error body: ${errorText.substring(0, 500)}`);
        } else {
          const data = await resp.json();
          console.log(`📦 EVDS response received, checking data...`);
          // EVDS can return different shapes; prefer `items` array if present
          const items = (data && (data.items || data.Items || data.data || data.Data)) as any[] | undefined;
          if (Array.isArray(items) && items.length > 0) {
            console.log(`✅ Found ${items.length} data points in EVDS response`);
            const latest = items[items.length - 1];
            for (const currency of CURRENCIES) {
              const buySeriesKey = EVDS_SERIES_BUY[currency.code];
              const sellSeriesKey = EVDS_SERIES_SELL[currency.code];
              const buyRaw = latest && latest[buySeriesKey];
              const sellRaw = latest && latest[sellSeriesKey];
              const buyParsed = parseFloat(buyRaw);
              const sellParsed = parseFloat(sellRaw);
              if (!isNaN(buyParsed) && buyParsed > 0 && !isNaN(sellParsed) && sellParsed > 0) {
                rates.push({ 
                  code: currency.code, 
                  name: currency.name, 
                  buyRate: buyParsed, 
                  sellRate: sellParsed 
                });
                console.log(`✓ ${currency.code} from EVDS - Alış: ${buyParsed.toFixed(4)} TRY, Satış: ${sellParsed.toFixed(4)} TRY`);
              } else {
                console.warn(`⚠ ${currency.code} data invalid or missing in EVDS`);
              }
            }
            if (rates.length > 0) {
              console.log(`✅ Successfully fetched ${rates.length} rates from EVDS`);
              return rates;
            }
          } else {
            console.warn(`⚠ No items array found in EVDS response`);
          }
          // Fallback: some EVDS responses include series keyed objects
          if (data && data.series) {
            for (const currency of CURRENCIES) {
              const buySeriesKey = EVDS_SERIES_BUY[currency.code];
              const sellSeriesKey = EVDS_SERIES_SELL[currency.code];
              const buySeriesObj = data.series[buySeriesKey];
              const sellSeriesObj = data.series[sellSeriesKey];
              const buyLastItem = buySeriesObj && buySeriesObj[buySeriesObj.length - 1];
              const sellLastItem = sellSeriesObj && sellSeriesObj[sellSeriesObj.length - 1];
              const buyVal = buyLastItem && buyLastItem.value;
              const sellVal = sellLastItem && sellLastItem.value;
              const buyParsed = parseFloat(buyVal);
              const sellParsed = parseFloat(sellVal);
              if (!isNaN(buyParsed) && buyParsed > 0 && !isNaN(sellParsed) && sellParsed > 0) {
                rates.push({ 
                  code: currency.code, 
                  name: currency.name, 
                  buyRate: buyParsed, 
                  sellRate: sellParsed 
                });
                console.log(`✓ ${currency.code} from EVDS(series) - Alış: ${buyParsed.toFixed(4)} TRY, Satış: ${sellParsed.toFixed(4)} TRY`);
              }
            }
            if (rates.length > 0) return rates;
          }
        }
      } catch (evdsErr) {
        console.error("❌ EVDS fetch failed:", evdsErr instanceof Error ? evdsErr.message : String(evdsErr));
      }
    }

    // Fallback to public exchangerate-api if EVDS not available or failed
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/TRY");
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    console.log("Real exchange rates fetched from exchangerate-api.com (fallback)");
    if (!data?.rates) {
      throw new Error("No rates data in response");
    }
    
    // Convert rates: API gives TRY to currency, we need currency to TRY (invert)
    // For fallback, we'll use the same rate for buy and sell with a realistic spread
    for (const currency of CURRENCIES) {
      // Skip precious metals in fallback as they're not available
      if (['XAU', 'XAG', 'XPT', 'XPD'].includes(currency.code)) {
        console.warn(`⚠ ${currency.code} not available in fallback API, skipping`);
        continue;
      }
      
      const tryToForeign = data.rates[currency.code];
      if (tryToForeign && tryToForeign > 0) {
        const foreignToTry = 1 / tryToForeign; // Invert to get currency to TRY
        const spread = foreignToTry * 0.003; // 0.3% spread for buy/sell (realistic)
        rates.push({ 
          code: currency.code, 
          name: currency.name, 
          buyRate: foreignToTry - spread, 
          sellRate: foreignToTry + spread 
        });
        console.log(`✓ ${currency.code} - Alış: ${(foreignToTry - spread).toFixed(4)} TRY, Satış: ${(foreignToTry + spread).toFixed(4)} TRY`);
      }
    }

    if (rates.length === 0) {
      throw new Error("No valid rates extracted");
    }
    return rates;
  } catch (error) {
    console.error("Failed to fetch currency rates:", error);
    throw error; // Re-throw to show error to client
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post(api.calculations.create.path, async (req, res) => {
    try {
      const input = api.calculations.create.input.parse(req.body);
      const calculation = await storage.createCalculation(input);
      res.status(201).json(calculation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.calculations.list.path, async (req, res) => {
    const list = await storage.getCalculations();
    res.json(list);
  });

  // Currency rates endpoint - REAL DATA ONLY
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const rates = await fetchCurrencyRates();
      res.setHeader("Cache-Control", "no-store");
      res.json(rates);
    } catch (error) {
      console.error("Error in /api/currency-rates:", error);
      res.status(500).json({ 
        error: "Kurlar yüklenemedi. Lütfen daha sonra tekrar deneyin.",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}

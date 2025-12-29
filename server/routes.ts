import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
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

  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/TRY");

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log("Real exchange rates fetched from exchangerate-api.com");

    if (!data?.rates) {
      throw new Error("No rates data in response");
    }

    // Convert rates: API gives TRY to currency, we need currency to TRY (invert)
    for (const currency of CURRENCIES) {
      const tryToForeign = data.rates[currency.code];
      if (tryToForeign && tryToForeign > 0) {
        const foreignToTry = 1 / tryToForeign; // Invert to get currency to TRY
        rates.push({
          code: currency.code,
          name: currency.name,
          rate: foreignToTry,
        });
        console.log(`✓ ${currency.code}: ${foreignToTry.toFixed(2)} TRY`);
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

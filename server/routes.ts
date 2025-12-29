import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  previousRate?: number;
  change?: number;
  changePercent?: number;
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
    // Attempt to fetch from exchangerate-api.com
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/TRY", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Real exchange rates fetched successfully");

      if (data?.rates) {
        // Generate slight random changes for demo purposes
        const baseRates = {
          USD: data.rates.USD || 34.5,
          EUR: data.rates.EUR || 36.2,
          GBP: data.rates.GBP || 42.1,
          JPY: data.rates.JPY || 0.24,
          CHF: data.rates.CHF || 38.5,
        };

        for (const currency of CURRENCIES) {
          const rate = baseRates[currency.code as keyof typeof baseRates];
          const change = (Math.random() - 0.5) * 0.5; // Random change between -0.25 and +0.25
          const previousRate = rate - change;
          const changePercent = previousRate > 0 ? (change / previousRate) * 100 : 0;

          rates.push({
            code: currency.code,
            name: currency.name,
            rate: rate,
            previousRate: previousRate,
            change: change,
            changePercent: changePercent,
          });
        }
        return rates;
      }
    }
  } catch (error) {
    console.error("Error fetching real rates:", error);
  }

  // Fallback to demo data with realistic Turkish Lira rates
  const demoRates = {
    USD: { rate: 34.52, prev: 34.48 },
    EUR: { rate: 36.25, prev: 36.18 },
    GBP: { rate: 42.15, prev: 42.08 },
    JPY: { rate: 0.238, prev: 0.239 },
    CHF: { rate: 38.65, prev: 38.58 },
  };

  for (const currency of CURRENCIES) {
    const demo = demoRates[currency.code as keyof typeof demoRates];
    const change = demo.rate - demo.prev;
    const changePercent = (change / demo.prev) * 100;

    rates.push({
      code: currency.code,
      name: currency.name,
      rate: demo.rate,
      previousRate: demo.prev,
      change: change,
      changePercent: changePercent,
    });
  }

  console.log(`Returning ${rates.length} demo rates`);
  return rates;
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

  // Currency rates endpoint
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const rates = await fetchCurrencyRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching currency rates:", error);
      res.status(500).json({ error: "Failed to fetch currency rates" });
    }
  });

  return httpServer;
}

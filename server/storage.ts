import { calculations, type Calculation, type InsertCalculation } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  getCalculations(): Promise<Calculation[]>;
}

export class DatabaseStorage implements IStorage {
  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const [calculation] = await db
      .insert(calculations)
      .values(insertCalculation)
      .returning();
    return calculation;
  }

  async getCalculations(): Promise<Calculation[]> {
    return await db.select().from(calculations).orderBy(calculations.createdAt);
  }
}

export const storage = new DatabaseStorage();

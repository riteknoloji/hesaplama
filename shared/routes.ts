import { z } from 'zod';
import { insertCalculationSchema, calculations } from './schema';

export const api = {
  calculations: {
    create: {
      method: 'POST' as const,
      path: '/api/calculations',
      input: insertCalculationSchema,
      responses: {
        201: z.custom<typeof calculations.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/calculations',
      responses: {
        200: z.array(z.custom<typeof calculations.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

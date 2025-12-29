import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCalculation } from "@shared/routes";

// GET /api/calculations
export function useCalculations() {
  return useQuery({
    queryKey: [api.calculations.list.path],
    queryFn: async () => {
      const res = await fetch(api.calculations.list.path);
      if (!res.ok) throw new Error("Hesaplamalar alınamadı");
      return api.calculations.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/calculations
export function useCreateCalculation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCalculation) => {
      const validated = api.calculations.create.input.parse(data);
      const res = await fetch(api.calculations.create.path, {
        method: api.calculations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      if (!res.ok) throw new Error("Hesaplama kaydedilemedi");
      return api.calculations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.calculations.list.path] });
    },
  });
}

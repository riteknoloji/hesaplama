// Helper functions for formatting numbers and converting to Turkish text

export function formatCurrency(value: string | number): string {
  if (value === "" || value === undefined || value === null) return "";
  
  // Convert to string and handle decimals
  let valStr = String(value).replace(/\./g, "").replace(",", ".");
  let num = parseFloat(valStr);
  
  if (isNaN(num)) return "";

  // Format with dots for thousands and comma for decimal
  // Using 'tr-TR' locale logic manually to match the specific requirement of the prompt
  // Prompt implies: 1.000,00 format
  
  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

export function parseFormattedCurrency(value: string): number {
  if (!value) return 0;
  // Remove dots (thousands separator) and replace comma with dot (decimal separator)
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

export const numberToTurkish = (inputAmount: number): string => {
  const birler = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
  const onlar = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];
  const binler = ["", "Bin", "Milyon", "Milyar", "Trilyon"];

  const formatGroup = (n: number) => {
    let s = "";
    if (n >= 100) {
      if (Math.floor(n / 100) > 1) s += birler[Math.floor(n / 100)] + " ";
      s += "Yüz ";
      n %= 100;
    }
    if (n >= 10) {
      s += onlar[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      s += birler[n] + " ";
    }
    return s.trim();
  };

  const [integerPart, decimalPart] = inputAmount.toFixed(2).split(".");
  let num = parseInt(integerPart, 10);
  
  if (num === 0) return "Sıfır TL";

  let result = "";
  let groupIndex = 0;

  while (num > 0) {
    const group = num % 1000;
    if (group > 0) {
      let groupStr = formatGroup(group);
      if (groupIndex === 1 && group === 1) groupStr = ""; // Special case for "Bin" (not "Bir Bin")
      
      const suffix = binler[groupIndex] ? " " + binler[groupIndex] : "";
      result = groupStr + suffix + " " + result;
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }

  result = result.trim() + " TL";

  if (parseInt(decimalPart) > 0) {
    result += " " + formatGroup(parseInt(decimalPart)) + " Kuruş";
  }

  return result.trim();
};

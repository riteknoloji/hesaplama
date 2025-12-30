import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRate } from "@/hooks/use-currency-rates";

interface CurrencyConverterProps {
  rates: ExchangeRate[];
  amount: number;
  onAmountChange: (amount: number) => void;
}

export function CurrencyConverter({ rates, amount, onAmountChange }: CurrencyConverterProps) {
  const [amountStr, setAmountStr] = useState<string>(String(amount));
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [result, setResult] = useState<number>(0);
  const [useType, setUseType] = useState<"buy" | "sell">("sell");

  useEffect(() => {
    setAmountStr(String(amount));
  }, [amount]);

  useEffect(() => {
    calculateConversion();
  }, [amountStr, selectedCurrency, useType, rates]);

  const calculateConversion = () => {
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult(0);
      return;
    }

    const rate = rates.find((r) => r.code === selectedCurrency);
    if (!rate) {
      setResult(0);
      return;
    }

    // TL'den dövize çeviriyoruz
    // Kullanıcı döviz satıyorsa bankadan alış kuru, alıyorsa satış kuru
    const appliedRate = useType === "buy" ? rate.sellRate : rate.buyRate;
    // TL'yi dövize çevir
    setResult((appliedRate ?? 0) > 0 ? numAmount / (appliedRate ?? 1) : 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.,]/g, "");
    setAmountStr(value);
    const numValue = parseFloat(value.replace(',', '.'));
    if (!isNaN(numValue)) {
      onAmountChange(numValue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/20 shadow-sm mb-4"
    >
      <h4 className="text-sm sm:text-base font-display font-bold text-foreground mb-3 flex items-center gap-2">
        <ArrowRightLeft className="w-4 h-4 text-primary" />
        Döviz Çevirici
      </h4>

      <div className="space-y-3">
        {/* İşlem Tipi */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setUseType("sell")}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              useType === "sell"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-white/50 dark:bg-slate-800/50 text-muted-foreground hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            Elinizdeki Dövizi Satın
          </button>
          <button
            onClick={() => setUseType("buy")}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              useType === "buy"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-white/50 dark:bg-slate-800/50 text-muted-foreground hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            Döviz Almak İstiyorum
          </button>
        </div>

        {/* Miktar ve Döviz Seçimi */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">TL Tutarı</label>
            <Input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={handleAmountChange}
              placeholder="5000"
              className="text-base font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Döviz</label>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="text-base font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rates.map((rate) => (
                  <SelectItem key={rate.code} value={rate.code}>
                    {rate.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sonuç */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Karşılık ({selectedCurrency})</span>
            <motion.div
              key={result}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-lg sm:text-2xl font-display font-bold text-primary"
            >
              {result.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {selectedCurrency}
            </motion.div>
          </div>
          
          {/* Kullanılan Kur Bilgisi */}
          {rates.find((r) => r.code === selectedCurrency) && (
            <div className="mt-2 text-xs text-muted-foreground text-right">
              Kur: 1 {selectedCurrency} ={" "}
              {(useType === "buy"
                ? rates.find((r) => r.code === selectedCurrency)?.sellRate
                : rates.find((r) => r.code === selectedCurrency)?.buyRate
              )?.toFixed(4)}{" "}
              ₺
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

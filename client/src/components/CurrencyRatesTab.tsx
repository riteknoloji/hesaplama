import { useCurrencyRates } from "@/hooks/use-currency-rates";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CurrencyConverter } from "@/components/CurrencyConverter";

export function CurrencyRatesTab() {
  const { data: rates, isLoading, error, refetch, isRefetching } = useCurrencyRates();
  const { toast } = useToast();
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [conversionAmount, setConversionAmount] = useState<number>(5000);

  const handleRefresh = async () => {
    if (isRefreshDisabled || isRefetching) return;
    
    setIsRefreshDisabled(true);
    try {
      await refetch();
    } catch (err: any) {
      if (err?.message?.includes('saniye bekleyin')) {
        toast({
          title: "Çok hızlı yenileme",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      // 15 saniye boyunca butonu devre dışı bırak
      setTimeout(() => setIsRefreshDisabled(false), 15000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="p-3 sm:p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 h-16 sm:h-20"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 text-center">
        <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-3">
          Veriler yüklenirken hata oluştu. Lütfen sonra tekrar deneyin.
        </p>
        <Button
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshDisabled || isRefetching}
          className="text-xs sm:text-sm"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
          Yeniden Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-display font-bold text-foreground">
          Güncel Döviz Kurları
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshDisabled || isRefetching}
          className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
        >
          <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Döviz Çevirici */}
      {rates && rates.length > 0 && (
        <CurrencyConverter 
          rates={rates} 
          amount={conversionAmount}
          onAmountChange={setConversionAmount}
        />
      )}

      <AnimatePresence>
        {rates && rates.length > 0 ? (
          rates.map((rate, index) => (
            <motion.div
              key={rate.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {rate.code.substring(0, 1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      {rate.code}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {rate.name}
                    </p>
                  </div>
                </div>
                
                {/* Miktar Input - TL */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={conversionAmount}
                    onChange={(e) => setConversionAmount(Number(e.target.value) || 0)}
                    className="w-20 sm:w-24 px-2 py-1 text-sm font-semibold text-center rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs font-medium text-muted-foreground">TL</span>
                </div>
              </div>

              {/* Alış ve Satış Kurları */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Siz Satarken (Banka Alış) */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Siz Satarken</p>
                  <motion.p
                    className="text-base sm:text-lg font-display font-bold text-foreground"
                    initial={false}
                    animate={(rate.buyChange ?? 0) !== 0 ? { 
                      scale: 1.1, 
                      color: (rate.buyChange ?? 0) > 0 ? '#dc2626' : (rate.buyChange ?? 0) < 0 ? '#16a34a' : '#64748b' 
                    } : { 
                      scale: 1, 
                      color: '' 
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {(rate.buyRate ?? 0).toFixed(4)} ₺
                  </motion.p>
                  {/* TL'nin Döviz Karşılığı */}
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    = {((rate.buyRate ?? 0) > 0 ? (conversionAmount / (rate.buyRate ?? 1)) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {rate.code}
                  </p>
                  <motion.div
                    initial={false}
                    animate={(rate.buyChange ?? 0) !== 0 ? { 
                      scale: 1.08, 
                      backgroundColor: (rate.buyChange ?? 0) > 0 ? '#fee2e2' : (rate.buyChange ?? 0) < 0 ? '#dcfce7' : '#f3f4f6' 
                    } : { 
                      scale: 1, 
                      backgroundColor: 'transparent' 
                    }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-1 text-xs font-medium rounded px-1.5 py-0.5 ${
                      (rate.buyChange ?? 0) > 0
                        ? "text-red-600 dark:text-red-400"
                        : (rate.buyChange ?? 0) < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {(rate.buyChange ?? 0) > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{(rate.buyChange ?? 0).toFixed(4)}</span>
                      </>
                    ) : (rate.buyChange ?? 0) < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{(rate.buyChange ?? 0).toFixed(4)}</span>
                      </>
                    ) : (
                      <span className="text-xs">-</span>
                    )}
                  </motion.div>
                </div>

                {/* Siz Alırken (Banka Satış) */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Siz Alırken</p>
                  <motion.p
                    className="text-base sm:text-lg font-display font-bold text-foreground"
                    initial={false}
                    animate={(rate.sellChange ?? 0) !== 0 ? { 
                      scale: 1.1, 
                      color: (rate.sellChange ?? 0) > 0 ? '#dc2626' : (rate.sellChange ?? 0) < 0 ? '#16a34a' : '#64748b' 
                    } : { 
                      scale: 1, 
                      color: '' 
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {(rate.sellRate ?? 0).toFixed(4)} ₺
                  </motion.p>
                  {/* TL'nin Döviz Karşılığı */}
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    = {((rate.sellRate ?? 0) > 0 ? (conversionAmount / (rate.sellRate ?? 1)) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {rate.code}
                  </p>
                  <motion.div
                    initial={false}
                    animate={(rate.sellChange ?? 0) !== 0 ? { 
                      scale: 1.08, 
                      backgroundColor: (rate.sellChange ?? 0) > 0 ? '#fee2e2' : (rate.sellChange ?? 0) < 0 ? '#dcfce7' : '#f3f4f6' 
                    } : { 
                      scale: 1, 
                      backgroundColor: 'transparent' 
                    }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-1 text-xs font-medium rounded px-1.5 py-0.5 ${
                      (rate.sellChange ?? 0) > 0
                        ? "text-red-600 dark:text-red-400"
                        : (rate.sellChange ?? 0) < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {(rate.sellChange ?? 0) > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>+{(rate.sellChange ?? 0).toFixed(4)}</span>
                      </>
                    ) : (rate.sellChange ?? 0) < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        <span>{(rate.sellChange ?? 0).toFixed(4)}</span>
                      </>
                    ) : (
                      <span className="text-xs">-</span>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="h-1 bg-border/30 rounded-full overflow-hidden mt-3">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full ${
                    ((rate.buyChange ?? 0) > 0 || (rate.sellChange ?? 0) > 0)
                      ? "bg-red-500/50"
                      : ((rate.buyChange ?? 0) < 0 || (rate.sellChange ?? 0) < 0)
                      ? "bg-green-500/50"
                      : "bg-gray-500/50"
                  }`}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 sm:p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 text-center"
          >
            <p className="text-sm sm:text-base text-yellow-700 dark:text-yellow-400">
              Kur verileri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-2 mt-2 border-t border-border/30"
      >
        <p className="text-xs text-muted-foreground/60 italic">
          Veriler: Türkiye Cumhuriyet Merkez Bankası EVDS
        </p>
        <p className="text-xs text-muted-foreground/60 italic">
          Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
        </p>
      </motion.div>
    </div>
  );
}

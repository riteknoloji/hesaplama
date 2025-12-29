import { useCurrencyRates } from "@/hooks/use-currency-rates";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CurrencyRatesTab() {
  const { data: rates, isLoading, error, refetch } = useCurrencyRates();

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
          onClick={() => refetch()}
          className="text-xs sm:text-sm"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
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
          onClick={() => refetch()}
          className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
        >
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div>

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
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">
                      {rate.code.substring(0, 1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {rate.code}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {rate.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm sm:text-base font-display font-bold text-foreground">
                    {rate.rate.toFixed(4)} ₺
                  </p>
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: rate.change! > 0 ? [1, 1.05, 1] : [1, 0.95, 1] }}
                    transition={{ duration: 0.5 }}
                    className={`flex items-center justify-end gap-1 text-xs sm:text-sm font-medium ${
                      rate.change! > 0
                        ? "text-red-600 dark:text-red-400"
                        : rate.change! < 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {rate.change! > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>+{rate.change!.toFixed(4)} ({rate.changePercent!.toFixed(2)}%)</span>
                      </>
                    ) : rate.change! < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{rate.change!.toFixed(4)} ({rate.changePercent!.toFixed(2)}%)</span>
                      </>
                    ) : (
                      <span>Değişim yok</span>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="h-1 bg-border/30 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full ${
                    rate.change! > 0
                      ? "bg-red-500/50"
                      : rate.change! < 0
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

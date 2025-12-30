import { useCurrencyRates } from "@/hooks/use-currency-rates";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function PreciousMetalsTab() {
  const { data: allRates, isLoading, error, refetch, isRefetching } = useCurrencyRates();
  const { toast } = useToast();
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false);
  const [conversionAmount, setConversionAmount] = useState<number>(5000);

  // Sadece kıymetli madenleri filtrele
  const metals = allRates?.filter(rate => ['XAU', 'XAG', 'XPT', 'XPD'].includes(rate.code));

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
      setTimeout(() => setIsRefreshDisabled(false), 15000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
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
        <h3 className="text-sm sm:text-base font-display font-bold text-foreground flex items-center gap-2">
          <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Kıymetli Madenler
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

      {/* TL Tutarı Bilgisi */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 shadow-sm mb-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">TL Tutarı</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={conversionAmount}
              onChange={(e) => setConversionAmount(Number(e.target.value) || 0)}
              className="w-24 sm:w-32 px-3 py-2 text-base sm:text-lg font-bold text-center rounded-lg border-2 border-amber-500/30 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <span className="text-sm sm:text-base font-bold text-foreground">₺</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {metals && metals.length > 0 ? (
          metals.map((metal, index) => {
            // Metal için özel ikon renkleri
            const metalColors: Record<string, { bg: string; text: string; icon: string }> = {
              XAU: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", icon: "🟡" },
              XAG: { bg: "bg-slate-300/10", text: "text-slate-600 dark:text-slate-400", icon: "⚪" },
              XPT: { bg: "bg-slate-600/10", text: "text-slate-700 dark:text-slate-300", icon: "⚫" },
              XPD: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", icon: "💎" },
            };
            const colorScheme = metalColors[metal.code] || metalColors.XAU;

            return (
              <motion.div
                key={metal.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${colorScheme.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-base sm:text-xl">{colorScheme.icon}</span>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm font-medium ${colorScheme.text}`}>
                        {metal.code}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {metal.name}
                      </p>
                    </div>
                  </div>
                  
                  {/* TL Tutarı Input */}
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
                  {/* Siz Satarken */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Siz Satarken</p>
                    <motion.p
                      className="text-base sm:text-lg font-display font-bold text-foreground"
                      initial={false}
                      animate={(metal.buyChange ?? 0) !== 0 ? { 
                        scale: 1.1, 
                        color: (metal.buyChange ?? 0) > 0 ? '#dc2626' : (metal.buyChange ?? 0) < 0 ? '#16a34a' : '#64748b' 
                      } : { 
                        scale: 1, 
                        color: '' 
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {(metal.buyRate ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </motion.p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      = {((metal.buyRate ?? 0) > 0 ? (conversionAmount / (metal.buyRate ?? 1)) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} Ons
                    </p>
                    <motion.div
                      initial={false}
                      animate={(metal.buyChange ?? 0) !== 0 ? { 
                        scale: 1.08, 
                        backgroundColor: (metal.buyChange ?? 0) > 0 ? '#fee2e2' : (metal.buyChange ?? 0) < 0 ? '#dcfce7' : '#f3f4f6' 
                      } : { 
                        scale: 1, 
                        backgroundColor: 'transparent' 
                      }}
                      transition={{ duration: 0.4 }}
                      className={`flex items-center gap-1 text-xs font-medium rounded px-1.5 py-0.5 ${
                        (metal.buyChange ?? 0) > 0
                          ? "text-red-600 dark:text-red-400"
                          : (metal.buyChange ?? 0) < 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {(metal.buyChange ?? 0) > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          <span>+{(metal.buyChange ?? 0).toFixed(2)}</span>
                        </>
                      ) : (metal.buyChange ?? 0) < 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          <span>{(metal.buyChange ?? 0).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </motion.div>
                  </div>

                  {/* Siz Alırken */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Siz Alırken</p>
                    <motion.p
                      className="text-base sm:text-lg font-display font-bold text-foreground"
                      initial={false}
                      animate={(metal.sellChange ?? 0) !== 0 ? { 
                        scale: 1.1, 
                        color: (metal.sellChange ?? 0) > 0 ? '#dc2626' : (metal.sellChange ?? 0) < 0 ? '#16a34a' : '#64748b' 
                      } : { 
                        scale: 1, 
                        color: '' 
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {(metal.sellRate ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </motion.p>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                      = {((metal.sellRate ?? 0) > 0 ? (conversionAmount / (metal.sellRate ?? 1)) : 0).toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} Ons
                    </p>
                    <motion.div
                      initial={false}
                      animate={(metal.sellChange ?? 0) !== 0 ? { 
                        scale: 1.08, 
                        backgroundColor: (metal.sellChange ?? 0) > 0 ? '#fee2e2' : (metal.sellChange ?? 0) < 0 ? '#dcfce7' : '#f3f4f6' 
                      } : { 
                        scale: 1, 
                        backgroundColor: 'transparent' 
                      }}
                      transition={{ duration: 0.4 }}
                      className={`flex items-center gap-1 text-xs font-medium rounded px-1.5 py-0.5 ${
                        (metal.sellChange ?? 0) > 0
                          ? "text-red-600 dark:text-red-400"
                          : (metal.sellChange ?? 0) < 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {(metal.sellChange ?? 0) > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          <span>+{(metal.sellChange ?? 0).toFixed(2)}</span>
                        </>
                      ) : (metal.sellChange ?? 0) < 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          <span>{(metal.sellChange ?? 0).toFixed(2)}</span>
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
                      ((metal.buyChange ?? 0) > 0 || (metal.sellChange ?? 0) > 0)
                        ? "bg-red-500/50"
                        : ((metal.buyChange ?? 0) < 0 || (metal.sellChange ?? 0) < 0)
                        ? "bg-green-500/50"
                        : "bg-gray-500/50"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 sm:p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 text-center"
          >
            <p className="text-sm sm:text-base text-yellow-700 dark:text-yellow-400">
              Kıymetli maden verileri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

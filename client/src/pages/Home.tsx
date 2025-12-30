import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/CurrencyInput";
import { StepperInput } from "@/components/StepperInput";
import { ResultCard } from "@/components/ResultCard";
import { CurrencyRatesTab } from "@/components/CurrencyRatesTab";
import { Calculator, Coins, TrendingUp, History } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [startAmountStr, setStartAmountStr] = useState("0,00");
  const [startAmount, setStartAmount] = useState(0);
  const [dailyPercent, setDailyPercent] = useState(0);
  const [days, setDays] = useState(0);
  
  const [result, setResult] = useState({
    totalResult: 0,
    totalProfit: 0,
    profitPercentage: 0
  });

  const { toast } = useToast();
  const createCalculation = useCreateCalculation();

  useEffect(() => {
    calculate();
  }, [startAmount, dailyPercent, days]);

  const calculate = () => {
    let currentAmount = startAmount;
    
    // Compound interest formula loop
    for (let i = 0; i < days; i++) {
      currentAmount += currentAmount * (dailyPercent / 100);
    }

    const totalProfit = currentAmount - startAmount;
    const profitPercentage = startAmount > 0 ? (totalProfit / startAmount) * 100 : 0;

    setResult({
      totalResult: currentAmount,
      totalProfit: totalProfit,
      profitPercentage: profitPercentage
    });
  };

  const handleSaveCalculation = () => {
    createCalculation.mutate({
      startAmount: startAmount.toString(),
      dailyPercent: dailyPercent.toString(),
      days: days.toString(),
      totalResult: result.totalResult.toString(),
      totalProfit: result.totalProfit.toString(),
    }, {
      onSuccess: () => {
        toast({
          title: "Başarılı",
          description: "Hesaplama geçmişe kaydedildi.",
        });
      },
      onError: () => {
        toast({
          title: "Hata",
          description: "Kayıt sırasında bir sorun oluştu.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header Gradient */}
      <div className="h-48 bg-gradient-to-br from-primary via-blue-600 to-accent rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative z-10 p-6 pt-12 text-center">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight mb-2">Finans Asistanım</h1>
          <p className="text-blue-100 font-medium opacity-90">Akıllı hesaplamalar ve güncel kurlar</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-3 sm:px-4 -mt-16 relative z-20">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 rounded-2xl shadow-lg border border-white/20 h-12 sm:h-14 mb-4 sm:mb-6">
            <TabsTrigger 
              value="calculator" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground font-semibold transition-all duration-300 text-xs sm:text-sm"
            >
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Hesaplama</span>
              <span className="sm:hidden">Hesap</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rates" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground font-semibold transition-all duration-300 text-xs sm:text-sm"
            >
              <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Kurlar</span>
              <span className="sm:hidden">Kur</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
                  
                  {/* Inputs Section */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-center">
                      <div className="w-full sm:w-auto">
                        <CurrencyInput
                          label="Başlangıç Tutarı"
                          value={startAmountStr}
                          onChange={(val, raw) => {
                            setStartAmountStr(val);
                            setStartAmount(raw);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex justify-center">
                        <div className="w-full sm:w-56">
                          <StepperInput
                            value={dailyPercent}
                            onChange={(v) => setDailyPercent(v)}
                            label="Günlük Yüzde"
                            step={0.1}
                            min={0}
                            max={100}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-full sm:w-56">
                          <StepperInput
                            value={days}
                            onChange={(v) => setDays(v)}
                            label="Gün Sayısı"
                            step={1}
                            min={1}
                            max={365}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50 my-2" />

                  {/* Results Section */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <h3 className="text-sm sm:text-base font-display font-bold text-foreground flex items-center gap-1 sm:gap-2">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Sonuçlar
                      </h3>
                      <button 
                        onClick={handleSaveCalculation}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full"
                      >
                        <History className="w-3 h-3" />
                        <span className="hidden sm:inline">Kaydet</span>
                        <span className="sm:hidden">Kaydet</span>
                      </button>
                    </div>

                    <ResultCard 
                      label="Genel Toplam" 
                      value={result.totalResult} 
                      colorClass="text-foreground"
                      delay={0.1}
                    />
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <ResultCard 
                        label="Toplam Kâr" 
                        value={result.totalProfit} 
                        colorClass="text-emerald-600 dark:text-emerald-400"
                        delay={0.2}
                      />
                      <ResultCard 
                        label="Toplam Artış" 
                        value={result.profitPercentage} 
                        isCurrency={false}
                        colorClass="text-blue-600 dark:text-blue-400"
                        delay={0.3}
                        meta={`${days} gün`}
                      />
                    </div>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rates">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-3 sm:p-5">
                  <CurrencyRatesTab />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" />
    </div>
  );
}

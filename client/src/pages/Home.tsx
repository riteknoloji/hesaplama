import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyInput } from "@/components/CurrencyInput";
import { StepperInput } from "@/components/StepperInput";
import { ResultCard } from "@/components/ResultCard";
import { Calculator, Coins, TrendingUp, History } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateCalculation } from "@/hooks/use-calculations";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [startAmountStr, setStartAmountStr] = useState("10.000,00");
  const [startAmount, setStartAmount] = useState(10000);
  const [dailyPercent, setDailyPercent] = useState(5);
  const [days, setDays] = useState(30);
  
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

      <div className="max-w-md mx-auto px-4 -mt-16 relative z-20">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 rounded-2xl shadow-lg border border-white/20 h-14 mb-6">
            <TabsTrigger 
              value="calculator" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground font-semibold transition-all duration-300"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Hesaplama
            </TabsTrigger>
            <TabsTrigger 
              value="rates" 
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground font-semibold transition-all duration-300"
            >
              <Coins className="w-4 h-4 mr-2" />
              Kurlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  
                  {/* Inputs Section */}
                  <div className="space-y-6">
                    <CurrencyInput
                      label="Başlangıç Tutarı"
                      value={startAmountStr}
                      onChange={(val, raw) => {
                        setStartAmountStr(val);
                        setStartAmount(raw);
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <StepperInput
                        label="Günlük Yüzde (%)"
                        value={dailyPercent}
                        onChange={setDailyPercent}
                        min={0.1}
                        max={100}
                        step={0.5}
                        suffix="%"
                      />
                      <StepperInput
                        label="Gün Sayısı"
                        value={days}
                        onChange={setDays}
                        min={1}
                        max={365}
                        step={1}
                        suffix="Gün"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/50 my-2" />

                  {/* Results Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Sonuçlar
                      </h3>
                      <button 
                        onClick={handleSaveCalculation}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
                      >
                        <History className="w-3 h-3" />
                        Kaydet
                      </button>
                    </div>

                    <ResultCard 
                      label="Genel Toplam" 
                      value={result.totalResult} 
                      colorClass="text-foreground text-3xl"
                      delay={0.1}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
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
              <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center p-8">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Coins className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Kur Bilgileri</h3>
                  <p className="text-muted-foreground">
                    Canlı döviz kurları ve piyasa verileri çok yakında burada olacak.
                  </p>
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

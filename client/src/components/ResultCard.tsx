import { numberToTurkish } from "@/lib/number-utils";
import { motion } from "framer-motion";

interface ResultCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  colorClass?: string;
  delay?: number;
}

export function ResultCard({ label, value, isCurrency = true, colorClass = "text-primary", delay = 0 }: ResultCardProps) {
  
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : value.toFixed(2);

  const textRep = isCurrency ? numberToTurkish(value) : "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">{label}</p>
      <div className={`text-sm sm:text-xl font-display font-bold ${colorClass} tracking-tight break-words overflow-hidden`}>
        <span className="block text-base sm:text-2xl leading-tight">{formattedValue}</span>
        {isCurrency && <span className="text-xs sm:text-sm font-normal text-muted-foreground">TL</span>}
        {!isCurrency && <span className="text-xs sm:text-sm font-normal text-muted-foreground">%</span>}
      </div>
      {textRep && (
        <p className="text-xs text-muted-foreground/80 mt-1 font-medium italic line-clamp-2">
          {textRep}
        </p>
      )}
    </motion.div>
  );
}

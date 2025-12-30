import { numberToTurkish } from "@/lib/number-utils";
import { motion } from "framer-motion";

interface ResultCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  colorClass?: string;
  delay?: number;
  meta?: string;
}

export function ResultCard({ label, value, isCurrency = true, colorClass = "text-primary", delay = 0, meta }: ResultCardProps) {
  
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : value.toFixed(2);

  const textRep = isCurrency ? numberToTurkish(value) : "";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay }}
      className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden text-center"
    >
      <div className="flex flex-col items-center mb-1">
        <p className="text-[9px] sm:text-[11px] font-medium text-muted-foreground">{label}</p>
        {meta ? (
          <span className="text-[9px] sm:text-[11px] text-muted-foreground mt-1">{meta}</span>
        ) : null}
      </div>
      <div className={`flex items-baseline justify-center gap-2 text-[11px] sm:text-[15px] font-display font-bold ${colorClass} tracking-tight break-words`}>
        <span className="block text-[12px] sm:text-[18px] leading-tight">{formattedValue}</span>
        {isCurrency && <span className="text-[9px] sm:text-[11px] font-normal text-muted-foreground">TL</span>}
        {!isCurrency && <span className="text-[9px] sm:text-[11px] font-normal text-muted-foreground">%</span>}
      </div>
      {textRep && (
        <p className="text-xs text-muted-foreground/80 mt-1 font-medium italic">
          {textRep}
        </p>
      )}

      {/* meta displayed next to label */}
    </motion.div>
  );
}

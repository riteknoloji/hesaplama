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
      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <div className={`text-2xl font-display font-bold ${colorClass} tracking-tight`}>
        {formattedValue} {isCurrency && <span className="text-sm font-normal text-muted-foreground ml-1">TL</span>}
        {!isCurrency && <span className="text-sm font-normal text-muted-foreground ml-1">%</span>}
      </div>
      {textRep && (
        <p className="text-xs text-muted-foreground/80 mt-1 font-medium italic">
          {textRep}
        </p>
      )}
    </motion.div>
  );
}

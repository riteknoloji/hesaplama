import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { numberToTurkish } from "@/lib/number-utils";
import { motion, AnimatePresence } from "framer-motion";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string, rawValue: number) => void;
  label: string;
}

export function CurrencyInput({ value, onChange, label }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [textRepresentation, setTextRepresentation] = useState("");

  useEffect(() => {
    // Calculate text representation
    const rawValue = parseValue(value);
    if (rawValue > 0) {
      setTextRepresentation(numberToTurkish(rawValue));
    } else {
      setTextRepresentation("");
    }
  }, [value]);

  const parseValue = (val: string) => {
    const normalized = val.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Allow only numbers and one comma
    val = val.replace(/[^0-9,]/g, "");
    if ((val.match(/,/g) || []).length > 1) return;

    // Handle decimal places limit
    if (val.includes(",")) {
      const parts = val.split(",");
      if (parts[1].length > 2) return;
    }

    // Real-time formatting: add dots for thousands
    let formatted = val;
    if (val.includes(",")) {
      const [intPart, decPart] = val.split(",");
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      formatted = formattedInt + "," + decPart;
    } else {
      formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    setDisplayValue(formatted);
    onChange(formatted, parseValue(formatted));
  };

  const handleBlur = () => {
    // Format on blur to ensure beautiful 1.000,00 look
    if (!displayValue) return;
    const raw = parseValue(displayValue);
    const parts = raw.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatted = parts.join(",");
    onChange(formatted, raw);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs sm:text-sm font-medium text-muted-foreground ml-1">{label}</label>
      <div className="relative group">
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="text-base sm:text-xl font-display font-semibold tracking-tight h-10 sm:h-12 px-3 sm:px-4 bg-white/50 dark:bg-black/20 border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl shadow-sm"
          placeholder="0,00"
        />
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none text-sm sm:text-base">
          ₺
        </div>
      </div>
      <AnimatePresence>
        {textRepresentation && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-medium text-primary ml-1 italic line-clamp-1"
          >
            {textRepresentation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    setDisplayValue(value);
    
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

    // Format thousands with dots (only for display logic while typing is complex, 
    // simpler approach is to strip and reformat on blur, but let's try real-time)
    
    // For this implementation, we pass the raw string up, parent handles logic or we handle strict masking.
    // Given the prompt requirements: "Automatically formats with dots for thousands"
    
    const rawVal = val.replace(/\./g, ""); // Remove dots to get clean number string
    
    // Logic to re-add dots:
    // This is complex to do perfectly while typing cursor position is maintained.
    // We will do a simple version: remove non-numeric chars (except comma), pass to parent.
    // Parent formats it back.
    
    onChange(val, parseValue(val));
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
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground ml-1">{label}</label>
      <div className="relative group">
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="text-2xl font-display font-semibold tracking-tight h-14 px-4 bg-white/50 dark:bg-black/20 border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl shadow-sm"
          placeholder="0,00"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none">
          ₺
        </div>
      </div>
      <AnimatePresence>
        {textRepresentation && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-medium text-primary ml-1 italic"
          >
            {textRepresentation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

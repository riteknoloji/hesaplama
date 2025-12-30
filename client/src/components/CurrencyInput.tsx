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
  const [displayValue, setDisplayValue] = useState<string>(value || "");
  const [textRepresentation, setTextRepresentation] = useState<string>("");

  const parseValue = (val: string) => {
    if (!val) return 0;
    const normalized = val.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    const raw = parseValue(displayValue || value || "");
    if (raw > 0) setTextRepresentation(numberToTurkish(raw));
    else setTextRepresentation("");
  }, [displayValue, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9,]/g, "");
    if ((val.match(/,/g) || []).length > 1) return;

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
    if (!displayValue) return;
    const raw = parseValue(displayValue);
    const parts = raw.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatted = parts.join(",");
    setDisplayValue(formatted);
    onChange(formatted, raw);
  };

  const minChars = 4;
  const maxChars = 28;
  const len = displayValue ? displayValue.length : 0;
  const widthChars = Math.min(maxChars, Math.max(minChars, len + 1));
  const inputStyle: React.CSSProperties = {
    width: `calc(${widthChars}ch * 1.1)`,
    fontSize: "14px",
    transition: "width 160ms ease",
    color: "rgb(var(--foreground))",
    WebkitTextFillColor: "rgb(var(--foreground))",
    caretColor: "rgb(var(--foreground))",
  };

  return (
    <div className="space-y-1.5">
      <label
        className="text-xs sm:text-sm font-medium text-muted-foreground text-center block"
        style={{ width: `calc(${widthChars}ch * 1.1)`, margin: "0 auto" }}
      >
        {label}
      </label>
      <div className="relative group">
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="!w-auto mx-auto block text-center text-sm sm:text-base font-mono tabular-nums text-foreground tracking-tight h-8 sm:h-10 px-3 sm:px-3 bg-white/50 dark:bg-black/20 border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-md shadow-sm force-input leading-snug"
          style={{ ...inputStyle, display: "block", minWidth: "6ch", boxSizing: "border-box", margin: "0 auto", paddingLeft: 0, paddingRight: 0 }}
          placeholder="0,00"
        />
      </div>
      <AnimatePresence>
        {textRepresentation && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-medium text-primary italic text-center mx-auto mt-1 whitespace-normal break-words"
            style={{ transition: "width 160ms ease", maxWidth: "100%" }}
          >
            {textRepresentation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}

export function StepperInput({ 
  value, 
  onChange, 
  label, 
  step = 1, 
  min = 0, 
  max = 1000, 
  suffix = "" 
}: StepperInputProps) {
  
  const handleIncrement = () => {
    if (value + step <= max) onChange(Number((value + step).toFixed(2)));
  };

  const handleDecrement = () => {
    if (value - step >= min) onChange(Number((value - step).toFixed(2)));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    } else if (e.target.value === "") {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs sm:text-sm font-medium text-muted-foreground ml-1 truncate">{label}</label>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-10 sm:h-14 w-10 sm:w-14 rounded-xl shrink-0 border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
        >
          <Minus className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
        
        <div className="relative flex-1 min-w-0">
          <Input
            type="number"
            value={value}
            onChange={handleChange}
            className="text-center text-base sm:text-xl font-display font-semibold h-10 sm:h-14 pr-10 sm:pr-16 lg:pr-20 bg-white/50 dark:bg-black/20 border-2 focus-visible:ring-primary/20 focus-visible:border-primary rounded-xl"
          />
          {suffix && (
            <span className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none text-xs sm:text-sm lg:text-base whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-10 sm:h-14 w-10 sm:w-14 rounded-xl shrink-0 border-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}

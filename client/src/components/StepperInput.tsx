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
      console.log('StepperInput change:', val);
      onChange(val);
    } else if (e.target.value === "") {
      console.log('StepperInput change: empty -> 0');
      onChange(0);
    }
  };


  const strVal = String(value ?? "");
  const minChars = 2;
  const maxChars = 8;
  const widthChars = Math.min(maxChars, Math.max(minChars, strVal.length));
  const inputStyle: React.CSSProperties = { 
    width: `${widthChars * 0.75}rem`,
    minWidth: '2.5rem',
    maxWidth: '5rem',
    fontSize: '14px', 
    transition: 'width 160ms ease', 
    color: 'rgb(var(--foreground))', 
    WebkitTextFillColor: 'rgb(var(--foreground))', 
    caretColor: 'rgb(var(--foreground))'
  };
  return (
    <div className="space-y-1 min-w-0 w-full">
      <label className="text-[11px] sm:text-xs font-medium text-muted-foreground text-center block">{label}</label>
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 border border-border rounded-md p-1 bg-white/50 dark:bg-black/20">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={value <= min}
            className="h-5 sm:h-7 w-5 sm:w-7 rounded-lg shrink-0 border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Minus className="h-3 sm:h-4 w-3 sm:w-4" />
          </Button>

          <div className="relative flex-shrink-0 overflow-hidden">
            <Input
              type="number"
              value={String(value ?? "")}
              onChange={handleChange}
              className="text-center text-sm sm:text-base font-mono tabular-nums text-foreground h-8 sm:h-10 px-2 bg-transparent border-0 focus-visible:ring-0 leading-snug"
              style={inputStyle}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={value >= max}
            className="h-5 sm:h-7 w-5 sm:w-7 rounded-lg shrink-0 border-2 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
          >
            <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

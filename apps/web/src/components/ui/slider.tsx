import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "@/lib/utils";

interface SliderProps extends SliderPrimitive.Root.Props {
  showValue?: boolean;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  ...props
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Control data-slot="slider-control" className="flex w-full items-center">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-secondary relative h-2 w-full grow overflow-hidden rounded-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="bg-primary absolute h-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="border-primary bg-background ring-offset-background focus-visible:ring-ring block size-4 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
      {showValue && (
        <SliderPrimitive.Value
          data-slot="slider-value"
          className="text-muted-foreground ml-3 min-w-[2ch] text-xs tabular-nums"
        />
      )}
    </SliderPrimitive.Root>
  );
}

function SliderOutput({ className, ...props }: SliderPrimitive.Value.Props) {
  return (
    <SliderPrimitive.Value
      data-slot="slider-output"
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      {...props}
    />
  );
}

export { Slider, SliderOutput };

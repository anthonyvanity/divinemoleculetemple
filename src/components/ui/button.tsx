import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex max-w-full items-center justify-center gap-1.5 whitespace-normal text-balance text-center font-sans text-[10px] font-medium uppercase leading-snug tracking-[0.06em] transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime min-h-8 h-auto px-3 py-1.5",
  {
    variants: {
      variant: {
        default: "border border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
        outline: "border border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
        ghost: "text-fg/70 hover:text-fg",
        gold: "border border-fg bg-transparent text-fg hover:bg-fg hover:text-bg",
        lime: "border border-lime bg-lime text-ink hover:bg-paper",
        dark: "border border-lime bg-transparent text-lime hover:bg-lime hover:text-ink",
        pink: "border border-pink bg-pink text-ink hover:bg-paper",
        login: "gold-metal border bg-ink hover:bg-ink",
        cream: "border-0 bg-gold text-ink hover:bg-paper",
      },
      size: {
        default: "",
        sm: "min-h-7 px-2.5 py-1 text-[9px]",
        lg: "min-h-9 px-4 py-2 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

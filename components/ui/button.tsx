import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: font-body, font-medium, rounded-full, warm focus ring (marigold), active scale
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding font-body text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-marigold focus-visible:ring-2 focus-visible:ring-marigold active:not-aria-[haspopup]:scale-[0.97] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary: clay fill, cream text, orange on hover — never blue
        default:
          "bg-clay text-cream hover:bg-orange",
        // Outline: espresso border, espresso text, cream fill on hover
        outline:
          "border-espresso text-espresso bg-transparent hover:bg-cream hover:text-espresso dark:border-cream dark:text-cream dark:hover:bg-cream/10",
        // Secondary: cream fill, espresso text, marigold hover
        secondary:
          "bg-cream text-espresso hover:bg-marigold hover:text-espresso",
        // Ghost: no background, espresso text, subtle cream on hover
        ghost:
          "hover:bg-cream hover:text-espresso text-espresso dark:hover:bg-espresso/30 dark:text-cream",
        // Destructive: leaf/red tones
        destructive:
          "bg-leaf/10 text-leaf hover:bg-leaf/20 focus-visible:border-leaf/40 focus-visible:ring-leaf/20",
        // Link: espresso underline
        link: "text-espresso underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-4 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-6 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

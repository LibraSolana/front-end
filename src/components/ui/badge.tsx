import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center shrink-0 whitespace-nowrap overflow-hidden',
  {
    variants: {
      variant: {
        // Solid styles
        default:
          'bg-primary text-primary-foreground border border-primary/80 hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground border border-secondary/70 hover:bg-secondary/80',
        destructive:
          'bg-destructive text-destructive-foreground border border-destructive/80 hover:bg-destructive/90',
        outline:
          'border text-foreground hover:bg-accent hover:text-accent-foreground',

        // New semantic solids
        success:
          'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-600/90',
        warning:
          'bg-amber-500 text-amber-950 border border-amber-400 hover:bg-amber-500/90',
        info: 'bg-sky-600 text-white border border-sky-500 hover:bg-sky-600/90',

        // Soft “pill” styles
        soft: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 dark:border-primary/25',
        softSuccess:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/15',
        softWarning:
          'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/25 hover:bg-amber-500/20',
        softInfo:
          'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 hover:bg-sky-500/15',

        // Subtle gradient/glass
        gradient:
          'text-primary-foreground border border-white/10 bg-gradient-to-r from-primary/80 to-primary/60 shadow-sm backdrop-blur-sm',
        glass:
          'bg-white/10 text-foreground border border-white/20 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]',
      },
      size: {
        xs: 'px-1.5 py-0 text-[10px]',
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      radius: {
        pill: 'rounded-full',
        md: 'rounded-md',
        lg: 'rounded-lg',
      },
      withDot: {
        true: '[&>span[data-dot]]:block [&>span[data-dot]]:size-1.5 [&>span[data-dot]]:rounded-full [&>span[data-dot]]:mr-1.5',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: [
          'soft',
          'softSuccess',
          'softWarning',
          'softInfo',
          'glass',
          'gradient',
          'outline',
        ],
        class: 'shadow-none',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      radius: 'pill',
      withDot: false,
    },
  }
);

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    dotClassName?: string;
    dotColorClass?: string; // override dot color
  };

function Badge({
  className,
  variant,
  size,
  radius,
  withDot,
  asChild = false,
  dotClassName,
  dotColorClass,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-slot="badge"
      className={cn(
        'gap-1 font-medium w-fit transition-colors',
        '[&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none',
        badgeVariants({ variant, size, radius, withDot }),
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          data-dot
          className={cn(dotColorClass ?? 'bg-current', dotClassName)}
        />
      )}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };

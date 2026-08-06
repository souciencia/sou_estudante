import { cn } from "@/utils/cn";

interface Props {
  n: '1' | '2' | '3' | '4' | '5'
  className?: string
}

export const CardIconEnade = ({n,  className = "" }: Props) => {
  const variants = {
    1: 'bg-card-bg text-card-fg',
    2: 'bg-lime-100 text-lime-600',
    3: 'bg-yellow-100 text-yellow-600',
    4: 'bg-emerald-100 text-emerald-600',
    5: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div
      className={cn(`flex flex-col justify-center items-center size-10 rounded-[8px]`, 
        `${variants[n]} ${className}`

      )}
    >
        <span className={cn(`text-[20px] font-bold`)}>{n}</span>
        <span className={cn(`font-bold text-[8px] -translate-y-1`)}>Enade</span>
    </div>
  );
};

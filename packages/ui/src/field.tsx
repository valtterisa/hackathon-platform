import type {
  FormHTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "./utils";

const control =
  "w-full rounded-none border border-line-strong bg-white font-sans text-[0.9375rem] text-ink transition-colors duration-150 placeholder:text-[#8a8a8a] hover:border-[#a3a3a3] focus-visible:border-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-11 px-3", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(control, "min-h-28 px-3 py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        control,
        "h-11 cursor-pointer appearance-none bg-[length:12px] bg-[right_0.875rem_center] bg-no-repeat pr-9 pl-3",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%230a0a0a' stroke-width='1.6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({
  className,
  children,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 text-[0.9375rem] text-ink",
        className,
      )}
    >
      <input
        type="checkbox"
        className="size-5 cursor-pointer accent-ink"
        {...props}
      />
      {children}
    </label>
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="mt-1.5 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function FieldRow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>
  );
}

export function Form({
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn("flex max-w-xl flex-col gap-5", className)} {...props} />
  );
}

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from "react";

const VARIANT_CLASS = {
  primary:
    "bg-violet-600 text-white shadow-sm shadow-violet-300/30 hover:bg-violet-700 active:bg-violet-800",
  accent:
    "bg-violet-600 text-white shadow-sm shadow-violet-300/30 hover:bg-violet-700 active:bg-violet-800",
  secondary:
    "bg-white text-violet-800 shadow-sm ring-1 ring-violet-200/80 hover:bg-violet-50 active:bg-violet-100",
  danger:
    "bg-white text-rose-700 shadow-sm ring-1 ring-rose-200/80 hover:bg-rose-50 active:bg-rose-100",
  ghost:
    "bg-violet-50/90 text-violet-700 shadow-sm ring-1 ring-violet-100 hover:bg-violet-100 active:bg-violet-200/60",
  muted:
    "bg-transparent text-violet-600 ring-1 ring-transparent hover:bg-violet-50 hover:ring-violet-100",
} as const;

/** 編集・コピー・操作・削除 — sm / md は同一（text-sm・h-9） */
const SIZE_CLASS = {
  sm: "box-border h-9 min-h-9 min-w-9 px-3.5",
  md: "box-border h-9 min-h-9 min-w-9 px-3.5",
  lg: "box-border h-10 min-h-10 min-w-10 px-4",
  icon: "box-border size-9 min-h-9 min-w-9 p-0",
} as const;

export type RowActionButtonVariant = keyof typeof VARIANT_CLASS;
export type RowActionButtonSize = keyof typeof SIZE_CLASS;

const BASE_CLASS =
  "row-action inline-flex shrink-0 items-center justify-center rounded-full text-sm font-semibold whitespace-nowrap no-underline transition disabled:pointer-events-none disabled:opacity-40";

export function rowActionButtonClass(
  variant: RowActionButtonVariant = "secondary",
  size: RowActionButtonSize = "md",
  className = "",
) {
  return `${BASE_CLASS} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`.trim();
}

type ActionStyleProps = {
  variant?: RowActionButtonVariant;
  size?: RowActionButtonSize;
  className?: string;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ActionStyleProps;

export default function RowActionButton({
  variant = "secondary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={rowActionButtonClass(variant, size, className)} {...props} />
  );
}

type LinkProps = ComponentProps<typeof Link> & ActionStyleProps;

export function RowActionLink({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: LinkProps) {
  return <Link className={rowActionButtonClass(variant, size, className)} {...props} />;
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & ActionStyleProps;

export function RowActionAnchor({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: AnchorProps) {
  return <a className={rowActionButtonClass(variant, size, className)} {...props} />;
}

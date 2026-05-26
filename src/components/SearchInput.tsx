"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
  autoComplete?: string;
  clearLabel?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  id,
  autoComplete = "off",
  clearLabel = "検索をクリア",
}: Props) {
  const showClear = value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border border-violet-200 py-2 pr-9 pl-3 ${inputClassName}`}
      />
      {showClear ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={clearLabel}
          className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-base leading-none font-semibold text-violet-500 hover:bg-violet-100 hover:text-violet-800"
        >
          <span aria-hidden>✕</span>
        </button>
      ) : null}
    </div>
  );
}

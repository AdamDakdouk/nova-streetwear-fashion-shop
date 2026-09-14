interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, id = "otp", autoFocus }: OtpInputProps) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      maxLength={6}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      placeholder="000000"
      aria-label="6-digit code"
      className="focus-ring h-14 w-full rounded-md border border-border bg-white text-center font-heading text-2xl font-semibold tracking-[0.5em] text-ink placeholder:text-border"
    />
  );
}

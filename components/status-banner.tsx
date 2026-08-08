type StatusTone = "success" | "error" | "info";

type StatusBannerProps = {
  tone: StatusTone;
  message: string;
};

export function StatusBanner({ tone, message }: StatusBannerProps) {
  if (!message) return null;

  const className = {
    success: "status status-success",
    error: "status status-error",
    info: "status status-info"
  }[tone];

  return (
    <div className={className} role="status" aria-live="polite">
      {message}
    </div>
  );
}

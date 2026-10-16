export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-neon/25 border-t-neon" />
      <p className="text-sm font-medium text-fg-muted">
        Sinfxona yuklanmoqda, biroz kuting...
      </p>
    </div>
  );
}

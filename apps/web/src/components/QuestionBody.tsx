import type { ServedQuestion } from "../lib/types";

/** NUMERIC and SHORT_TEXT are typed answers, not choice grids. */
function isFreeText(type: string): boolean {
  return type === "NUMERIC" || type === "SHORT_TEXT";
}

export function QuestionBody({
  question,
  value,
  onChange,
  disabled,
  onChoose,
}: {
  question: ServedQuestion;
  value: string;
  onChange: (next: string) => void;
  disabled: boolean;
  onChoose: (given: string) => void;
}) {
  const free = isFreeText(question.type);

  return (
    <div className="space-y-4">
      {question.passage ? (
        <div className="max-h-64 overflow-y-auto rounded-xl border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {question.passage}
        </div>
      ) : null}
      <h1 className="text-xl font-medium">{question.prompt}</h1>
      {free ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = value.trim();
            if (!trimmed || disabled) return;
            onChoose(trimmed);
          }}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Javobingizni yozing"
            aria-label="Javob"
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-left disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="btn-primary disabled:opacity-50"
          >
            Yuborish
          </button>
        </form>
      ) : (
        <div className="grid gap-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onChoose(String(i))}
              disabled={disabled}
              className="rounded-xl border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <span className="mr-2 text-muted-foreground">{i + 1}.</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

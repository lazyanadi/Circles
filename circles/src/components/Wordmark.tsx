export function Wordmark({ big = false }: { big?: boolean }) {
  return (
    <span className={big ? "wordmark wordmark--big" : "wordmark"}>
      <span className="wordmark__dot" aria-hidden="true" />
      circles
    </span>
  );
}

export default function Footer({ stats, className }) {
  return (
    <footer className={`px-4 py-1 text-[10px] border-t flex justify-between items-center font-mono transition-colors duration-300 bg-(--bg-secondary) border-(--border-color) text-(--text-secondary) ${className || ''}`}>
      <div className="flex gap-4">
        <span>Characters: {stats.chars}</span>
        <span>Words: {stats.words}</span>
        <span>Reading: ~{stats.readingTime} min</span>
      </div>
      <div>v0.3.0 - Modular Architecture</div>
    </footer>
  );
}

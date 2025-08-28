export default function Hearts({ lives = 5 }) {
  return (
    <div className="hearts" aria-label={`Lives: ${lives}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`heart ${i < lives ? "on" : "off"}`}>&hearts;</span>
      ))}
    </div>
  );
}

// export default function Hearts({ lives = 5 }) {
//   return (
//     <div className="hearts" aria-label={`Lives: ${lives}`}>
//       {Array.from({ length: 5 }).map((_, i) => (
//         <span key={i} className={`heart ${i < lives ? "on" : "off"}`}>&hearts;</span>
//       ))}
//     </div>
//   );
// }

export default function Hearts({ lives = 5 }) {
  return (
    <div className="hearts" role="img" aria-label={`${lives} of 5 lives remaining`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isActive = i < lives;
        const justLost = !isActive && i === lives && lives < 5;

        return (
          <span
            key={i}
            className={`heart ${isActive ? "on" : "off"}${justLost ? " heart-lost" : ""}`}
            aria-hidden="true"
          >
            &hearts;
          </span>
        );
      })}
    </div>
  );
}

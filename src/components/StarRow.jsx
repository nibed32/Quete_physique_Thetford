function StarRow({ stars, size = 28 }) {
  return (
    <div className="star-row" style={{ fontSize: size }}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= stars ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRow

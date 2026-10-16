import "./Card.css";

function Card({ nombre, categoria, precio, disponible, onClick, children }) {
  return (
    <div className="card" onClick={onClick}>
      <span className="card-categoria">{categoria}</span>
      <h3>{nombre}</h3>
      <p className="card-precio">${precio.toLocaleString("es-AR")}</p>
      <p className={disponible ? "card-stock" : "card-stock sin-stock"}>
        {disponible ? "Disponible" : "Sin stock"}
      </p>
      {children}
    </div>
  );
}

export default Card;

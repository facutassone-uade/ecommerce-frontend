import "./Loader.css";

function Loader() {
  return (
    <div className="loader-overlay" role="status" aria-label="Cargando">
      <div className="loader-spinner"></div>
    </div>
  );
}

export default Loader;

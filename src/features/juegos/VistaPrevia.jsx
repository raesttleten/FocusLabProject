import sigueElPunto from '../../assets/juegos/vistas/sigue-el-punto.svg';
import semaforo from '../../assets/juegos/vistas/semaforo-atento.svg';
import semaforoBloqueado from '../../assets/juegos/vistas/semaforo-atento-bloqueado.svg';
import cazaFiguras from '../../assets/juegos/vistas/caza-figuras.svg';
import cazaFigurasBloqueado from '../../assets/juegos/vistas/caza-figuras-bloqueado.svg';

const figuras = Object.values(
  import.meta.glob('../../assets/juegos/vistas/encuentra-el-par-*.svg', { eager: true, import: 'default' }),
).sort((a, b) => Number(a.match(/-(\d+)\./)?.[1] ?? 0) - Number(b.match(/-(\d+)\./)?.[1] ?? 0));

const LETRAS = ['K', 'M', 'X', 'P', 'R'];
const CUADROS = ['rgba(94, 80, 161, 0.9)', 'rgba(154, 143, 196, 0.9)', '#cfc6e8', 'rgba(116, 102, 179, 0.9)'];

function Contenido({ id, abierto }) {
  switch (id) {
    case 'a-todo-foco':
      return (
        <div className="vista-letras">
          {LETRAS.map((letra) => (
            <span key={letra} className={`vista-letras__ficha${letra === 'X' ? ' vista-letras__ficha--x' : ''}`}>
              {letra}
            </span>
          ))}
        </div>
      );
    case 'repite-el-patron':
      return (
        <div className="vista-patron">
          <div className="vista-patron__cuadros">
            {CUADROS.map((color, i) => (
              <span key={i} style={{ background: color }} />
            ))}
          </div>
          <span className="vista-patron__orden">1 · 3 · 2 · 4</span>
        </div>
      );
    case 'sigue-el-punto':
      return <img className="vista-trayecto" src={sigueElPunto} alt="" />;
    case 'encuentra-el-par':
      return (
        <div className="vista-figuras">
          {figuras.map((src, i) => (
            <img key={i} src={src} alt="" width="22.5" height="22.5" />
          ))}
        </div>
      );
    case 'semaforo-atento':
      return <img className="vista-completa" src={abierto ? semaforo : semaforoBloqueado} alt="" />;
    case 'caza-figuras':
      return <img className="vista-completa" src={abierto ? cazaFiguras : cazaFigurasBloqueado} alt="" />;
    default:
      return null;
  }
}

export default function VistaPrevia({ id, abierto }) {
  const imagenCompleta = id === 'semaforo-atento' || id === 'caza-figuras';
  return (
    <div className={`vista-previa${abierto || imagenCompleta ? '' : ' vista-previa--bloqueada'}${imagenCompleta ? ' vista-previa--imagen' : ''}`} aria-hidden="true">
      <Contenido id={id} abierto={abierto} />
    </div>
  );
}

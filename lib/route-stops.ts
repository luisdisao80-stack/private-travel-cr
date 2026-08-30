// lib/route-stops.ts
//
// Paradas con nombre propio que se pueden agregar a un traslado.
//
// Esto NO es un producto nuevo: es el mismo "Extra Stops (optional)" que
// ya existe en el cotizador desde siempre, cobrado con la misma regla de
// EXTRA_STOP_PRICE_USD por hora. Lo único que cambia es que deja de ser
// un desplegable mudo que dice "Parada de 2 horas (+$70)" y pasa a decir
// QUÉ se va a ver en esas dos horas.
//
// De dónde salió: Diego trajo la página de la competencia (2026-08-30),
// que vende exactamente estas paradas como un "Discovery upgrade" con
// nombre y foto. El servicio de Diego ya lo hacía — sólo que redactado
// como un recargo por hora, que es como cobrar por el tiempo en vez de
// vender el paseo.
//
// Decisión de Diego (2026-08-30): se ofrecen SÓLO las paradas. Sin
// almuerzo, y las entradas las paga el visitante en cada lugar.

export type RouteStop = {
  id: string;
  /** Nombre propio del lugar: va igual en inglés y en español. */
  name: string;
  blurbEn: string;
  blurbEs: string;
  /**
   * Horas que le suma al traslado. Es lo que multiplica
   * EXTRA_STOP_PRICE_USD, así que tiene que ser un entero: media hora
   * no se puede cobrar con la regla que ya existe.
   *
   * Son los tiempos con los que Diego ya opera estas paradas. Si quiere
   * cambiarlos, se cambian acá y quedan cambiados en la página, en el
   * carrito, en el precio y en el correo del chofer a la vez.
   */
  hours: number;
  /**
   * Aviso que hay que dar SÍ o SÍ antes de vender la parada, o `null`.
   *
   * Hoy sólo lo usa el Poás: el parque exige reserva con hora y cupo
   * comprada de antemano en el sitio del SINAC. Sin esa reserva no los
   * dejan entrar aunque el chofer los lleve hasta el portón — y ahí el
   * reclamo le llega a Diego, no al parque. Por eso se muestra al lado
   * de la casilla, antes de agregarla, y no en la letra chica.
   */
  warningEn: string | null;
  warningEs: string | null;
};

/**
 * Las paradas del corredor Valle Central ↔ Arenal.
 *
 * Las tres quedan sobre la subida por Alajuela / Vara Blanca, que es el
 * camino que el chofer hace igual. Por eso funcionan como parada: no es
 * un desvío, es bajarse en algo que ya queda de paso.
 */
const CENTRAL_VALLEY_TO_ARENAL: RouteStop[] = [
  {
    id: "poas",
    name: "Poás Volcano National Park",
    blurbEn:
      "One of the few craters in the world you can drive almost to the rim of — a turquoise acid lake nearly 300 m below the lookout.",
    blurbEs:
      "Uno de los pocos cráteres del mundo al que se puede llegar en carro casi hasta el borde: una laguna ácida turquesa casi 300 m abajo del mirador.",
    hours: 2,
    warningEn:
      "The park sells a limited number of timed entries and they must be reserved online in advance — please book yours before your travel date.",
    warningEs:
      "El parque vende una cantidad limitada de entradas por hora y hay que reservarlas en línea de antemano — reservá la tuya antes de la fecha del viaje.",
  },
  {
    id: "alsacia",
    name: "Hacienda Alsacia",
    blurbEn:
      "Starbucks' working coffee farm on the slopes of Poás. The guided walk follows the bean from the seedling nursery to the cup.",
    blurbEs:
      "La finca de café de Starbucks en las faldas del Poás. El recorrido guiado sigue el grano desde el almácigo hasta la taza.",
    hours: 2,
    warningEn: null,
    warningEs: null,
  },
  {
    id: "la-paz",
    name: "La Paz Waterfall Gardens",
    blurbEn:
      "Five waterfalls linked by a trail through the Vara Blanca cloud forest, plus a rescue sanctuary with toucans, sloths and wild cats.",
    blurbEs:
      "Cinco cataratas unidas por un sendero en el bosque nuboso de Vara Blanca, más un santuario de rescate con tucanes, perezosos y felinos.",
    hours: 3,
    warningEn: null,
    warningEs: null,
  },
];

/**
 * Qué paradas se ofrecen en qué ruta.
 *
 * El par es SIN orden: la ruta de vuelta (La Fortuna → SJO) pasa por los
 * mismos lugares que la de ida, así que se ofrece igual.
 *
 * Los nombres son los CRUDOS de Supabase (`routes.origen` / `.destino`),
 * no los bonitos de displayLocation(). Si acá dijera "San Jose Airport"
 * no calzaría con ninguna fila.
 *
 * Para sumar un corredor nuevo se agrega una entrada acá y listo: la
 * página de esa ruta empieza a mostrar las paradas sola.
 */
const CORRIDORS: { endpoints: [string, string]; stops: RouteStop[] }[] = [
  {
    endpoints: ["SJO - Juan Santamaria Int. Airport", "La Fortuna (Arenal)"],
    stops: CENTRAL_VALLEY_TO_ARENAL,
  },
  {
    endpoints: ["Alajuela City", "La Fortuna (Arenal)"],
    stops: CENTRAL_VALLEY_TO_ARENAL,
  },
];

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Las paradas que se pueden ofrecer en esta ruta, o `[]` si no hay.
 *
 * El `[]` es el caso normal y es a propósito: una parada en el Poás no
 * tiene nada que hacer en un Tamarindo → Manuel Antonio, que queda al
 * otro lado del país. Ofrecerla en todas las rutas "porque sí" es cómo
 * se termina vendiendo algo que el chofer no puede cumplir.
 */
export function getStopsForRoute(origen: string, destino: string): RouteStop[] {
  const a = norm(origen);
  const b = norm(destino);
  const hit = CORRIDORS.find(({ endpoints: [x, y] }) => {
    const nx = norm(x);
    const ny = norm(y);
    return (a === nx && b === ny) || (a === ny && b === nx);
  });
  return hit ? hit.stops : [];
}

/** Horas totales de un conjunto de paradas — lo que se cobra a $/hora. */
export function totalStopHours(stops: RouteStop[]): number {
  return stops.reduce((sum, s) => sum + s.hours, 0);
}

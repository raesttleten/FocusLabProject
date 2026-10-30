# FocusLap

Hola, soy Sharick Natalia Hernández Gómez y este es mi proyecto de grado para Ingeniería de Sistemas y Computación en la Universidad Católica de Colombia.

El trabajo se llama "Prototipo de espacio digital modular en la web basado en principios de psicología cognitiva para estimular la concentración académica de los estudiantes entre los 10 y los 13 años".

## De qué se trata

FocusLap es una página web para que niños de 10 a 13 años practiquen la atención mientras leen. La idea nació porque a muchos niños les cuesta quedarse concentrados en una lectura y quería hacer algo que se sintiera más como un juego que como una tarea.

El piloto se hace con un salón de un colegio en Bogotá y dura 3 días. Cada niño entra con un código (del E01 al E28), así que nunca se guardan nombres reales.

## Cómo funciona para los niños

Cada día leen los mismos 2 cuentos, "El último penalti" y "La huerta del salón", pero las preguntas cambian:

- Día 1: encontrar el tema y la idea principal
- Día 2: fijarse en las pistas que deja el autor
- Día 3: aprender a resumir

Por cada respuesta correcta ganan 10 puntos y en total pueden llegar a 160. Con esos puntos se van abriendo 6 juegos cortos que entrenan distintas partes de la atención: A Todo Foco, Repite el Patrón, Sigue el Punto, Encuentra el Par, Semáforo Atento y Caza Figuras.

También tienen una mascota, una luciérnaga que diseñé yo. Cada día empieza con frío y se calienta cuando el niño termina su primer cuento. Le pueden poner nombre y cambiarle el buzo entre lila, rosa, negro o verde. Además cada niño puede escoger el color de su página.

## Docente e investigadora

La docente ve cómo va cada estudiante: en qué día está, cuántos cuentos ha terminado, cuánto se demora leyendo y cuántas preguntas acierta a la primera.

La investigadora tiene un tablero con gráficas por componente de atención y puede descargar los datos en CSV para analizarlos. Todo sale siempre con el código del niño y nunca con su nombre.

## Sin internet

Como en los colegios el internet a veces falla, la página sigue funcionando sin conexión. Lo que el niño haga se guarda en el equipo y se sube solo cuando vuelve el internet.

## Con qué lo hice

La página está hecha con React y Vite. Firebase se encarga del inicio de sesión, la base de datos y la publicación. Las pruebas van con Vitest.

La página está publicada en https://focuslap-e8e7a.web.app

## Para correrlo en tu computador

Necesitas Node.js instalado. Copia `.env.example` como `.env.local` y pon ahí los datos de tu proyecto de Firebase. Después:

```
npm install
npm run dev
```

Para las pruebas se usa `npm test` y para publicar `npm run publicar`.

---

Espero que te guste mi página tanto como a mí me gustó hacerla. Ojalá algún día ideas como esta ayuden a que los niños aprendan de una forma más bonita y que la tecnología sea una aliada en su educación y no una distracción :)

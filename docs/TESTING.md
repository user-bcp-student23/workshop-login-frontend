# Pruebas del flujo de login y tareas

## Cierre H-01 y H-03 con ampliacion autorizada por JP — 19/10/2026

**Resultado funcional final: PASS con fixtures.** Suite: **118 aprobados,
0 fallidos, 0 omitidos**, 11 archivos, exit code 0. Build: exit code 0.
Cobertura de fuente: **91.69% lineas/statements, 94% ramas, 95.45% funciones**.
Servicio de sesion y ambos componentes modificados: **100% lineas**.
La auditoria global **sigue FAIL**, exit code 1, con 25 vulnerabilidades ajenas
a Lodash; no se considera un resultado de seguridad general aprobado.

### Secuencia y cambios

1. Baseline al retomar: 93 pasan / 3 fallan. JP autorizo ampliar
   [PLAN.md](../PLAN.md) para resolver BUG-01/02/04/05, antes excluidos.
2. Antes de producto se ampliaron las regresiones: 61 pasan / 15 fallan.
   BUG-04 ahora exige rechazo visible antes de renderizar los estados invalidos,
   en lugar de invocar el template sobre una tarea incompatible; no acepta el
   defecto anterior ni elimina la comprobacion del fallo.
3. Se rechazaron datos de login incompatibles antes de persistir, tareas no
   arreglo y estados no string; se notifico la vista al finalizar carga/error.
   Suite H-01: 107/107 y navegador con tarjeta, recarga y logout: PASS.
   Se actualizo H-01 en la matriz **antes** de iniciar H-03.
4. H-03: se escribieron 10 pruebas de preferencias; todas pasan con 4.17.21.
   Auditoria y registro verificaron 4.18.1 como version disponible corregida.
   Se actualizo solo Lodash y el lock, conservando import y semantica de merge.
   Las mismas 10 pruebas pasan despues.
5. Una comprobacion visual adicional del rechazo de login encontro que tampoco
   se actualizaba ese error asincrono (boton Ingresando). Prueba roja escrita
   antes de corregir: 0/1. Se completo la misma correccion de notificacion de
   vista de BUG-05 en login; suite y navegador finales vuelven a pasar.

### Matriz y evidencias por item

| flujo | caso | tipo | resultado esperado / observado |
|---|---|---|---|
| H-01 login -> tareas -> logout | Sesion nueva, recarga, Bearer/owner, preferencias y limpieza legacy | Caracterizacion | 4/4 antes y despues; mismo contrato HTTP; almacenamiento cambia deliberadamente a sessionStorage. |
| H-01 sesion | Lectura/escritura/borrado, JSON corrupto, preferencias intactas | Correccion / error | 16/16 pruebas de servicio; errores visibles/finalizacion en componentes. |
| BUG-01 | Usuario ausente, tipos de token/user/campos incompatibles | Error | No guardar ni navegar, error explicito; todas las variantes pasan. |
| BUG-02 | `{data:[]}` en vez de arreglo | Error | Error visible, no lista vacia silenciosa; Vitest y navegador pasan. |
| BUG-04 | Estado numero, null, ausente, objeto o arreglo | Error | Rechazar antes de renderizar con mensaje; 5/5, y caso numerico en navegador. |
| BUG-05 | Finalizacion asincrona de login/dashboard | Correccion | Notificar vista; tarjeta y recarga visibles; mensaje de login invalido visible y boton habilitado. |
| H-03 preferencias | Ausentes, vacias, parciales, false, anidadas/adicionales, JSON null legacy, JSON invalido, lectura fallida, instancia nueva, serializacion | Caracterizacion | 10/10 antes y despues, sin normalizacion nueva ni sustitucion por spread. |
| H-03 login -> tareas -> logout | Preferencias dark, showTips:false y view.columns:2 | Camino feliz | Conservadas con compact:false por defecto; tarjeta visible tras login/recarga; logout conserva preferencias. |

Directorio de todos los comandos:

```text
C:\Users\Usuario\Documents\T81438-johan-paucara\reqflow-workspace\workshop-login-frontend
```

| Comando ejecutado | Exit code | Resultado / evidencia |
|---|---|---|
| `npm test` (baseline) | 1 | 93 pasan / 3 fallan: [baseline](../EVIDENCIAS/continuacion-JP/baseline.txt). |
| `npm test -- src/app/login/login.component.spec.ts src/app/dashboard/dashboard.component.spec.ts` (regresiones previas) | 1 | 61 pasan / 15 fallan: [log](../EVIDENCIAS/continuacion-JP/regresiones-antes.txt). |
| `npm test -- src/app/login/login.component.spec.ts` (BUG-01 corregido) | 0 | 38/38: [log](../EVIDENCIAS/continuacion-JP/BUG-01-despues.txt). |
| `npm test -- src/app/dashboard/dashboard.component.spec.ts -t BUG-02` | 0 | 1 aprobado / 37 no seleccionados: [log](../EVIDENCIAS/continuacion-JP/BUG-02-despues.txt). |
| `npm test -- src/app/dashboard/dashboard.component.spec.ts -t BUG-04` | 0 | 5 aprobados / 33 no seleccionados: [log](../EVIDENCIAS/continuacion-JP/BUG-04-despues.txt). |
| `npm run test:coverage -- --coverage.reportOnFailure '--coverage.include=src/**/*.ts' --coverage.reportsDirectory=EVIDENCIAS/continuacion-JP/cobertura-H01` | 0 | H-01, 107/107 antes de iniciar H-03: [log](../EVIDENCIAS/continuacion-JP/H01-despues.txt). |
| `npm test -- src/app/login/login-preferences.spec.ts` | 0 / 0 | 10/10 [antes](../EVIDENCIAS/continuacion-JP/H03-caracterizacion-antes.txt) y [despues](../EVIDENCIAS/continuacion-JP/H03-caracterizacion-despues.txt). |
| `npm test -- src/app/login/login.component.spec.ts -t BUG-05` (antes de corregir login) | 1 | 1 falla / 38 no seleccionados: [log](../EVIDENCIAS/continuacion-JP/BUG-05-login-antes.txt). |
| `npm run test:coverage -- --coverage.reportOnFailure '--coverage.include=src/**/*.ts' --coverage.reportsDirectory=EVIDENCIAS/continuacion-JP/cobertura-cierre` | 0 | 118/118, ningun omitido; [suite](../EVIDENCIAS/continuacion-JP/suite-cierre.txt), [HTML](../EVIDENCIAS/continuacion-JP/cobertura-cierre/index.html), [JSON](../EVIDENCIAS/continuacion-JP/cobertura-cierre/coverage-summary.json). |
| `npm run build` | 0 | [Build final](../EVIDENCIAS/continuacion-JP/build-cierre.txt); advertencia CommonJS de merge permanece. |
| `npm ci --ignore-scripts --logs-dir=EVIDENCIAS\continuacion-JP\npm-logs` | 0 en reintento | Lock reproducible sin flag legacy: [log final](../EVIDENCIAS/continuacion-JP/H03-ci-final.txt). El primer intento fallo por esbuild ocupado por nuestro servidor, luego detenido. |
| `npm run audit:workshop` | 1 / 1 | [Antes](../EVIDENCIAS/continuacion-JP/H03-audit-antes.txt): 26; [despues](../EVIDENCIAS/continuacion-JP/H03-audit-despues.txt): 25, sin Lodash. No se oculta el fallo global. |
| `npm start -- --port 4317` + navegador integrado | No aplica para aserciones de herramienta | HTTP 200; [H-01](../EVIDENCIAS/continuacion-JP/navegador-H01.txt) y [cierre](../EVIDENCIAS/continuacion-JP/navegador-final.txt): PASS con fixtures, servidor temporal detenido al finalizar. |

No se relajaron umbrales ni se desactivaron tests; el selector de cobertura mide
fuente `src` en vez de instrumentar copias/logs HTML de EVIDENCIAS. Los filtros
de ejecuciones parciales se declaran, y la suite de cierre ejecuta todos los tests.

Diffs locales: [H-01](../EVIDENCIAS/continuacion-JP/H-01.diff),
[H-03](../EVIDENCIAS/continuacion-JP/H-03.diff),
[BUG-01](../EVIDENCIAS/continuacion-JP/BUG-01.diff),
[BUG-02](../EVIDENCIAS/continuacion-JP/BUG-02.diff),
[BUG-04](../EVIDENCIAS/continuacion-JP/BUG-04.diff),
[BUG-05 dashboard](../EVIDENCIAS/continuacion-JP/BUG-05.diff) y
[BUG-05 login](../EVIDENCIAS/continuacion-JP/BUG-05-login.diff).
Son diffs contra snapshots locales, no contra HEAD con cambios previos de H-02.
La [matriz](../HALLAZGOS.md) marca H-01 y H-03 Resuelto.

### Limites, pendientes y documentos consultados

- Audit global pendiente: 25 vulnerabilidades (9 moderadas, 10 altas, 6 criticas)
  fuera del alcance; [detalle de H-03 e incidencias de npm](../EVIDENCIAS/continuacion-JP/cve-fix-summary.md).
- No se probaron backends reales ni su autorizacion, CORS o expiracion.
- sessionStorage no elimina acceso por JavaScript/XSS ni revoca tokens del servidor.
- No hay validacion exhaustiva de todos los campos de tareas.
- Los otros items pendientes de la matriz no se implementaron.
- Runner de navegador en CI sigue propuesto, no agregado. Las pruebas visuales
  aqui ejecutadas usan el navegador integrado; no se afirman ejecuciones CLI
  Playwright que no ocurrieron.

Consultados: [PLAN.md](../PLAN.md), [ENDPOINTS.md](ENDPOINTS.md),
[GOOD_PRACTICES.md](GOOD_PRACTICES.md), [REGLAS.md](../REGLAS.md),
[HALLAZGOS.md](../HALLAZGOS.md), informe anterior, codigo y tests del flujo,
auditorias npm, registro de Lodash y herramienta de evaluacion CVE.

## Informe historico: implementacion H-01 inicialmente bloqueada — 19/10/2026

**Veredicto actual: FAIL; H-01 no cerrado y H-03 no iniciado.** Se implemento
la mitigacion de persistencia del plan aprobado, sin modificar HTTP ni
dependencias. El informe anterior se conserva abajo como evidencia historica,
no como descripcion del almacenamiento actual.

Diff conceptual de H-01: nuevo servicio tipado para token/usuario en
`sessionStorage`, limpieza legacy sin migracion, componentes conectados al
servicio, errores de almacenamiento visibles y logout que conserva preferencias.
El parseo de sesion queda dentro del manejo de errores del dashboard: las tres
regresiones BUG-03 ahora pasan como consecuencia directa de esa frontera.
BUG-01, BUG-02 y BUG-04 siguen fallando; no se modificaron sus expectativas.
La sesion continua accesible a JavaScript y no se incorpora cookie `HttpOnly`.

| flujo | caso | tipo | resultado esperado / observado |
|---|---|---|---|
| Login -> tareas -> logout | Nueva instancia de dashboard tras login | Caracterizacion antes/despues | Mismos POST, GET, propietario, Bearer, etiquetas y logout. 4/4 antes y 4/4 despues. Cambia deliberadamente el almacenamiento. |
| Sesion | Guardado, lectura, instancia nueva, claves legacy y preferencias | Correccion | Token/usuario solo en sessionStorage; sin migrar legacy; preferencias persistentes intactas. 16/16 tests del servicio pasan. |
| Sesion y UI | JSON de usuario corrupto, fallo de lectura/escritura/borrado, navegacion rechazada | Error | Error explicito y estados finalizados; pruebas propias del item pasan. La suite filtrada cuenta 26 aprobados y 59 no seleccionados. |
| Navegador | Login, recarga misma pestaña y logout | Correccion | Almacenamiento y saludo tras recarga comprobados; logout elimina ambas ubicaciones sin borrar preferencias. Asersiones complementarias pasan. |
| Navegador | Tarea Requirement visible tras login | Regresion preexistente BUG-05 | Falla otra vez al esperar 7000 ms; impide aprobar el flujo completo. |

Todas las ejecuciones se realizaron desde:

```text
C:\Users\Usuario\Documents\T81438-johan-paucara\reqflow-workspace\workshop-login-frontend
```

| Comando realmente ejecutado | Salida | Resultado y evidencia |
|---|---|---|
| `npm test -- src/app/auth-tasks-flow.spec.ts` antes de producto | 0 | 4 aprobados; [caracterizacion-antes.txt](../EVIDENCIAS/implementacion-H-01/caracterizacion-antes.txt). |
| `npm test` antes de producto | 1 | 71 aprobados, 6 fallidos, 0 omitidos; [suite-antes.txt](../EVIDENCIAS/implementacion-H-01/suite-antes.txt). |
| `npm test -- src/app/services/session.service.spec.ts` antes de crear servicio | 1 | Fase roja: modulo inexistente, sin tests ejecutados; [correccion-antes.txt](../EVIDENCIAS/implementacion-H-01/correccion-antes.txt). |
| `npm test -- src/app/services/session.service.spec.ts src/app/auth-tasks-flow.spec.ts` despues | 0 | 20 aprobados, 0 fallidos/omitidos; [correccion-despues.txt](../EVIDENCIAS/implementacion-H-01/correccion-despues.txt). |
| `npm test -- src/app/services/session.service.spec.ts src/app/auth-tasks-flow.spec.ts src/app/login/login.component.spec.ts src/app/dashboard/dashboard.component.spec.ts -t 'H-01\|BUG-03\|Login -> tasks'` | 0 | 26 aprobados, 59 no seleccionados por filtro, no es aprobacion de suite completa; [pruebas-item.txt](../EVIDENCIAS/implementacion-H-01/pruebas-item.txt). |
| `npm run test:coverage -- --coverage.reportOnFailure --coverage.reportsDirectory=EVIDENCIAS/implementacion-H-01/cobertura` | 1 | 93 aprobados, 3 fallidos, 0 omitidos. Cobertura global 34.85% incluye copias de evidencia y JS de informes anteriores: no es una medicion exclusiva de producto; [suite-despues.txt](../EVIDENCIAS/implementacion-H-01/suite-despues.txt). |
| `npm run test:coverage -- --coverage.reportOnFailure '--coverage.include=src/**/*.ts' --coverage.reportsDirectory=EVIDENCIAS/implementacion-H-01/cobertura-src` | 1 | 93 aprobados, 3 fallidos, 0 omitidos. Fuente: 91.11% lineas/statements; 92.77% ramas; 95.45% funciones; [cobertura-src.txt](../EVIDENCIAS/implementacion-H-01/cobertura-src.txt), [HTML](../EVIDENCIAS/implementacion-H-01/cobertura-src/index.html), [JSON](../EVIDENCIAS/implementacion-H-01/cobertura-src/coverage-summary.json). |
| `npm run build` | 0 | Compila; advertencia CommonJS Lodash conservada; [build.txt](../EVIDENCIAS/implementacion-H-01/build.txt). |
| `npm start -- --port 4317`, comprobacion con navegador integrado | No aplica: herramienta sin exit code de test | Readiness HTTP 200. Tarea no visible en 7000 ms; comprobaciones de sesion/recarga/logout adicionales correctas; [navegador.txt](../EVIDENCIAS/implementacion-H-01/navegador.txt). Servidor detenido. |

El servicio y ambos componentes modificados alcanzan **100% de lineas** en la
medicion de fuente; cumple el minimo 85%, sin alterar configuracion, exclusiones
persistentes, umbrales ni tests fallidos. El selector de cobertura mide `src`,
no oculta fallos: la suite completa sigue devolviendo 1. El helper de navegador
no es un test Vitest y su resultado se informa por separado.

Se conserva [H-01.diff](../EVIDENCIAS/implementacion-H-01/H-01.diff) contra las
instantaneas locales previas a H-01, no contra HEAD (que ya tenia cambios de
H-02). El cierre y siguiente paso se mantienen en
[HALLAZGOS.md](../HALLAZGOS.md). No se ejecutaron auditorias/instalaciones ni se
cambio Lodash: H-03 esta bloqueado por la secuencia solicitada.

Pendientes: resolver/autorizar en una tarea separada los fallos ajenos al plan,
volver a verificar el flujo completo y solo entonces decidir el cierre de
H-01 y continuar con H-03. No se omiten tests ni se inventa una exencion del gate.

Fuentes de esta actualizacion: [PLAN.md](../PLAN.md),
[ENDPOINTS.md](ENDPOINTS.md), [GOOD_PRACTICES.md](GOOD_PRACTICES.md),
[REGLAS.md](../REGLAS.md), [HALLAZGOS.md](../HALLAZGOS.md), codigo/pruebas
del servicio, login, dashboard y flujo, y ejecuciones enlazadas.

## Informe historico anterior a H-01

## Alcance y resultado

Fecha: **19/10/2026**. Directorio de ejecucion de todos los comandos:

```text
C:\Users\Usuario\Documents\T81438-johan-paucara\reqflow-workspace\workshop-login-frontend
```

Se ampliaron las pruebas Vitest existentes y se agregaron pruebas que conectan
componentes, servicios y `HttpClient`, ademas de comprobar el transporte Angular
con un `XMLHttpRequest` simulado. No se modifico codigo productivo, contratos,
dependencias ni umbrales. Todos los `*.spec.ts` nuevos estan bajo `src` y son
descubiertos por `npm test`.

**Resultado general: FAIL.** La suite final tiene **77 tests: 71 pasan,
6 fallan, 0 omitidos**. Los seis fallos son reproducciones de defectos, no
excepciones ocultadas con `skip`, `todo` o `it.fails`. La comprobacion adicional
en navegador tambien falla al esperar una tarea visible. La cobertura global
supera 85%, pero **cobertura alta no equivale a funcionamiento correcto**.

Las afirmaciones de UI en Vitest verifican propiedades usadas por el template,
no un DOM renderizado. La comprobacion en navegador verifica la pantalla real
con respuestas HTTP simuladas. Ninguna prueba acredita el contrato o
disponibilidad de los backends reales, su autorizacion ni su CORS.

## Matriz de pruebas

Los nombres `BUG-*` identifican reproducciones para este informe, no decisiones
de remediacion. La matriz de seguimiento de cambios sigue siendo
[HALLAZGOS.md](../HALLAZGOS.md).

| flujo | caso | tipo | resultado esperado |
|---|---|---|---|
| Login -> tareas -> logout | Credenciales validas, respuesta de login, consulta con la sesion guardada, tarea y cierre | Camino feliz | POST y GET exactos, Bearer de la sesion, etiqueta y estado correctos; logout borra usuario/token, conserva preferencias y evita una nueva consulta sin sesion. Pasa en [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts). |
| Login -> tareas en navegador | Formulario real y tarjeta `Requirement` tras navegar | Camino feliz | Tarjeta visible en 7000 ms y limpieza al finalizar. **Falla: BUG-05** en [browser-flows.mjs](../tests/browser-flows.mjs). |
| Login | Usuario vacio, espacios, `null`, `undefined` | Caso borde | Mensaje de usuario requerido, sin HTTP ni navegacion; `busy` falso. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Contrasena vacia, espacios, `null`, `undefined` | Caso borde | Mensaje de contrasena requerida, sin HTTP ni navegacion; `busy` falso. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Credenciales no vacias con espacios alrededor | Caso borde | El body conserva los espacios; la validacion no recorta el request. Pasa en [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts). |
| Login | Body nulo, sin token, token vacio o nulo | Caso borde | Mensaje de backend sin token, no persiste ni navega y restaura `busy`. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | `401`, `403`, `400`, `500`, `503` | Error | Muestra `message`, registra error, termina `busy`, no navega ni sobrescribe sesion previa. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Backend caido/red, CORS o cancelacion reportados como status `0` | Error | Muestra error de transporte y habilita nuevamente el boton. Eventos simulados; no verifica una politica CORS real. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Timeout a 5000 ms | Error | La peticion configura timeout de 5000; no se completa a 4999 ms y rechaza al alcanzar 5000 ms en el transporte simulado. El componente muestra error y restaura `busy`. Pasa en [http-transport.spec.ts](../src/app/services/http-transport.spec.ts) y [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | JSON invalido con status `200` | Error | Error de parseo, sin navegacion y `busy` falso. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts); el parseo real de Angular se ejercita en [http-transport.spec.ts](../src/app/services/http-transport.spec.ts). |
| Login | Mensaje backend, Error ordinario o valor desconocido | Error | Prioridad del mensaje no vacio, mensaje tecnico o fallback `Error desconocido`. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts) y [http-error-message.spec.ts](../src/app/utils/http-error-message.spec.ts). |
| Login | Falla al escribir almacenamiento | Error | Error visible y registrado, `busy` falso, no navega. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts); no se afirma rollback de escrituras parciales. |
| Login | Rechazo de la promesa de navegacion | Error | Error visible y registrado, `busy` falso. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Preferencias guardadas con JSON invalido | Error | Registra el error de preferencias y conserva defaults. Pasa en [login.component.spec.ts](../src/app/login/login.component.spec.ts). |
| Login | Token truthy pero usuario ausente | Error / regresion | No deberia aceptar una sesion incompatible con el contrato `LoginResponse`. **Falla: BUG-01**; no se ajusta el test para aceptar datos corruptos. |
| Tareas | No hay token | Caso borde | Navega a login y no solicita tareas. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Arreglo vacio o todas archivadas | Caso borde | `visibleTasks` vacio, carga terminada y sin error; corresponde al mensaje de lista vacia del template. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Estados conocidos, desconocidos y vacio | Caso borde | Traducciones documentadas y fallback al estado recibido. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Login -> tareas | Token no vacio rechazado por la API | Error | Login no verifica firma; GET envia ese token, `401` muestra `detail` sin logout automatico y permite logout local. Pasa en [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts). |
| Tareas | Token invalido/expirado: `401` o `403` | Error | Muestra error, finaliza carga, mantiene sesion y no redirige. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts); no inventa redireccion automatica. |
| Tareas | Otros HTTP: `400`, `500`, `503` | Error | Mismo manejo comun, sin borrar sesion ni redirigir. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Backend caido/red, CORS, cancelacion o timeout de transporte | Error | Muestra el mensaje HTTP y finaliza carga. Eventos simulados, no una interrupcion real del backend. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Peticion no responde durante 6000 ms | Error / limite conocido | No inventar un timeout de 5000 ms para tareas: no hay timeout configurado y sigue cargando hasta resolver el transporte. Pasa en [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts). Es un riesgo residual, no una garantia de espera acotada. |
| Tareas | JSON invalido con status `200` | Error | Angular produce error de parseo; componente informa error y finaliza carga. Pasa en [http-transport.spec.ts](../src/app/services/http-transport.spec.ts) y [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Body nulo o elemento nulo | Error | Muestra error de procesamiento y termina carga; no valida que el texto sea amigable. Pasa en [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts). |
| Tareas | Wrapper `{ "data": [] }` inesperado | Error / regresion | Debe reportar respuesta incompatible, no aparentar una lista vacia valida. **Falla: BUG-02**. |
| Tareas | JSON de usuario invalido o almacenamiento inaccesible | Error / regresion | Inicializacion sin rechazo no manejado, con carga finalizada. **Fallan dos casos de BUG-03**. |
| Tareas | Usuario guardado como JSON `null` | Error / regresion | Recuperacion con estado de usuario renderizable, no `null`. **Falla otro caso de BUG-03**. |
| Tareas | `status` numerico | Error / regresion | No debe lanzar al preparar la etiqueta de estado para el template. **Falla: BUG-04**. |
| HTTP | Headers, body JSON y arreglo directo de tareas | Camino feliz / contrato | Headers automaticos, serializacion, ausencia de body en GET y respuesta sin wrapper. Pasa en [http-transport.spec.ts](../src/app/services/http-transport.spec.ts) y [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts). |

## Codigo de los tests

Codigo completo ejecutable, con imports, preparacion y limpieza:

- [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts): cuatro recorridos
  con componentes y servicios reales; solo transporte, router y almacenamiento
  estan sustituidos. Comprueba estado pendiente antes de responder.
- [http-transport.spec.ts](../src/app/services/http-transport.spec.ts): tres tests
  con `HttpClient` y `HttpXhrBackend` reales. El doble de XHR emite eventos,
  recibe el timeout de Angular y permite probar parseo y headers.
- [login.component.spec.ts](../src/app/login/login.component.spec.ts):
  validacion parametrizada, estados HTTP, errores de transporte, respuestas
  inesperadas, almacenamiento, navegacion y regresion BUG-01.
- [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts):
  errores, estados, bordes y regresiones BUG-02 a BUG-04.
- [browser-flows.mjs](../tests/browser-flows.mjs): funcion
  `verifyBrowserFlow(page, baseUrl)` para una pagina Playwright del frontend
  local. Intercepta solo los dos endpoints, prueba el renderizado y limpia la
  sesion y rutas en `finally`. No se incorpora al descubrimiento de Vitest:
  es la comprobacion de navegador ejecutada con la herramienta integrada.

Fragmentos literales de las pruebas nuevas; el setup necesario esta en los
archivos enlazados, no son una suite adicional ni sustituyen esos archivos.

### Camino feliz: consulta con sesion y logout

Fragmento de [auth-tasks-flow.spec.ts](../src/app/auth-tasks-flow.spec.ts), dentro
del test `logs in, reads the persisted session to load tasks, then logs out`,
despues de completar el POST:

```typescript
const loading = dashboard.ngOnInit();
expect(dashboard.loading).toBe(true);
expect(requests[1].method).toBe('GET');
expect(requests[1].url).toBe('http://localhost:8000/api/tasks?owner=student');
expect(requests[1].headers.get('Authorization')).toBe('Bearer test-token');
expect(requests[1].body).toBeNull();
replies[1].next(new HttpResponse({
  status: 200,
  body: [{
    title: 'Requirement', description: '', status: 'TODO', priority: 'HIGH', owner: 'student'
  }]
}));
await loading;
expect(dashboard.error).toBe('');
expect(dashboard.loading).toBe(false);
expect(dashboard.visibleTasks).toHaveLength(1);
expect(dashboard.visibleTasks[0].label).toBe('HIGH · STUDENT');
expect(dashboard.statusLabel(dashboard.visibleTasks[0].status)).toBe('Por hacer');
```

### Casos borde: contrasena vacia

De [login.component.spec.ts](../src/app/login/login.component.spec.ts):

```typescript
it.each([null, undefined, '', '   '])('rejects empty password %s without HTTP', async value => {
  const component = new LoginComponent(router, authService);
  component.username = 'student';
  component.password = value;
  await component.login();
  expect(component.message).toBe('<strong>Ingrese una contraseña.</strong>');
  expect(login).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
  expect(component.busy).toBe(false);
});
```

### Errores: token rechazado por tareas

De [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts);
la tabla incluye `401` y `403`, ademas de otros errores HTTP:

```typescript
it.each([401, 403, 400, 500, 503])('handles task HTTP %i and preserves the session', async status => {
  storage.setItem('workshop_token', 'invalid-or-expired-token');
  storage.setItem('workshop_user', JSON.stringify({ username: 'student' }));
  getTasks.mockRejectedValue(new HttpErrorResponse({ status, error: { detail: 'Access rejected' } }));
  await component.ngOnInit();
  expect(component.error).toBe('Access rejected');
  expect(component.loading).toBe(false);
  expect(component.visibleTasks).toEqual([]);
  expect(storage.getItem('workshop_token')).toBe('invalid-or-expired-token');
  expect(navigate).not.toHaveBeenCalled();
});
```

### Errores: umbral exacto de timeout de login

Fragmento de [http-transport.spec.ts](../src/app/services/http-transport.spec.ts).
Se usan temporizadores falsos y un XHR simulado; no se atribuye a este test una
medicion de latencia de red ni se espera cinco segundos reales:

```typescript
expect(xhr.timeout).toBe(5000);
let settled = false;
void result.then(() => { settled = true; });
await vi.advanceTimersByTimeAsync(4999);
expect(settled).toBe(false);
await vi.advanceTimersByTimeAsync(1);
const error = await result;
expect(error).toBeInstanceOf(HttpErrorResponse);
if (!(error instanceof HttpErrorResponse)) throw new Error('Expected HTTP timeout');
expect(error.status).toBe(0);
expect(error.error).toBeInstanceOf(DOMException);
expect(error.error.name).toBe('TimeoutError');
```

### Regresion que falla: no esconder un wrapper inesperado

De [dashboard.component.spec.ts](../src/app/dashboard/dashboard.component.spec.ts):

```typescript
it('BUG-02: reports an unexpected tasks wrapper instead of a successful empty list', async () => {
  storage.setItem('workshop_token', 'test-token');
  getTasks.mockResolvedValue({ data: [] });
  await component.ngOnInit();
  expect(component.error).not.toBe('');
  expect(component.loading).toBe(false);
});
```

No se cambio esa asercion a `expect(component.error).toBe('')` para aparentar
que una respuesta incompatible es correcta.

## Comandos y resultados realmente ejecutados

Todos se ejecutaron en el directorio absoluto del inicio de este documento.
El ejecutor integrado `runTests` no descubrio tests; se uso el comando canonico
del proyecto con npm. No se instalo ningun paquete.

| Ejecucion | Comando | Codigo de salida | Resultado real / evidencia |
|---|---|---|---|
| Linea base, antes de agregar casos | `npm test` | `0` | 18 aprobados, 7 archivos; salida observada en la sesion, sin log persistido de esta ejecucion. |
| Primer intento ampliado | `npm test -- --reporter=verbose` | `1` | 62 aprobados, 11 fallos. [Log](../EVIDENCIAS/testing-flujos-2026-10-19/pruebas.txt). Seis eran regresiones y cinco eran errores del fixture/asercion de los tests. |
| Correccion de fixtures | `npm test -- --reporter=verbose` | `1` | 67 aprobados, 6 fallos. [Log](../EVIDENCIAS/testing-flujos-2026-10-19/pruebas-finales.txt). |
| Primera cobertura ampliada | `npm run test:coverage -- --reporter=verbose` | `1` | 70 aprobados, 6 fallos. [Log](../EVIDENCIAS/testing-flujos-2026-10-19/cobertura.txt). Vitest no emitio tabla de cobertura al fallar; no se atribuye una medicion a esta ejecucion. |
| Suite final | `npm test -- --reporter=verbose` | `1` | **71 aprobados, 6 fallos, 0 omitidos**, 9 archivos (7 pasan, 2 fallan). [Log final](../EVIDENCIAS/testing-flujos-2026-10-19/suite-final.txt). |
| Cobertura final, incluso con fallos | `npm run test:coverage -- --reporter=verbose --coverage.reportOnFailure` | `1` | Mismos **71 aprobados y 6 fallos**; cobertura global **88.88% lineas/statements, 90.62% ramas, 94.11% funciones**. [Log](../EVIDENCIAS/testing-flujos-2026-10-19/cobertura-final.txt). La opcion solo permite emitir el informe; no suprime fallos ni cambia umbrales. |
| Compilacion | `npm run build` | `0` | Build correcto, con advertencia preexistente CommonJS de `lodash/merge`. [Log](../EVIDENCIAS/testing-flujos-2026-10-19/build.txt). |
| Startup temporal | `npm start -- --port 4317` | No aplica: servidor detenido al terminar | `Invoke-WebRequest http://localhost:4317` devolvio `200`. No se levanto ni inspecciono otro componente del workspace. |
| Navegador integrado | `openBrowserPage` y `runPlaywrightCode` con el cuerpo de `verifyBrowserFlow(page)` | No aplica: la herramienta no devuelve exit code de proceso | **FAIL**, espera de tarjeta agotada a 7000 ms, reproducido dos veces; logout y limpieza ejecutados. [Evidencia](../EVIDENCIAS/testing-flujos-2026-10-19/navegador.txt). |

Los cinco fallos de construccion de tests del primer intento se corrigieron
sin tocar codigo productivo: `it.each` expandia arreglos en argumentos en vez
de entregarlos como cuerpo, y el fixture de red usaba `Error.message` como si
fuera un evento de transporte. Ahora los eventos de red no tienen mensaje de
backend y timeout utiliza `DOMException('Request timed out', 'TimeoutError')`.
Los seis tests de regresion conservan sus expectativas originales.

### Cobertura

Informe congelado de esta ejecucion:
[JSON](../EVIDENCIAS/testing-flujos-2026-10-19/coverage-summary.json) y
[HTML navegable](../EVIDENCIAS/testing-flujos-2026-10-19/cobertura-html/index.html).

| Archivo productivo ejercitado | Lineas | Ramas | Funciones |
|---|---|---|---|
| LoginComponent | 100% | 100% | 100% |
| DashboardComponent | 100% | 93.75% | 100% |
| AuthService | 100% | 100% | 100% |
| TasksService | 100% | 100% | 100% |
| Extractor de errores | 100% | 94.44% | 100% |
| Arranque y environment | 100% | 100% | 100% |

El codigo productivo no cambio en esta tarea. La meta de 85% queda superada en
las superficies del flujo verificadas y en la cobertura global de lineas; no se
ocultan los archivos ajenos al flujo sin cobertura ni se excluyen ramas para
elevar la cifra. Los modelos son interfaces sin comportamiento ejecutable.
Los tests y sus helpers no son el denominador del informe V8.

## Fallos confirmados, pendientes y propuestas

### Fallos confirmados (sin correccion de producto en esta tarea)

| Identificador local | Reproduccion | Observado | Impacto y evidencia |
|---|---|---|---|
| BUG-01 | Login con `{ token: 'test-token' }`, sin usuario | Navega a dashboard y guarda token aunque la respuesta no cumple la interfaz. Un test falla. | Sesion incompatible. [Test](../src/app/login/login.component.spec.ts), [log final](../EVIDENCIAS/testing-flujos-2026-10-19/suite-final.txt). |
| BUG-02 | Tareas devuelve `{ data: [] }` | No genera error, aparenta lista vacia valida. Un test falla. | Fallo silencioso de contrato. [Test](../src/app/dashboard/dashboard.component.spec.ts), [log final](../EVIDENCIAS/testing-flujos-2026-10-19/suite-final.txt). |
| BUG-03 | Usuario guardado como `{`, como `null`, o lectura de almacenamiento que lanza | JSON invalido y almacenamiento inaccesible rechazan la inicializacion; usuario `null` permanece no renderizable. Tres tests fallan. | Recuperacion de sesion/UI incompleta. [Tests](../src/app/dashboard/dashboard.component.spec.ts), [log final](../EVIDENCIAS/testing-flujos-2026-10-19/suite-final.txt). |
| BUG-04 | Tarea con `status: 42` | `statusLabel` lanza al ejecutar `toUpperCase()`. Un test falla. | Posible error de renderizado fuera del catch de HTTP. [Test](../src/app/dashboard/dashboard.component.spec.ts), [log final](../EVIDENCIAS/testing-flujos-2026-10-19/suite-final.txt). |
| BUG-05 | Login de navegador con respuestas simuladas validas | Navega al dashboard, pero la tarjeta no aparece dentro de 7000 ms. | El flujo visible no se da por aprobado aunque pase el test de estado. [Codigo](../tests/browser-flows.mjs), [evidencia](../EVIDENCIAS/testing-flujos-2026-10-19/navegador.txt). Causa raiz no aislada; sincronizacion de renderizado es hipotesis, no conclusion. |

Las expectativas de rechazo seguro/recuperacion en los tests BUG-01 a BUG-04
expresan los defectos de respuesta inesperada y sesion corrupta ya descritos en
ENDPOINTS; **no se presentan como comportamiento que hoy cumpla el cliente**.
No se introducen endpoints, refresh, revocacion ni redireccion automatica por
401 que no existan en el contrato.

### Pendientes / no verificado

- Corregir y volver a ejecutar las regresiones de producto; esta entrega no
  aprueba el flujo mientras existan fallos. Se requiere una tarea de correccion
  antes de declarar el resultado general PASS.
- Validar con los backends reales los codigos, esquemas, CORS, expiracion y
  autorizacion del filtro `owner`. No se accedio a otros repositorios ni se
  sustituyeron esas preguntas por datos inventados.
- Verificar en navegador las pantallas de cada error una vez corregido el
  recorrido visible. Hoy la cobertura detallada de errores es de estado del
  componente/transporte, no de DOM.
- Tareas carece de timeout de aplicacion; el test documenta la espera pendiente.
  No se afirma que la consulta siempre finalice dentro de un plazo.
- La ejecucion local del helper de navegador requiere una pagina Playwright
  provista por un runner. El proyecto no tiene paquete Playwright instalado:
  aqui se uso el navegador integrado, sin agregar dependencias.

### Pruebas propuestas, no ejecutadas

- Una suite de navegador independiente y reproducible desde npm/CI, con
  instalacion y runner justificados antes de modificar manifiestos.
- Recuperacion visual tras corregir BUG-01 a BUG-05, sin cambiar las
  expectativas de los tests para aprobar el comportamiento defectuoso.
- Escrituras parciales de sesion y errores de logout: requieren definir el
  comportamiento de recuperacion antes de agregar una expectativa no descrita.
  Se probaron el fallo de escritura y el de navegacion del login, no una
  garantia de rollback que el cliente no implementa.

## Entorno y veredicto

```text
environment:
  node: AVAILABLE — v26.9.0
  docker: UNAVAILABLE — Get-Command docker no encontro el ejecutable
  playwright: AVAILABLE — navegador integrado; paquete npm local no instalado
  infra-tier: simulacion HTTP local — servicios externos no verificados
  browser-tier: Playwright integrado — sin descargas ni dependencias nuevas
startup: PASS — npm start -- --port 4317; HTTP 200; tiempo no medido
integration: FAIL — exit_code: 1; passed: 71; failed: 6; skipped: 0
  scope: suite Vitest completa, incluye tests unitarios y componentes/servicios/HTTP
e2e: FAIL — exit_code: N/A (herramienta); recorrido visible fallido
  scope: navegador con backends interceptados, no integracion con servicios reales
overall: FAIL — regresiones reproducidas y tarea no visible; cobertura no es aprobacion
```

El servidor temporal se detuvo despues de las comprobaciones. No se dejo un
proceso de desarrollo activo ni se usaron datos persistentes de los servicios.

## Documentos consultados

- [ENDPOINTS.md](ENDPOINTS.md): casos, contratos, errores y limites del cliente.
- [REGLAS.md](../REGLAS.md): cobertura minima y reglas del laboratorio.
- [PLAN.md](../PLAN.md): estrategia de caracterizacion de H-02.
- [package.json](../package.json) y [vitest.config.ts](../vitest.config.ts):
  comandos existentes, descubrimiento y cobertura.
- Codigo y tests de login, dashboard, servicios y extractor enlazados arriba.
- [Implementacion HTTP instalada de Angular](../node_modules/@angular/common/fesm2022/_module-chunk.mjs):
  firmas y eventos del transporte para escribir el doble de XHR sin cambiar
  su parseo ni manejo de errores.

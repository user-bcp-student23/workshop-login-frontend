# Plan de correccion — H-01 y H-03

## Seleccion y estado de revision

Se seleccionan exclusivamente los dos items **Pendiente** de mayor prioridad
en [HALLAZGOS.md](HALLAZGOS.md):

| Item | Severidad registrada | Motivo de seleccion |
|---|---|---|
| H-01 | alta | Unico pendiente de severidad alta; token persistente accesible a JavaScript del mismo origen. |
| H-03 | media | Primer pendiente de severidad media en el orden de la matriz; desempate por ID ascendente entre H-03, H-04, H-05 y H-06. |

H-02 y H-07 constan como Resuelto y no se incluyen. Los avisos de auditoria de
Lodash no cambian automaticamente la severidad media registrada de H-03.
Los defectos BUG-01 a BUG-05 del informe de pruebas no se incorporan como
items nuevos ni se usan para sustituir el backlog indicado por el usuario.

**Aprobacion:** el usuario confirmo expresamente el 19/10/2026 que este plan
fue revisado y aprobado y solicito su implementacion en orden. No indico nombre
del revisor de esta tanda. La revision anterior
registrada por Michael Teran el 19/10/2026 correspondia solamente a H-02 y no
constituye aprobacion de H-01/H-03; la autorizacion de esta tanda es el mensaje
posterior del usuario. El alcance propuesto a continuacion se mantiene.

## Item: H-01 — Token de sesion persistido en localStorage

### Ampliacion autorizada por JP — 19/10/2026

Tras el bloqueo de la primera implementacion, JP autorizo expresamente ampliar
este plan para corregir BUG-01, BUG-02, BUG-04 y BUG-05 antes de cerrar H-01.
Esta autorizacion reemplaza, solo para esos cuatro casos, las exclusiones de
respuesta/renderizado indicadas abajo; no agrega otros items del backlog.

- BUG-01: rechazar login con token/usuario incompatibles antes de persistir,
  con error visible, sin alterar el esquema HTTP valido.
- BUG-02: rechazar tareas que no sean un arreglo con error visible.
- BUG-04: rechazar estados no string antes de renderizar; conservar tareas
  validas y las traducciones existentes.
- BUG-05: investigar la actualizacion del dashboard tras la respuesta asincrona
  y corregir la notificacion de renderizado si se confirma la causa. La misma
  frontera asincrona del login se incluye al confirmar en navegador que el
  error nuevo de BUG-01 no se mostraba y el boton quedaba en Ingresando.
- Pruebas primero: conservar las regresiones existentes, agregar variantes de
  tipos inesperados y notificacion de vista; repetir el recorrido de navegador
  con tarjeta visible, recarga y logout.
- Archivos adicionales permitidos: modelos de autenticacion/tarea si requieren
  guards compartidos; componentes, sus specs y helper de navegador ya incluidos.
  Cada bloqueo tendra diff local separado en EVIDENCIAS, sin cambios de URL,
  metodos, cuerpo valido, headers ni timeouts.
- Gate: suite completa, cobertura >=85% del codigo modificado, build y navegador
  deben pasar antes de cerrar H-01/avanzar a H-03.

### Item, problema y alcance propio

Corresponde a H-01, Vulnerabilidad de severidad alta y estado Pendiente.
El login escribe el token en
[login.component.ts](src/app/login/login.component.ts#L48); el dashboard lo lee
y elimina desde
[dashboard.component.ts](src/app/dashboard/dashboard.component.ts#L37).
La exposicion a JavaScript y la persistencia son observables; no se ha
demostrado una via de robo del token.

Este item abarca exclusivamente el almacenamiento de token/usuario y su uso
coherente en login, consulta y logout. No incluye Lodash, renderizado HTML,
validacion de respuestas externas, nuevos guards, refresh ni revocacion.

### Cambio propuesto

1. Introducir un `SessionService` tipado como unico responsable del
   almacenamiento de token y usuario, centralizando sus claves. Los componentes
   conservan la coordinacion de UI y navegacion, y dejan de leer/escribir
   directamente esas dos claves.
2. Proponer `sessionStorage` para token y usuario como alternativa acotada al
   laboratorio, sin dependencia ni cambio de backend. El token sigue disponible
   para el GET con Bearer y se conserva al recargar la misma pestaña.
3. Hacer explicito el cambio de duracion: la sesion deja de persistir
   indefinidamente como con `localStorage`. `sessionStorage` esta vinculado a la
   sesion de la pestaña; restauracion/duplicacion de pestañas depende del
   navegador y no se promete revocacion al cerrarla.
4. No migrar el token antiguo de `localStorage` a la nueva sesion: eliminar las
   claves antiguas de token/usuario al inicializar la politica nueva y requerir
   un nuevo login. Logout limpia ambas ubicaciones para no dejar credenciales
   legacy. No tocar `workshop_preferences`, que sigue siendo persistencia de
   preferencias y pertenece al alcance separado de H-03.
5. Mantener las excepciones de almacenamiento visibles mediante el manejo de
   errores del flujo; no devolver una sesion aparente cuando falla la escritura.
   La recuperacion ante almacenamiento inaccesible debe finalizar la carga y
   notificar el fallo sin rechazos de inicializacion no manejados. Esto se limita
   a la frontera de sesion trasladada, sin corregir otros defectos de respuesta
   o renderizado.

**Limite de seguridad:** `sessionStorage` tambien es legible por JavaScript.
La propuesta reduce persistencia y centraliza responsabilidades, pero no elimina
el riesgo de XSS ni ofrece la proteccion de una cookie `HttpOnly`. Esta ultima
exigiria coordinar un cambio de contrato/backend y queda fuera de este plan.
La aprobacion de H-01 debe aceptar expresamente esta mitigacion parcial.

**Contrato preservado:** mismo POST de login, cuerpo, timeout de 5000 ms,
respuesta esperada, GET de tareas, query `owner`, header Bearer, rutas y logout
local. Solo H-01 justifica cambiar la politica local de persistencia descrita en
[ENDPOINTS.md](docs/ENDPOINTS.md); no se alteran los contratos HTTP ni se agrega
logout automatico por `401`/`403`.

### Archivos previstos

- Nuevos: `src/app/services/session.service.ts` y
  `src/app/services/session.service.spec.ts`.
- Modificados: [login.component.ts](src/app/login/login.component.ts),
  [dashboard.component.ts](src/app/dashboard/dashboard.component.ts),
  [login.component.spec.ts](src/app/login/login.component.spec.ts),
  [dashboard.component.spec.ts](src/app/dashboard/dashboard.component.spec.ts),
  [auth-tasks-flow.spec.ts](src/app/auth-tasks-flow.spec.ts) y
  [browser-flows.mjs](tests/browser-flows.mjs), para usar/verificar la sesion nueva.
- Documentacion al implementar: [ENDPOINTS.md](docs/ENDPOINTS.md), solo
  persistencia, sesion y errores locales afectados;
  [TESTING.md](docs/TESTING.md) y [HALLAZGOS.md](HALLAZGOS.md), con resultados y
  limites reales de la mitigacion. Logs bajo `EVIDENCIAS` dentro del repositorio.

### Pruebas antes del cambio y tareas

- [x] H01-T1: antes de editar producto, ampliar la caracterizacion de
  [auth-tasks-flow.spec.ts](src/app/auth-tasks-flow.spec.ts): login escribe la
  sesion, una nueva instancia de dashboard la recupera, GET usa el mismo token
  y propietario, y logout elimina token/usuario conservando preferencias.
  Mantener aserciones HTTP exactas y registrar el resultado previo.
- [x] H01-T2: escribir primero tests de `SessionService` para escritura/lectura
  en `sessionStorage`, recarga simulada mediante una nueva instancia,
  eliminacion de claves legacy sin reutilizar el token, logout y preferencias
  intactas. Agregar errores de lectura/escritura/borrado, con expectativas de
  notificacion y finalizacion de carga, no fallbacks silenciosos.
- [x] H01-T3: implementar el servicio y conectarlo a ambos componentes; mover
  solo las responsabilidades de sesion y mantener un unico punto de acceso.
  No aplicar simultaneamente cambios de H-03.
- [x] H01-T4: ejecutar los tests de este item, la suite completa, cobertura y
  build. En navegador comprobar recarga en la misma pestaña y logout con
  la politica nueva; un test de estado no basta para declarar correcto el DOM.
  Registrar fallos preexistentes por separado y actualizar solo la descripcion
  local que H-01 cambia intencionalmente.

## Item: H-03 — Dependencia lodash 4.17.21 y uso de merge

### Item, problema y alcance propio

Corresponde a H-03, Sugerencia de severidad media y estado Pendiente.
Se declara `lodash: 4.17.21` en [package.json](package.json#L19) y se usa
`lodash/merge` para combinar preferencias por defecto con datos guardados
([login.component.ts](src/app/login/login.component.ts#L25)).
La matriz registra avisos de auditoria para esa version, pero no demuestra su
aplicabilidad al uso de `merge`.

Este item abarca exclusivamente esa dependencia y la compatibilidad de la
mezcla de preferencias. No incluye almacenamiento de token/usuario, transporte
HTTP, errores de tareas o sustitucion de `[innerHTML]`.

### Cambio propuesto

1. Caracterizar `merge` antes de decidir una sustitucion. No reemplazarlo
   directamente por spread: la mezcla actual acepta datos persistidos sin
   esquema runtime y una normalizacion podria cambiar su comportamiento.
2. Repetir `npm run audit:workshop` y consultar los avisos que afecten a la version
   instalada, distinguiendo alcance del paquete de explotabilidad en este uso.
   Guardar comando, salida y resultado sin ejecutar `npm audit fix --force`.
3. Como correccion acotada, actualizar Lodash a una version mantenida que los
   avisos y el registro de paquetes confirmen como corregida y compatible con
   `lodash/merge`. No fijar aqui una version sin verificarla. Mantener el mismo
   import y la semantica de preferencias; alinear `@types/lodash` solo si la
   actualizacion lo requiere y justificar ese cambio existente.
4. Si no se identifica una version que resuelva los avisos relevantes y preserve
   la caracterizacion, informar el bloqueo y solicitar una decision de alcance.
   No retirar Lodash ni descartar preferencias desconocidas como atajo.
   La alternativa nativa que recomiendan las buenas practicas requiere antes
   un esquema y politica de compatibilidad aprobados; no se implementa
   automaticamente como parte de esta actualizacion.

**Contrato preservado:** identicas preferencias por defecto, mezcla y
persistencia local; mismos errores de carga de preferencias. Ningun cambio en
metodos, URLs, headers, cuerpos, respuestas o navegacion de
[ENDPOINTS.md](docs/ENDPOINTS.md). No depende de implementar H-01.

### Archivos previstos

- [package.json](package.json) y [package-lock.json](package-lock.json), usando
  npm despues de elegir la version verificada; conservar las otras versiones.
- Nuevo: `src/app/login/login-preferences.spec.ts` para caracterizar el
  constructor y la persistencia de preferencias sin cambiar su implementacion.
- [login.component.ts](src/app/login/login.component.ts), solo si una
  incompatibilidad indispensable de la actualizacion exige un ajuste minimo
  respaldado por las pruebas; no se propone reestructurar el componente.
- Documentacion al implementar: [HALLAZGOS.md](HALLAZGOS.md) y
  [TESTING.md](docs/TESTING.md); [ENDPOINTS.md](docs/ENDPOINTS.md) solo si menciona
  una version que deba actualizarse. Evidencia de auditoria bajo `EVIDENCIAS`.

### Pruebas antes del cambio y tareas

- [x] H03-T1: escribir y ejecutar `login-preferences.spec.ts` contra la version
  actual: sin datos guardados; objeto vacio; preferencias parciales; booleanos
  `false`; propiedades adicionales y anidadas; JSON invalido; valor JSON
  inesperado; fallo de lectura de almacenamiento; y serializacion al completar
  login. Para datos validos, verificar defaults conservados y valores elegidos,
  sin suponer equivalencia con spread.
- [x] H03-T2: conservar la expectativa de registro ante JSON invalido y reportar
  por separado cualquier defecto encontrado. No convertir datos peligrosos o
  incoherentes en expectativas de exito para que la actualizacion pase.
- [x] H03-T3: obtener auditoria y version candidata; actualizar solo Lodash y
  el lockfile con npm. No reutilizar una reparacion general del arbol.
- [x] H03-T4: repetir caracterizacion, suite, cobertura, build y auditoria.
  Contrastar avisos antes/despues y comprobar que siguen cargando y guardando
  las mismas preferencias. Si persisten avisos no resueltos de Lodash, no
  declarar H-03 Resuelto. Reportar los avisos ajenos sin ampliar este item.

## Validacion comun y trazabilidad

Cada item se ejecutara por separado, primero sus pruebas y despues su cambio.
Los unicos IDs incluidos son los de la matriz; no se crean requisitos nuevos.

| Item de la matriz | Tareas de su apartado | Evidencia futura de cierre |
|---|---|---|
| H-01 | H01-T1 a H01-T4 | Tests de sesion y flujo, GET con mismo Bearer, preferencias intactas, prueba de navegador y documentacion de la mitigacion parcial. |
| H-03 | H03-T1 a H03-T4 | Caracterizacion de preferencias, manifiestos/lock coherentes, auditoria antes/despues y ausencia de avisos relevantes pendientes en Lodash. |

Comandos previstos desde la raiz de este repositorio: `npm test`,
`npm run test:coverage -- --coverage.reportOnFailure` y `npm run build`;
`npm run audit:workshop` adicionalmente para H-03. No se ejecutan en esta etapa
documental. Meta: al menos 85% de cobertura del codigo modificado, sin bajar
gates, silenciar errores ni cambiar tests para aceptar defectos.

[TESTING.md](docs/TESTING.md) registra como ultima ejecucion 71 aprobados,
6 fallidos y un fallo de navegador. Esa linea base requiere reconfirmacion al
implementar: no se promete suite verde ni se agregan a este plan las correcciones
de todos esos bugs. Si un fallo es causado o afectado por un item, resolverlo
dentro de su frontera; si es independiente, reportarlo sin ocultarlo y sin
declarar aprobado el flujo general.

Fuentes consultadas: [HALLAZGOS.md](HALLAZGOS.md),
[ENDPOINTS.md](docs/ENDPOINTS.md),
[GOOD_PRACTICES.md](docs/GOOD_PRACTICES.md), [REGLAS.md](REGLAS.md),
[TESTING.md](docs/TESTING.md), [package.json](package.json), componentes de
[login](src/app/login/login.component.ts) y
[dashboard](src/app/dashboard/dashboard.component.ts), y el plan anterior de H-02.

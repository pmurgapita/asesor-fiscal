# Prompt: Aplicación de gestión interna para despacho de asesoría fiscal

## Rol y contexto

Actúa como ingeniero/a de software full-stack senior, especializado en aplicaciones internas de gestión para pequeñas empresas de servicios profesionales. Vas a diseñar y construir una aplicación web interna para un pequeño despacho de asesoría fiscal.

El despacho gestiona actualmente todo esto en Excel y quiere migrar a una herramienta dedicada, manteniendo la misma lógica de trabajo pero ganando en control, trazabilidad y facilidad de uso.

## Usuario objetivo (MUY IMPORTANTE)

El usuario principal **no tiene facilidad con la tecnología**. Esto debe condicionar todas las decisiones de diseño:

- Flujos lineales, con muy pocos clics para las acciones más frecuentes.
- Texto y botones grandes, lenguaje claro (nada de jerga técnica).
- Una sola acción evidente por pantalla siempre que sea posible.
- Confirmaciones visuales claras (ej. "Cronómetro en marcha" con color y contador visible).
- Tolerancia a errores: fácil deshacer, difícil borrar algo por accidente, autoguardado.
- Evitar formularios largos de golpe: mejor dividir en pasos simples.
- La app debe poder usarse cómodamente desde ordenador de escritorio; si es viable, que también funcione razonablemente en tablet.

## Objetivo general de la aplicación

Sustituir el Excel actual del despacho por una app web sencilla que permita, para cada trabajador del despacho:

1. Seleccionar un cliente.
2. Dentro de ese cliente, seleccionar un trabajo/tarea concreta.
3. Iniciar un cronómetro que registre el tiempo dedicado a ese cliente y esa tarea.
4. Que ese tiempo quede guardado automáticamente para poder facturar según tarifa horaria.

Este flujo (cliente → trabajo → cronómetro) es el **núcleo de la aplicación** y debe funcionar perfectamente antes de añadir nada más.

## Flujo de uso principal (MVP)

1. El trabajador inicia sesión (usuario simple, sin fricciones).
2. Pantalla principal: lista de clientes con buscador simple (por nombre).
3. Al seleccionar un cliente: lista de sus trabajos/tareas, con las "en curso" destacadas arriba.
4. Al seleccionar un trabajo: un botón grande de "Iniciar" arranca un cronómetro.
5. Mientras el cronómetro corre: pantalla clara mostrando cliente, tarea y tiempo transcurrido en tiempo real, con botón para "Pausar/Detener".
6. Al detener: el tiempo se guarda automáticamente, vinculado a cliente + tarea + trabajador + fecha, y se calcula el importe según la tarifa horaria aplicable. Se puede añadir una nota breve opcional.
7. Debe existir una forma sencilla de corregir manualmente un registro de tiempo (por si alguien olvida detener el cronómetro).

## Módulos funcionales

### 1. Base de datos de clientes
Ficha de cliente con, como mínimo:
- Nombre, DNI, dirección, datos de contacto.
- Estado civil (y datos del cónyuge si aplica), régimen matrimonial.
- Hijos (lista, con fecha de nacimiento de cada uno).
- Empresas asociadas al cliente (un cliente puede tener varias).
- Datos de facturación.
- Categoría de cliente (campo configurable/lista de valores).

**Importante:** diseña el modelo de datos pensando en que en el futuro se añadirán más campos para cumplir con la Ley de Prevención de Blanqueo de Capitales (LBC), sin que eso obligue a rehacer la estructura. No implementes esa parte ahora, solo deja el modelo preparado para extenderse.

### 2. Gestión de proyectos/trabajos
- Alta de nuevos trabajos/proyectos, con categoría y cliente asociado.
- Estado del trabajo: por comenzar / en curso / terminado.
- Asignación del trabajo a uno o varios trabajadores del despacho.
- Registro de gastos/suplidos asociados a cada trabajo (concepto, importe, si se repercute al cliente).
- Listados filtrables: por cliente, por estado, por trabajador.

### 3. Control de tiempos para facturación
- El cronómetro descrito en el flujo principal es la forma normal de registrar tiempo; permite también entrada manual como alternativa.
- Cada registro de tiempo queda vinculado a: cliente, trabajo, trabajador, fecha, duración y tarifa aplicada.
- Tarifas horarias configurables (pueden variar por trabajador, por cliente o por tipo de trabajo — a decidir la combinación más simple posible).
- Cada cargo tiene un estado: pendiente de facturar / facturado / cobrado.
- Listados de cargos filtrables por cliente, por trabajo y por estado de cobro.

*(Nota de alcance: por ahora la app controla tiempos e importes pendientes/facturados, no necesita emitir facturas electrónicas ni integrarse con software contable. Si el desarrollador ve que es trivial añadirlo, puede proponerlo, pero no es requisito del MVP.)*

### 4. Control de tareas pendientes
- Lista de tareas pendientes al estilo del Excel actual: descripción, cliente relacionado (opcional), trabajador asignado, nivel de urgencia, fecha límite, estado.
- Vista simple ordenable/filtrable por urgencia y por trabajador asignado.

### 5. Control de procedimientos tributarios en marcha
Este módulo es distinto de "trabajos" normales porque:
- Los plazos son mucho más estrictos.
- Pueden durar varios años.
- En el Excel actual existe una pestaña para esto pero apenas se usa en la práctica — averigua por qué (probablemente porque no es cómoda) y diseña algo que sí se vaya a usar.

Debe incluir al menos: tipo de procedimiento, organismo, cliente vinculado, fechas/plazos clave, estado, notas, y algún tipo de aviso visual cuando se acerque un plazo importante.

## Modelo de datos (punto de partida sugerido)

Clientes · Empresas asociadas · Familiares (cónyuge, hijos) · Trabajadores/usuarios · Trabajos/Proyectos · Registros de tiempo · Gastos/suplidos · Tareas pendientes · Procedimientos tributarios · Tarifas

Propón las relaciones entre estas entidades antes de escribir código.

## Requisitos no funcionales

- **Privacidad y seguridad:** la app maneja datos personales sensibles (estado civil, hijos, DNI, datos fiscales) sujetos a RGPD y al secreto profesional del asesor. Implementa control de acceso por usuario, y ten en cuenta cifrado de datos y copias de seguridad periódicas.
- **Multiusuario con roles simples:** al menos "administrador" (ve todo) y "trabajador" (ve lo asignado a él, o lo que se decida).
- **Aplicación web**, pensada para un despacho pequeño — evita arquitecturas o infraestructuras complejas innecesarias.
- Exportación a Excel/CSV como red de seguridad, ya que el despacho viene de trabajar en Excel y necesitará confianza en la migración.

## Cómo quiero que trabajes

1. Antes de escribir código, propón la arquitectura y el stack tecnológico más simple y mantenible para este caso, explicando brevemente por qué.
2. Diseña primero el modelo de datos completo.
3. Construye primero el flujo núcleo como MVP navegable (selección de cliente → trabajo → cronómetro → guardado del tiempo), antes de añadir los módulos secundarios.
4. Ante cualquier duda de alcance no especificada aquí, pregunta antes de asumir.
5. Prioriza siempre la simplicidad de uso sobre añadir funcionalidades avanzadas.
6. **Trabaja por fases, con confirmación explícita entre cada una.** No generes la aplicación entera de golpe. Primero preséntame el plan y el modelo de datos y espera mi confirmación; después construye el flujo núcleo (cliente → trabajo → cronómetro) y espera mi confirmación; luego ve añadiendo el resto de módulos uno a uno, confirmando en cada paso.
7. Después de cada fase, explícame en lenguaje sencillo y no técnico qué has creado y qué pasos concretos debo seguir para probarlo.
8. Durante todo el desarrollo, usa siempre datos de prueba ficticios (clientes, importes, fechas inventados). Nunca datos reales de clientes.

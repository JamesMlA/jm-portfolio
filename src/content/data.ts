export type Localized = { en: string; es: string };

export const localized = (en: string, es: string): Localized => ({ en, es });

type TimelineEntry = {
  id: string;
  company: string;
  url?: string;
  role: Localized;
  period: Localized;
  start: number;
  current?: boolean;
  summary: Localized;
  focus: Localized[];
  scale: "lead" | "major" | "mid" | "small";
};

export const timeline: TimelineEntry[] = [
  {
    id: "niuro",
    company: "Niuro",
    role: localized("Lead DevOps Engineer", "Lead DevOps Engineer"),
    period: localized("2025 — Present", "2025 — Presente"),
    start: 2025,
    current: true,
    summary: localized(
      "Leading the design, implementation and operation of scalable cloud infrastructure and DevOps practice — Kubernetes platforms, Infrastructure as Code, delivery pipelines, observability, security and engineering enablement.",
      "Lidero el diseño, la implementación y la operación de infraestructura cloud escalable y de la práctica DevOps: plataformas Kubernetes, Infrastructure as Code, pipelines de entrega, observabilidad, seguridad y habilitación del equipo de ingeniería.",
    ),
    focus: [
      localized("Cloud infrastructure", "Infraestructura cloud"),
      localized("Kubernetes", "Kubernetes"),
      localized("Infrastructure as Code", "Infrastructure as Code"),
      localized("CI/CD", "CI/CD"),
      localized("Observability", "Observabilidad"),
      localized("Security", "Seguridad"),
      localized("Automation", "Automatización"),
      localized("Engineering leadership", "Liderazgo de ingeniería"),
    ],
    scale: "lead",
  },
  {
    id: "toolbox",
    company: "Toolbox",
    role: localized("DevOps Engineer", "DevOps Engineer"),
    period: localized("2024 — 2026", "2024 — 2026"),
    start: 2024,
    summary: localized(
      "Linux infrastructure and production operations, including streaming infrastructure — packaging, networking and monitoring of live media pipelines running on Linux hosts.",
      "Infraestructura Linux y operación en producción, incluyendo infraestructura de streaming: empaquetado, redes y monitoreo de pipelines de video en vivo sobre hosts Linux.",
    ),
    focus: [
      localized("Linux infrastructure", "Infraestructura Linux"),
      localized("Streaming infrastructure", "Infraestructura de streaming"),
      localized("Automation", "Automatización"),
      localized("Docker", "Docker"),
      localized("Monitoring", "Monitoreo"),
      localized("Networking", "Redes"),
      localized("Production operations", "Operación en producción"),
    ],
    scale: "major",
  },
  {
    id: "bi",
    company: "Banco Industrial Guatemala",
    role: localized("DevOps Engineer", "DevOps Engineer"),
    period: localized("2024", "2024"),
    start: 2024,
    summary: localized(
      "DevOps engineering in a regulated environment: containerized workloads, cluster operations and infrastructure automation for internal platforms.",
      "Ingeniería DevOps en un entorno regulado: cargas de trabajo en contenedores, operación de clústeres y automatización de infraestructura para plataformas internas.",
    ),
    focus: [
      localized("Kubernetes", "Kubernetes"),
      localized("DevOps", "DevOps"),
      localized("Infrastructure", "Infraestructura"),
      localized("Automation", "Automatización"),
    ],
    scale: "mid",
  },
  {
    id: "databuddies",
    company: "Data Buddies",
    role: localized("DevOps Engineer", "DevOps Engineer"),
    period: localized("2022 — 2024", "2022 — 2024"),
    start: 2022,
    summary: localized(
      "AWS and Linux administration, cloud infrastructure build-out with Infrastructure as Code, and automation of routine operational work.",
      "Administración de AWS y Linux, construcción de infraestructura cloud con Infrastructure as Code y automatización del trabajo operativo rutinario.",
    ),
    focus: [
      localized("AWS", "AWS"),
      localized("Linux", "Linux"),
      localized("Cloud infrastructure", "Infraestructura cloud"),
      localized("Infrastructure as Code", "Infrastructure as Code"),
      localized("Automation", "Automatización"),
    ],
    scale: "mid",
  },
  {
    id: "municipalidad",
    company: "Municipalidad de Ciudad Vieja",
    role: localized("IT Support", "Soporte de TI"),
    period: localized("2019", "2019"),
    start: 2019,
    summary: localized(
      "IT support and systems administration — the starting point where I learned how machines actually fail in the hands of the people using them.",
      "Soporte de TI y administración de sistemas: el punto de partida donde aprendí cómo fallan realmente las máquinas en manos de quienes las usan.",
      ),
    focus: [
      localized("Systems support", "Soporte de sistemas"),
      localized("Networking", "Redes"),
      localized("Linux", "Linux"),
    ],
    scale: "small",
  },
];

/* ------------------------------------------------------------------ */

type Skill = { name: string; note: Localized };

export const skillDomains: { id: string; label: Localized; skills: Skill[] }[] = [
  {
    id: "cloud",
    label: localized("Cloud", "Cloud"),
    skills: [
      {
        name: "AWS",
        note: localized(
          "The cloud I reach for most: compute, networking, managed data services and IAM treated as code rather than as a console session.",
          "La nube que uso con más frecuencia: cómputo, redes, servicios de datos administrados e IAM tratado como código, no como una sesión de consola.",
        ),
      },
      {
        name: "Azure",
        note: localized(
          "Cloud infrastructure for teams already standardized on the Microsoft ecosystem, wired into the same pipeline and IaC conventions.",
          "Infraestructura cloud para equipos ya estandarizados en el ecosistema Microsoft, integrada a los mismos pipelines y convenciones de IaC.",
        ),
      },
      {
        name: "GCP",
        note: localized(
          "Workloads where GKE and the data tooling justify the platform — provisioned declaratively like everything else.",
          "Cargas donde GKE y las herramientas de datos justifican la plataforma, aprovisionadas de forma declarativa como todo lo demás.",
        ),
      },
    ],
  },
  {
    id: "platform",
    label: localized("Platform", "Plataforma"),
    skills: [
      {
        name: "Kubernetes",
        note: localized(
          "Cluster design and day-two operations: workloads, networking, storage, upgrades, RBAC and the guardrails that keep a shared cluster safe.",
          "Diseño de clústeres y operación del día dos: workloads, redes, almacenamiento, upgrades, RBAC y las barreras que mantienen seguro un clúster compartido.",
        ),
      },
      {
        name: "Docker",
        note: localized(
          "Container images as a build artifact: minimal bases, reproducible builds, non-root by default, small enough to pull quickly.",
          "Imágenes de contenedor como artefacto de build: bases mínimas, builds reproducibles, sin root por defecto y lo bastante pequeñas para descargarse rápido.",
        ),
      },
      {
        name: "Linux",
        note: localized(
          "The foundation everything else sits on — systemd, networking, storage, processes, permissions, and reading logs properly under pressure.",
          "La base sobre la que se apoya todo: systemd, redes, almacenamiento, procesos, permisos y saber leer logs correctamente bajo presión.",
        ),
      },
    ],
  },
  {
    id: "iac",
    label: localized("Infrastructure as Code", "Infrastructure as Code"),
    skills: [
      {
        name: "Terraform",
        note: localized(
          "My default for provisioning: reviewed plans, small modules with real interfaces, remote state and a clear story for drift.",
          "Mi opción por defecto para aprovisionar: planes revisados, módulos pequeños con interfaces reales, estado remoto y una historia clara ante el drift.",
        ),
      },
      {
        name: "CloudFormation",
        note: localized(
          "Where a stack belongs inside AWS: native change sets, stack policies and no extra state to manage.",
          "Cuando el stack pertenece dentro de AWS: change sets nativos, políticas de stack y sin estado adicional que administrar.",
        ),
      },
    ],
  },
  {
    id: "language",
    label: localized("Programming", "Programación"),
    skills: [
      {
        name: "Python",
        note: localized(
          "The language I automate with: operators, API clients, data pipelines, tooling, and the glue around AI/ML workloads.",
          "El lenguaje con el que automatizo: operadores, clientes de APIs, pipelines de datos, tooling y el pegamento alrededor de cargas de IA/ML.",
        ),
      },
      {
        name: "Go",
        note: localized(
          "For the things that should be one static binary: CLI tools, small services and controllers that do not need a runtime.",
          "Para lo que debería ser un solo binario estático: herramientas CLI, servicios pequeños y controladores que no necesitan runtime.",
        ),
      },
      {
        name: "C++",
        note: localized(
          "Foundational systems programming knowledge that makes performance and memory behaviour legible instead of magical.",
          "Conocimiento base de programación de sistemas que hace legible —en lugar de mágico— el rendimiento y el comportamiento de la memoria.",
        ),
      },
    ],
  },
  {
    id: "devops",
    label: localized("DevOps", "DevOps"),
    skills: [
      {
        name: "GitHub Actions",
        note: localized(
          "Delivery pipelines as code: reusable workflows, caching, least-privilege tokens and OIDC instead of long-lived cloud keys.",
          "Pipelines de entrega como código: workflows reutilizables, caché, tokens con mínimo privilegio y OIDC en lugar de claves cloud de larga vida.",
        ),
      },
      {
        name: "CI/CD",
        note: localized(
          "Designed so a broken change fails fast and honestly, and a good one reaches production without a human babysitting it.",
          "Diseñado para que un cambio roto falle rápido y con honestidad, y uno bueno llegue a producción sin que nadie lo vigile.",
        ),
      },
      {
        name: "Automation",
        note: localized(
          "The whole point. Anything done by hand twice becomes a script, then a pipeline, then something nobody has to think about.",
          "El punto entero. Lo que se hace a mano dos veces se vuelve script, luego pipeline y después algo en lo que nadie tiene que pensar.",
        ),
      },
    ],
  },
  {
    id: "observability",
    label: localized("Observability", "Observabilidad"),
    skills: [
      {
        name: "Monitoring",
        note: localized(
          "Metrics that answer a question, with alerts tied to user-visible symptoms instead of to every CPU spike.",
          "Métricas que responden a una pregunta, con alertas atadas a síntomas visibles para el usuario y no a cada pico de CPU.",
        ),
      },
      {
        name: "Logging",
        note: localized(
          "Structured logs, retained on purpose, cheap enough to keep and searchable during the ten minutes that matter.",
          "Logs estructurados, retenidos con criterio, suficientemente baratos para conservarlos y buscables durante los diez minutos que importan.",
        ),
      },
      {
        name: "Reliability Engineering",
        note: localized(
          "SLO thinking, blast-radius reduction, capacity headroom and post-incident work that actually changes the system.",
          "Pensamiento en SLO, reducción del radio de impacto, margen de capacidad y trabajo post-incidente que sí cambia el sistema.",
        ),
      },
    ],
  },
  {
    id: "data",
    label: localized("Data", "Datos"),
    skills: [
      {
        name: "SQL",
        note: localized(
          "Relational modelling, indexing and the query plans behind a slow endpoint — plus backups and restores that have been tested.",
          "Modelado relacional, indexación y los planes de consulta detrás de un endpoint lento, además de backups y restauraciones ya probadas.",
        ),
      },
      {
        name: "NoSQL",
        note: localized(
          "Document and key-value stores where access patterns matter more than normalization, operated as managed infrastructure.",
          "Almacenes de documentos y clave-valor donde los patrones de acceso importan más que la normalización, operados como infraestructura administrada.",
        ),
      },
    ],
  },
];

/* ------------------------------------------------------------------ */

export type Project = {
  id: string;
  index: string;
  title: Localized;
  domain: Localized;
  tagline: Localized;
  problem: Localized;
  approach: Localized[];
  outcome: Localized;
  stack: string[];
  verified: boolean;
  /** architecture diagram variant rendered by <ArchitectureDiagram /> */
  diagram: "cloud" | "k8s" | "cicd" | "streaming" | "mlops";
  scope: Localized;
  link?: { href: string; label: Localized };
};

export const projects: Project[] = [
  {
    id: "cloud-infrastructure",
    index: "01",
    title: localized("Cloud infrastructure", "Infraestructura cloud"),
    domain: localized("AWS · Azure · GCP", "AWS · Azure · GCP"),
    tagline: localized(
      "Designing scalable cloud infrastructure with Infrastructure as Code.",
      "Diseño de infraestructura cloud escalable con Infrastructure as Code.",
    ),
    problem: localized(
      "Cloud accounts that grew organically end up with resources nobody can account for, environments that disagree with each other, and a change process that depends on who remembers which console page to open.",
      "Las cuentas cloud que crecen de forma orgánica terminan con recursos que nadie puede justificar, entornos que no coinciden entre sí y un proceso de cambio que depende de quién recuerde qué página de la consola abrir.",
    ),
    approach: [
      localized(
        "Model the whole environment in Terraform — network, compute, IAM and data services — with one module per concern and explicit inputs instead of long-lived forks per environment.",
        "Modelar todo el entorno en Terraform —red, cómputo, IAM y servicios de datos— con un módulo por responsabilidad y entradas explícitas en lugar de forks por entorno que duran años.",
      ),
      localized(
        "Promote the same modules from staging to production so a path that has never been exercised cannot reach production for the first time.",
        "Promover los mismos módulos de staging a producción para que una ruta nunca ejercitada no llegue a producción por primera vez.",
      ),
      localized(
        "Run the plan in CI, review it as a diff, and apply through a pipeline with remote state and locking so two people cannot race the same change.",
        "Ejecutar el plan en CI, revisarlo como diff y aplicarlo mediante un pipeline con estado remoto y locking para que dos personas no compitan por el mismo cambio.",
      ),
      localized(
        "Treat cost as a design constraint: right-sized instances, lifecycle rules on storage, and a tagging standard that makes spend attributable to a team.",
        "Tratar el costo como restricción de diseño: instancias del tamaño correcto, reglas de ciclo de vida en almacenamiento y un estándar de etiquetado que haga atribuible el gasto a un equipo.",
      ),
    ],
    outcome: localized(
      "Environments that can be rebuilt from the repository, changes that are reviewed before they are applied, and infrastructure that a new engineer can read as code on their first week.",
      "Entornos que pueden reconstruirse desde el repositorio, cambios que se revisan antes de aplicarse e infraestructura que un ingeniero nuevo puede leer como código en su primera semana.",
    ),
    stack: ["Terraform", "AWS", "Azure", "GCP", "CloudFormation", "IAM"],
    verified: true,
    diagram: "cloud",
    scope: localized(
      "Ongoing across current and previous roles",
      "Continuo en el rol actual y en roles anteriores",
    ),
    link: { href: "https://github.com/Ancordss/vault-on-aws", label: localized("Related Terraform work", "Trabajo relacionado en Terraform") },
  },
  {
    id: "kubernetes-platform",
    index: "02",
    title: localized("Kubernetes platform", "Plataforma Kubernetes"),
    domain: localized("Platform · SRE", "Plataforma · SRE"),
    tagline: localized(
      "Building and operating Kubernetes environments with automation, security and observability.",
      "Construcción y operación de entornos Kubernetes con automatización, seguridad y observabilidad.",
    ),
    problem: localized(
      "A cluster is easy to start and hard to own. Without guardrails it becomes a shared machine where a single unbounded workload can take down services owned by three other teams.",
      "Un clúster es fácil de arrancar y difícil de poseer. Sin barreras se convierte en una máquina compartida donde una sola carga sin límites puede tumbar servicios de otros tres equipos.",
    ),
    approach: [
      localized(
        "Provision the cluster declaratively and keep cluster configuration in the same repository as the workloads that depend on it.",
        "Aprovisionar el clúster de forma declarativa y mantener la configuración junto a las cargas de trabajo que dependen de ella, en el mismo repositorio.",
      ),
      localized(
        "Apply namespace-scoped guardrails: resource requests and limits, quotas, pod security standards, default-deny network policies and least-privilege RBAC.",
        "Aplicar barreras por namespace: requests y limits de recursos, cuotas, estándares de seguridad de pods, políticas de red con deny por defecto y RBAC de mínimo privilegio.",
      ),
      localized(
        "Instrument the platform itself — control plane, nodes, ingress and the workloads on top — before instrumenting the applications.",
        "Instrumentar primero la plataforma —plano de control, nodos, ingress y las cargas encima— antes de instrumentar las aplicaciones.",
      ),
      localized(
        "Plan versions and node rotation as routine maintenance, not as an incident, with capacity headroom for the drain.",
        "Planificar versiones y rotación de nodos como mantenimiento rutinario y no como incidente, con margen de capacidad para el drain.",
      ),
    ],
    outcome: localized(
      "A shared cluster where workloads are bounded, failures are visible before users report them, and upgrades happen on a schedule rather than under pressure.",
      "Un clúster compartido donde las cargas están acotadas, las fallas se ven antes de que las reporten los usuarios y los upgrades ocurren en calendario y no bajo presión.",
    ),
    stack: ["Kubernetes", "Docker", "Helm", "Linux", "RBAC", "NetworkPolicy"],
    verified: true,
    diagram: "k8s",
    scope: localized("Niuro · Banco Industrial Guatemala", "Niuro · Banco Industrial Guatemala"),
    link: { href: "https://github.com/Ancordss/mongodb-k8s", label: localized("Related cluster work", "Trabajo relacionado en clúster") },
  },
  {
    id: "cicd-automation",
    index: "03",
    title: localized("CI/CD & automation", "CI/CD y automatización"),
    domain: localized("Delivery · Tooling", "Entrega · Tooling"),
    tagline: localized(
      "Reducing manual operational work through automated pipelines and engineering tooling.",
      "Reducción del trabajo operativo manual mediante pipelines automatizados y tooling de ingeniería.",
    ),
    problem: localized(
      "Deployments that depend on one person's shell history do not scale, cannot be audited, and fail differently every time. Manual releases also make rollback a separate, improvised project.",
      "Los despliegues que dependen del historial de shell de una persona no escalan, no se pueden auditar y fallan distinto cada vez. Las releases manuales además convierten el rollback en un proyecto aparte e improvisado.",
    ),
    approach: [
      localized(
        "Pipeline as code, with reusable workflows instead of copy-pasted jobs, so a fix lands once and applies everywhere.",
        "Pipeline como código, con workflows reutilizables en lugar de jobs copiados y pegados, para que una corrección se aplique una vez y sirva en todos lados.",
      ),
      localized(
        "Authentication through short-lived OIDC credentials instead of long-lived cloud keys stored as secrets.",
        "Autenticación con credenciales OIDC de vida corta en lugar de claves cloud de larga vida guardadas como secretos.",
      ),
      localized(
        "Build once, promote the same artifact through environments — never rebuild per environment.",
        "Construir una vez y promover el mismo artefacto entre entornos, sin reconstruir por entorno.",
      ),
      localized(
        "Automate the routine operational work too: scheduled jobs, dependency updates, drift detection and the small scripts that remove repeated manual steps.",
        "Automatizar también el trabajo operativo rutinario: jobs programados, actualización de dependencias, detección de drift y los pequeños scripts que eliminan pasos manuales repetidos.",
      ),
    ],
    outcome: localized(
      "Deployments that are boring: the same steps every time, a visible history of what changed, and a rollback that is one action rather than one incident.",
      "Despliegues que son aburridos: los mismos pasos cada vez, un historial visible de lo que cambió y un rollback que es una acción y no un incidente.",
    ),
    stack: ["GitHub Actions", "Docker", "Python", "Go", "OIDC", "Bash"],
    verified: true,
    diagram: "cicd",
    scope: localized("Across all engineering roles", "En todos los roles de ingeniería"),
    link: { href: "https://github.com/Ancordss/Docker_cicd", label: localized("Related pipeline work", "Trabajo relacionado en pipelines") },
  },
  {
    id: "streaming-infrastructure",
    index: "04",
    title: localized("Streaming infrastructure", "Infraestructura de streaming"),
    domain: localized("Media · Linux", "Media · Linux"),
    tagline: localized(
      "Production-oriented video streaming infrastructure involving Linux, FFmpeg, packaging, networking and monitoring.",
      "Infraestructura de streaming de video orientada a producción con Linux, FFmpeg, empaquetado, redes y monitoreo.",
    ),
    problem: localized(
      "Live media is unforgiving: a pipeline that works in testing can still fall apart under real network conditions, and by the time a problem is visible to viewers it has already been broadcast.",
      "El media en vivo no perdona: un pipeline que funciona en pruebas puede desarmarse bajo condiciones reales de red, y cuando el problema es visible para la audiencia ya se emitió.",
    ),
    approach: [
      localized(
        "Run the media toolchain in containers on Linux hosts so encoding and packaging versions are pinned and reproducible.",
        "Ejecutar la cadena de herramientas de media en contenedores sobre hosts Linux para fijar y hacer reproducibles las versiones de codificación y empaquetado.",
      ),
      localized(
        "Treat the network as part of the system: bitrate, buffering and segment duration are design parameters, not defaults.",
        "Tratar la red como parte del sistema: bitrate, buffering y duración de segmentos son parámetros de diseño, no valores por defecto.",
      ),
      localized(
        "Monitor the stream itself — continuity, segment health, latency and host resource pressure — instead of only the host it runs on.",
        "Monitorear el stream en sí —continuidad, salud de segmentos, latencia y presión de recursos del host— en lugar de solo el host donde corre.",
      ),
      localized(
        "Automate host provisioning and service restarts so recovery does not require waiting for a person to log in.",
        "Automatizar el aprovisionamiento de hosts y el reinicio de servicios para que la recuperación no dependa de que alguien entre a conectarse.",
      ),
    ],
    outcome: localized(
      "Media pipelines that are observable while they are running, and recoverable without a human opening a terminal at the worst possible moment.",
      "Pipelines de media observables mientras están en ejecución y recuperables sin que una persona abra una terminal en el peor momento posible.",
    ),
    stack: ["Linux", "FFmpeg", "Docker", "Networking", "Monitoring", "Bash"],
    verified: true,
    diagram: "streaming",
    scope: localized("Toolbox", "Toolbox"),
    link: { href: "https://github.com/Ancordss/ffmpeg", label: localized("Related FFmpeg tooling", "Tooling relacionado de FFmpeg") },
  },
  {
    id: "mlops",
    index: "05",
    title: localized("AI / MLOps", "AI / MLOps"),
    domain: localized("Infrastructure for machine learning", "Infraestructura para machine learning"),
    tagline: localized(
      "Exploring local AI infrastructure, LLM tooling, Python automation and production-oriented AI systems.",
      "Exploración de infraestructura local de IA, tooling de LLMs, automatización en Python y sistemas de IA orientados a producción.",
    ),
    problem: localized(
      "AI prototypes tend to live on one laptop with an unpinned environment. The moment they need to run reliably — for a team, on a schedule, on real data — none of that work transfers.",
      "Los prototipos de IA suelen vivir en una laptop con un entorno sin fijar. En el momento en que deben correr de forma confiable —para un equipo, en un calendario, con datos reales— nada de ese trabajo se transfiere.",
    ),
    approach: [
      localized(
        "Run models and tooling locally first, on hardware I control, to understand memory, latency and cost behaviour before renting it in the cloud.",
        "Correr modelos y tooling primero de forma local, en hardware que controlo, para entender comportamiento de memoria, latencia y costo antes de alquilarlo en la nube.",
      ),
      localized(
        "Treat environments as infrastructure: pinned dependencies, container images and reproducible setups instead of a working directory that only exists on one machine.",
        "Tratar los entornos como infraestructura: dependencias fijadas, imágenes de contenedor y setups reproducibles en lugar de un directorio que solo existe en una máquina.",
      ),
      localized(
        "Wrap model work in Python automation with explicit inputs and outputs, so a pipeline stage can retry safely and be observed like any other service.",
        "Envolver el trabajo de modelos en automatización Python con entradas y salidas explícitas, para que una etapa del pipeline pueda reintentarse con seguridad y observarse como cualquier otro servicio.",
      ),
      localized(
        "Keep the serving path conventional — containers, health checks, resource limits — because a model endpoint is still a production service.",
        "Mantener la ruta de servicio convencional —contenedores, health checks, límites de recursos— porque un endpoint de modelo sigue siendo un servicio de producción.",
      ),
    ],
    outcome: localized(
      "Working notes and tooling rather than claims: this is an area I am actively building depth in, applied to the same reliability standards as the rest of the stack.",
      "Notas de trabajo y tooling más que afirmaciones: es un área en la que estoy construyendo profundidad, aplicando los mismos estándares de confiabilidad que al resto del stack.",
    ),
    stack: ["Python", "Docker", "Linux", "Local inference", "Automation", "SQL"],
    verified: true,
    diagram: "mlops",
    scope: localized("Ongoing personal work", "Trabajo personal en curso"),
    link: { href: "https://github.com/Ancordss/basic-ml-agent", label: localized("Related experiment", "Experimento relacionado") },
  },
];

/* ------------------------------------------------------------------ */

type Principle = {
  id: string;
  label: Localized;
  detail: Localized;
  pulls: string[];
};

export const principles: Principle[] = [
  {
    id: "iac",
    label: localized("Infrastructure as Code", "Infrastructure as Code"),
    detail: localized(
      "If it is not in the repository it does not exist. That single rule makes everything else auditable, reviewable and rebuildable after a bad day.",
      "Si no está en el repositorio, no existe. Esa sola regla hace que todo lo demás sea auditable, revisable y reconstruible después de un mal día.",
    ),
    pulls: ["automation", "reliability", "security"],
  },
  {
    id: "automation",
    label: localized("Automation", "Automatización"),
    detail: localized(
      "Automation removes the human from the path where humans are least reliable: repeated steps under time pressure.",
      "La automatización saca al humano de la ruta donde es menos confiable: pasos repetidos bajo presión de tiempo.",
    ),
    pulls: ["iac", "dx", "reliability"],
  },
  {
    id: "observability",
    label: localized("Observability", "Observabilidad"),
    detail: localized(
      "You cannot operate what you cannot see. Instrumentation is part of the build, not a follow-up ticket.",
      "No puedes operar lo que no puedes ver. La instrumentación es parte del build, no un ticket de seguimiento.",
    ),
    pulls: ["reliability", "cost", "automation"],
  },
  {
    id: "security",
    label: localized("Security", "Seguridad"),
    detail: localized(
      "Least privilege, short-lived credentials and a small attack surface. Defaults matter more than intentions.",
      "Mínimo privilegio, credenciales de vida corta y una superficie de ataque pequeña. Los valores por defecto importan más que las intenciones.",
    ),
    pulls: ["iac", "reliability", "dx"],
  },
  {
    id: "reliability",
    label: localized("Reliability", "Confiabilidad"),
    detail: localized(
      "Designed for the failure, not for the demo: bounded blast radius, tested restores and capacity headroom for the worst day.",
      "Diseñado para la falla y no para la demo: radio de impacto acotado, restauraciones probadas y margen de capacidad para el peor día.",
    ),
    pulls: ["observability", "automation", "cost"],
  },
  {
    id: "cost",
    label: localized("Cost awareness", "Conciencia de costos"),
    detail: localized(
      "Every architectural decision has a monthly price. Visibility turns cost from a surprise into a design input.",
      "Cada decisión de arquitectura tiene un precio mensual. La visibilidad convierte el costo de sorpresa en insumo de diseño.",
    ),
    pulls: ["observability", "iac", "reliability"],
  },
  {
    id: "dx",
    label: localized("Developer experience", "Experiencia de desarrollo"),
    detail: localized(
      "Platforms are products. Fast, honest feedback and self-service paths are what make good practices actually get adopted.",
      "Las plataformas son productos. Retroalimentación rápida y honesta y rutas de autoservicio son lo que hace que las buenas prácticas se adopten de verdad.",
    ),
    pulls: ["automation", "security", "observability"],
  },
];

/* ------------------------------------------------------------------ */

/** Verified public GitHub facts. Refresh by running `npm run gh:sync`. */
export const githubStats = {
  login: "Ancordss",
  publicRepos: 43,
  followers: 14,
  following: 20,
  createdAt: "2021-07-12T15:38:31Z",
  contributionsLastYear: 95,
  contributionsVerifiedOn: "2026-09-14",
  languages: ["Python", "Go", "TypeScript", "Shell", "HCL", "C++"],
};

export type Repo = {
  name: string;
  description: Localized;
  language: string;
  pushed: string;
  href: string;
};

/** Selected real repositories, in the author's own words. */
export const repos: Repo[] = [
  {
    name: "vault-on-aws",
    description: localized(
      "HashiCorp Vault for secrets and tokens, deployed on AWS with Terraform. Configurable security and scalability, usable from any service.",
      "HashiCorp Vault para secretos y tokens, desplegado en AWS con Terraform. Seguridad y escalabilidad configurables, usable desde cualquier servicio.",
    ),
    language: "Terraform",
    pushed: "2022-03-30",
    href: "https://github.com/Ancordss/vault-on-aws",
  },
  {
    name: "ffmpeg",
    description: localized(
      "Docker builds for FFmpeg targeting Ubuntu, Alpine, CentOS, Scratch, NVIDIA and VAAPI images.",
      "Builds de Docker para FFmpeg sobre imágenes Ubuntu, Alpine, CentOS, Scratch, NVIDIA y VAAPI.",
    ),
    language: "Dockerfile",
    pushed: "2025-03-19",
    href: "https://github.com/Ancordss/ffmpeg",
  },
  {
    name: "mongodb-k8s",
    description: localized(
      "Running MongoDB on Kubernetes.",
      "Ejecutando MongoDB sobre Kubernetes.",
    ),
    language: "Python",
    pushed: "2024-05-30",
    href: "https://github.com/Ancordss/mongodb-k8s",
  },
  {
    name: "Docker_cicd",
    description: localized(
      "Container build and delivery practice in Docker.",
      "Práctica de build y entrega de contenedores con Docker.",
    ),
    language: "Dockerfile",
    pushed: "2022-08-09",
    href: "https://github.com/Ancordss/Docker_cicd",
  },
  {
    name: "gcp-project",
    description: localized(
      "Google Cloud infrastructure described with Terraform.",
      "Infraestructura de Google Cloud descrita con Terraform.",
    ),
    language: "HCL",
    pushed: "2024-11-15",
    href: "https://github.com/Ancordss/gcp-project",
  },
  {
    name: "Ancordss.github.io",
    description: localized(
      "Personal technical blog, built with Hugo.",
      "Blog técnico personal, construido con Hugo.",
    ),
    language: "Makefile",
    pushed: "2025-10-25",
    href: "https://github.com/Ancordss/Ancordss.github.io",
  },
];

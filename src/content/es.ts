import type { Dictionary } from "./en";

/**
 * Natural Spanish — not a literal translation pass.
 * Technology names, acronyms and job titles stay in English on purpose.
 */
export const es: Dictionary = {
  meta: {
    locale: "es",
    title: "James Maradiaga — Lead DevOps Engineer",
    description:
      "Lead DevOps Engineer en Guatemala. Diseño, automatizo y opero infraestructura cloud: Kubernetes, Terraform, CI/CD, observabilidad y MLOps sobre AWS, Azure y GCP.",
  },

  nav: {
    sections: {
      home: "Inicio",
      about: "Perfil",
      experience: "Experiencia",
      projects: "Proyectos",
      skills: "Tecnologías",
      github: "GitHub",
      contact: "Contacto",
    },
    menu: "Menú",
    close: "Cerrar",
    language: "Idioma",
  },

  hero: {
    availability: "Abierto a problemas de ingeniería interesantes",
    headline: "Construyo infraestructura confiable para software que importa.",
    sub: "Lead DevOps Engineer enfocado en infraestructura cloud, Kubernetes, automatización, confiabilidad y AI/MLOps.",
    ctaPrimary: "Ver mi trabajo",
    ctaSecondary: "Hablemos",
    photoAlt: "James Maradiaga",
  },

  about: {
    eyebrow: "01 — Perfil",
    title: "Trabajo en la capa que está debajo del producto.",
    lead: "Casi todo mi trabajo ocurre donde el software se encuentra con la máquina: hosts Linux, cuentas cloud, runtimes de contenedores y los pipelines que mueven cambios entre ellos.",
    body: [
      "Construyo y opero plataformas: el aprovisionamiento, el clúster, la ruta de entrega, los dashboards que alguien abre a las 3 de la mañana cuando algo no cuadra. El objetivo nunca es la herramienta por sí misma, sino infraestructura que otros ingenieros puedan entender sin necesitarme en la sala.",
      "En el día a día eso significa escribir Terraform en lugar de hacer clic en consolas, diseñar CI/CD que dé retroalimentación rápida y honesta, endurecer Kubernetes y automatizar el trabajo operativo que de otro modo se haría a mano en el peor momento. Programo en Python y Go, sobre todo para eliminar repetición.",
      "Trabajo con Linux, infraestructura cloud, contenedores, Kubernetes, automatización y programación. Me importan las partes poco vistosas: idempotencia, mínimo privilegio, visibilidad de costos y saber exactamente qué pasa cuando un nodo desaparece.",
    ],
    philosophyTitle: "Filosofía de ingeniería",
    principles: {
      automate: {
        title: "Automatizar",
        body: "Reducir el trabajo manual y hacer que los sistemas sean reproducibles. Si una tarea hay que hacerla dos veces, su lugar es el código.",
      },
      reliability: {
        title: "Diseñar para la confiabilidad",
        body: "Diseñar infraestructura observable, escalable y resiliente — asumiendo que la falla llegará en la peor ventana de cambio posible.",
      },
      simple: {
        title: "Mantenerlo simple",
        body: "Preferir sistemas entendibles antes que complejidad innecesaria. La infraestructura aburrida que todo el equipo lee gana a la ingeniosa que solo una persona entiende.",
      },
    },
    nowTitle: "Actualmente",
    now: [
      "Liderando la práctica de infraestructura cloud y DevOps en Niuro",
      "Plataformas Kubernetes, Infrastructure as Code y pipelines de entrega",
      "Observabilidad, hardening de seguridad y visibilidad de costos",
      "Infraestructura local de IA y MLOps orientado a producción",
    ],
    stack: ["Linux", "Kubernetes", "Terraform", "AWS", "Python", "Go"],
  },

  experience: {
    eyebrow: "02 — Experiencia",
    title: "De los tickets de soporte a ser dueño de la plataforma.",
    lead: "Hace diez años reparaba equipos de escritorio. Hoy lidero la infraestructura sobre la que otros ingenieros despliegan. El hilo conductor es el mismo: entender el sistema y luego quitar las partes que duelen.",
    current: "Actual",
    focusLabel: "Áreas de enfoque",
    remote: "trabajo remoto",
  },

  skills: {
    eyebrow: "04 — Tecnologías",
    title: "La tecnología solo es interesante en contexto.",
    lead: "Dónde encaja cada tecnología en los sistemas que construyo. Agrupadas por dominio de ingeniería, no por cantidad de logos.",
  },

  projects: {
    eyebrow: "03 — Trabajo",
    title: "Casos de estudio, no capturas de pantalla.",
    lead: "Estos son los espacios de problema en los que trabajo. Cada uno está escrito como un caso de ingeniería: contexto, arquitectura y enfoque. Todo lo que no puedo verificar públicamente queda fuera o marcado como tal.",
    soon: "Caso de estudio en preparación",
    soonNote:
      "Redactado como nota de trabajo, no como página de marketing. Los diagramas detallados y los resultados se agregan cuando la redacción esté revisada.",
    labels: {
      problem: "Problema",
      architecture: "Arquitectura",
      approach: "Enfoque",
      technology: "Tecnología",
      outcome: "Resultado",
      scope: "Alcance",
    },
  },

  thinking: {
    eyebrow: "05 — Modelo mental",
    title: "Cómo pienso la infraestructura",
    lead: "No son habilidades, son restricciones contra las que diseño. Cada una modifica a las demás — esa tensión es lo que hace que la infraestructura funcione.",
    related: "Tira de",
    detail: "Qué cambia",
  },

  github: {
    eyebrow: "06 — Open source",
    title: "Código, en público.",
    lead: "Datos traídos en vivo desde la API de GitHub durante el build — sin cifras de contribución inventadas. Los repositorios destacados son proyectos reales, sin modificar.",
    viewProfile: "Ver perfil de GitHub",
    blog: "Blog técnico",
    blogNote: "Escribo sobre Linux, Kubernetes y automatización.",
    repos: "Repositorios seleccionados",
    reposNote: "Ordenados por último push. Descripciones tal como las escribió su autor.",
    activity: "Actividad de contribuciones",
    activityNote: "Calendario público de contribuciones del último año.",
    contributions: "contribuciones en el último año",
    publicRepos: "repositorios públicos",
    followers: "seguidores",
    following: "siguiendo",
    memberSince: "en GitHub desde",
    pushed: "último push",
    pinned: "Destacado",
    liveNote: "Datos en vivo",
    stale: "Datos en vivo no disponibles — se muestra el respaldo estático.",
    languages: "Lenguajes principales",
    less: "menos",
    more: "más",
  },

  contact: {
    eyebrow: "07 — Contacto",
    title: "¿Tienes un problema de infraestructura que valga la pena resolver?",
    lead: "Me interesa construir plataformas confiables, automatizar sistemas complejos y resolver problemas difíciles de infraestructura.",
    email: "Escríbeme",
    linkedin: "LinkedIn",
    github: "GitHub",
    copy: "Copiar dirección",
    copied: "Copiada",
    signature: "Construido con Next.js, desplegado como infraestructura.",
    interestTitle: "Temas de los que me gusta hablar",
    interests: [
      "Diseño y operación de plataformas Kubernetes",
      "Infrastructure as Code a escala de equipo",
      "CI/CD en el que los ingenieros realmente confían",
      "Observabilidad y respuesta a incidentes",
      "Reducción de costos cloud sin perder confiabilidad",
      "MLOps e infraestructura de IA",
    ],
  },

  footer: {
    built: "Diseñado y construido por James Maradiaga",
    stack: "Next.js · TypeScript · Tailwind",
    forAgents: "Para agentes",
    forAgentsIndex: "índice",
    forAgentsMarkdown: "markdown",
    forAgentsSitemap: "urls",
    rights: "Todos los derechos reservados",
    version: "rev",
  },

  a11y: {
    external: "abre en una pestaña nueva",
  },
};

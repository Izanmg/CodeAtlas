/**
 * seed-diagrams.js
 *
 * Datos semilla del módulo de diagramas. Reproduce el modelo de
 * arquitectura completo de la propia app CodeAtlas — el diagrama por
 * defecto del proyecto "p_codeatlas".
 *
 * Cuando se conecte el backend real, esto desaparece — los diagramas
 * vendrán de `GET /api/diagrams/:id`.
 */

export const CODEATLAS_DIAGRAM_DATA = {
  modules: {
    backend: [
      {
        id: 'auth-backend',
        name: 'Authentication',
        description: 'Gestiona identidad de usuario y sesiones JWT',
        layer: 'backend',
        api: ['POST /auth/login', 'POST /auth/register', 'GET /auth/me', 'POST /auth/logout'],
        database: ['users'],
        dependsOn: [],
      },
      {
        id: 'projects-backend',
        name: 'Projects',
        description: 'CRUD de proyectos del usuario',
        layer: 'backend',
        api: ['GET /projects', 'POST /projects', 'GET /projects/:id', 'DELETE /projects/:id'],
        database: ['projects', 'users'],
        dependsOn: ['auth-backend'],
      },
      {
        id: 'diagrams-backend',
        name: 'Diagrams',
        description: 'Persistencia de diagramas y su JSON estructurado',
        layer: 'backend',
        api: ['GET /diagrams/:id', 'POST /diagrams', 'DELETE /diagrams/:id'],
        database: ['diagrams', 'projects'],
        dependsOn: ['auth-backend', 'projects-backend'],
      },
      {
        id: 'parser-backend',
        name: 'Markdown Parser',
        description: 'Transforma archivos .md en el modelo JSON del diagrama',
        layer: 'backend',
        api: ['POST /parser/generate'],
        database: ['diagrams'],
        dependsOn: ['diagrams-backend'],
      },
    ],
    frontend: [
      {
        id: 'auth-frontend',
        name: 'Auth Views',
        description: 'Pantallas de login y registro',
        layer: 'frontend',
        screens: ['login', 'register'],
        consumesApi: ['auth-backend'],
        dependsOn: [],
      },
      {
        id: 'dashboard-frontend',
        name: 'Dashboard',
        description: 'Vista principal con grid de proyectos',
        layer: 'frontend',
        screens: ['dashboard'],
        consumesApi: ['projects-backend', 'auth-backend'],
        dependsOn: ['auth-frontend'],
      },
      {
        id: 'projects-frontend',
        name: 'Projects Views',
        description: 'Detalle de proyecto y creación',
        layer: 'frontend',
        screens: ['project-new', 'project-detail'],
        consumesApi: ['projects-backend', 'diagrams-backend'],
        dependsOn: ['dashboard-frontend'],
      },
      {
        id: 'diagrams-frontend',
        name: 'Diagram Views',
        description: 'Subida de archivos y canvas interactivo del diagrama',
        layer: 'frontend',
        screens: ['diagram-new', 'diagram-view'],
        consumesApi: ['diagrams-backend', 'parser-backend'],
        dependsOn: ['projects-frontend'],
      },
      {
        id: 'settings-frontend',
        name: 'Settings',
        description: 'Perfil, contraseña y preferencias',
        layer: 'frontend',
        screens: ['settings'],
        consumesApi: ['auth-backend'],
        dependsOn: ['dashboard-frontend'],
      },
    ],
  },
  screens: [
    { id: 'login', name: 'Login', route: '/login', module: 'auth-frontend', requiresAuth: false, navigatesTo: ['dashboard', 'register'] },
    { id: 'register', name: 'Register', route: '/register', module: 'auth-frontend', requiresAuth: false, navigatesTo: ['dashboard', 'login'] },
    { id: 'dashboard', name: 'Dashboard', route: '/', module: 'dashboard-frontend', requiresAuth: true, navigatesTo: ['project-detail', 'project-new', 'settings'] },
    { id: 'project-new', name: 'New Project', route: '/projects/new', module: 'projects-frontend', requiresAuth: true, navigatesTo: ['project-detail', 'dashboard'] },
    { id: 'project-detail', name: 'Project Detail', route: '/projects/:id', module: 'projects-frontend', requiresAuth: true, navigatesTo: ['diagram-new', 'diagram-view', 'dashboard'] },
    { id: 'diagram-new', name: 'New Diagram', route: '/projects/:id/diagrams/new', module: 'diagrams-frontend', requiresAuth: true, navigatesTo: ['diagram-view', 'project-detail'] },
    { id: 'diagram-view', name: 'Diagram', route: '/diagrams/:id', module: 'diagrams-frontend', requiresAuth: true, navigatesTo: ['project-detail'] },
    { id: 'settings', name: 'Settings', route: '/settings', module: 'settings-frontend', requiresAuth: true, navigatesTo: ['dashboard'] },
  ],
  flows: [
    {
      id: 'user-login',
      name: 'User Login',
      trigger: 'Usuario envía formulario de login',
      screens: ['login', 'dashboard'],
      modules: ['auth-frontend', 'auth-backend'],
      database: ['users'],
      steps: [
        'Usuario introduce credenciales',
        'Frontend llama POST /auth/login',
        'Backend valida y devuelve JWT',
        'Frontend redirige al dashboard',
      ],
    },
    {
      id: 'generate-diagram',
      name: 'Generate Diagram',
      trigger: 'Usuario sube archivos .md',
      screens: ['diagram-new', 'diagram-view'],
      modules: ['diagrams-frontend', 'parser-backend', 'diagrams-backend'],
      database: ['diagrams'],
      steps: [
        'Usuario arrastra archivos .md',
        'Frontend envía multipart a POST /parser/generate',
        'Parser construye el modelo JSON',
        'Diagrams backend lo persiste',
        'Frontend renderiza el canvas',
      ],
    },
  ],
  database: [
    {
      id: 'users',
      name: 'users',
      usedBy: ['auth-backend', 'projects-backend'],
      relations: [{ target: 'projects', type: 'one-to-many', field: 'user_id' }],
      fields: [
        { name: 'id', type: 'uuid', pk: true },
        { name: 'email', type: 'varchar', unique: true },
        { name: 'password_hash', type: 'varchar' },
        { name: 'name', type: 'varchar' },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      id: 'projects',
      name: 'projects',
      usedBy: ['projects-backend', 'diagrams-backend'],
      relations: [
        { target: 'users', type: 'many-to-one', field: 'user_id' },
        { target: 'diagrams', type: 'one-to-many', field: 'project_id' },
      ],
      fields: [
        { name: 'id', type: 'uuid', pk: true },
        { name: 'user_id', type: 'uuid', fk: 'users.id' },
        { name: 'name', type: 'varchar' },
        { name: 'description', type: 'text' },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      id: 'diagrams',
      name: 'diagrams',
      usedBy: ['diagrams-backend', 'parser-backend'],
      relations: [{ target: 'projects', type: 'many-to-one', field: 'project_id' }],
      fields: [
        { name: 'id', type: 'uuid', pk: true },
        { name: 'project_id', type: 'uuid', fk: 'projects.id' },
        { name: 'name', type: 'varchar' },
        { name: 'model_json', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
  ],
  systemRules: {
    auth: [
      'Todas las rutas requieren autenticación excepto /login y /register',
      'JWT con expiración de 7 días, almacenado en httpOnly cookie',
    ],
    navigation: [
      'Usuarios no autenticados son redirigidos a /login',
      'Tras login se redirige a / (dashboard)',
    ],
    conventions: [
      'Las respuestas de la API usan camelCase',
      'IDs en formato UUID v4',
      'Timestamps en ISO 8601 UTC',
    ],
  },
}

export const SEED_DIAGRAMS = [
  {
    id: 'd_codeatlas_v1',
    projectId: 'p_codeatlas',
    name: 'Arquitectura general',
    description: 'Mapa completo de módulos, pantallas, BD y flujos',
    createdAt: '2026-05-06T14:22:00Z',
    data: CODEATLAS_DIAGRAM_DATA,
  },
]

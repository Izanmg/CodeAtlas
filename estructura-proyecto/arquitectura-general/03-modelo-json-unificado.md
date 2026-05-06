# Modelo JSON unificado

## Qué es este documento

Este documento define la estructura exacta del JSON que devuelve el parser al frontend. Es el contrato entre el backend y el módulo de diagramas del frontend. Ambas partes deben respetar este formato.

## Nota sobre nomenclatura

Los archivos `.md` usan kebab-case en los campos del frontmatter (`depends-on`, `consumes-api`, `requires-auth`). En el JSON, todos los campos se convierten a camelCase (`dependsOn`, `consumesApi`, `requiresAuth`). Esta conversión la hace el parser.

---

## Estructura completa

```json
{
  "modules": {
    "backend": [
      {
        "id": "auth-backend",
        "name": "Authentication",
        "description": "Handles user identity, session management and access control",
        "api": [
          "POST /auth/login",
          "POST /auth/register",
          "POST /auth/logout",
          "GET /auth/me"
        ],
        "database": ["users"],
        "dependsOn": [],
        "folders": [
          { "id": "controllers", "path": "src/controllers" },
          { "id": "services", "path": "src/services" }
        ],
        "files": [
          {
            "id": "auth-controller",
            "folder": "controllers",
            "path": "auth.controller.js",
            "type": "controller"
          },
          {
            "id": "auth-service",
            "folder": "services",
            "path": "auth.service.js",
            "type": "service"
          }
        ],
        "functions": {
          "auth-controller": [
            "login(username, password)",
            "register(username, password, birthDate)",
            "logout(token)"
          ],
          "auth-service": [
            "validateSession(token)",
            "hashPassword(password)",
            "generateToken(userId)"
          ]
        },
        "purpose": "Centralizes all logic related to user authentication.",
        "notes": "Passwords are always hashed with bcrypt before storage."
      }
    ],
    "frontend": [
      {
        "id": "auth-frontend",
        "name": "Auth Views",
        "description": "Handles the login and registration UI and session state",
        "screens": ["login", "register"],
        "consumesApi": ["auth-backend"],
        "dependsOn": [],
        "folders": [
          { "id": "views", "path": "src/modules/auth/views" },
          { "id": "stores", "path": "src/modules/auth/stores" }
        ],
        "files": [
          {
            "id": "login-view",
            "folder": "views",
            "path": "LoginView.vue",
            "type": "view"
          },
          {
            "id": "register-view",
            "folder": "views",
            "path": "RegisterView.vue",
            "type": "view"
          },
          {
            "id": "auth-store",
            "folder": "stores",
            "path": "auth.store.js",
            "type": "store"
          }
        ],
        "functions": {
          "login-view": [
            "handleLogin(username, password)",
            "goToRegister()"
          ],
          "register-view": [
            "handleRegister(username, password, birthDate)",
            "goToLogin()"
          ],
          "auth-store": [
            "setCurrentUser(user)",
            "clearSession()",
            "checkSession()"
          ]
        },
        "state": [
          "currentUser",
          "isAuthenticated",
          "authError",
          "isLoading"
        ],
        "purpose": "Covers the authentication UI and manages session state on the client.",
        "notes": null
      }
    ]
  },
  "screens": [
    {
      "id": "login",
      "name": "Login",
      "description": "Entry point for unauthenticated users",
      "module": "auth-frontend",
      "folder": "views",
      "file": "login-view",
      "requiresAuth": false,
      "routes": ["/auth/login", "/login"],
      "navigatesTo": ["dashboard", "register"],
      "components": ["LoginForm", "ErrorMessage"],
      "fullDescription": "Allows unauthenticated users to log in with their username and password.",
      "elements": [
        "username input",
        "password input",
        "submit button",
        "link to register screen"
      ],
      "actions": ["submit-login", "go-to-register"],
      "states": ["default", "loading", "error"]
    }
  ],
  "flows": [
    {
      "id": "user-login",
      "name": "User Login",
      "description": "Complete process from login form submission to dashboard access",
      "trigger": "user submits login form",
      "screens": ["login", "dashboard"],
      "modules": [
        {
          "id": "auth-frontend",
          "file": "login-view",
          "functions": ["handleLogin"]
        },
        {
          "id": "auth-backend",
          "file": "auth-controller",
          "functions": ["login"]
        }
      ],
      "database": ["users"],
      "steps": [
        "User enters username and password on the login screen",
        "handleLogin() validates the form and calls POST /auth/login",
        "login() validates credentials against the users table",
        "login() generates and returns a signed JWT token",
        "Frontend stores the token in localStorage and redirects to dashboard"
      ],
      "errorCases": [
        "Invalid credentials: login() returns 401, handleLogin() shows error on screen",
        "Server error: login() returns 500, handleLogin() shows generic error"
      ],
      "notes": "Session tokens are JWT signed with HS256 and expire after 24 hours."
    }
  ],
  "database": [
    {
      "id": "users",
      "name": "User",
      "description": "Stores registered user accounts",
      "usedBy": ["auth-backend", "projects-backend"],
      "relations": [
        { "target": "projects", "type": "one-to-many", "field": "user_id" },
        { "target": "sessions", "type": "one-to-many", "field": "user_id" }
      ],
      "table": "Table users {\n  id uuid [pk]\n  username varchar [not null, unique]\n  password_hash varchar [not null]\n  birth_date date\n  created_at timestamp [not null]\n  updated_at timestamp [not null]\n}\n\nRef: users.id < projects.user_id\nRef: users.id < sessions.user_id",
      "notes": "Passwords are never stored in plain text."
    }
  ],
  "systemRules": {
    "auth": [
      "All routes require authentication except /auth/login and /auth/register",
      "Sessions expire after 24 hours of inactivity",
      "Two roles exist: user and admin"
    ],
    "navigation": [
      "Unauthenticated users are redirected to /login",
      "After login, users are redirected to /dashboard"
    ],
    "validation": [
      "Passwords must be at least 8 characters and contain at least one number",
      "Usernames must be unique, between 3 and 30 characters"
    ],
    "conventions": [
      "API responses always use camelCase",
      "All timestamps are stored in UTC"
    ],
    "technicalDecisions": [
      "Session tokens are JWT signed with HS256 and expire after 24 hours",
      "Passwords are always hashed with bcrypt (cost factor 12)"
    ]
  }
}
```

---

## Campos que pueden ser null o array vacío

Cuando un campo opcional no está declarado en el archivo `.md` fuente, el parser lo incluye igualmente en el JSON con su valor vacío correspondiente. Esto evita que el frontend tenga que comprobar si el campo existe antes de usarlo.

| Tipo de campo | Valor cuando no está declarado |
|---------------|-------------------------------|
| Lista | `[]` |
| String opcional | `null` |
| Objeto opcional | `null` |

## Campos resueltos vs campos sin resolver

El JSON que devuelve el parser tiene todos los campos de referencia como **strings de ID** (por ejemplo, `"database": ["users"]`). No se sustituyen por los objetos completos referenciados.

El frontend dispone del modelo completo y puede cruzar los datos por ID cuando los necesite. Esto mantiene el JSON sin duplicaciones y sin referencias circulares.

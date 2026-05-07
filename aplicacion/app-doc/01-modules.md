---
type: modules-index
backend:
  - id: parser-backend
    name: Parser
frontend: []
file-types:
  backend:
    - controller
    - service
    - repository
    - router
    - helper
    - config
  frontend: []
---

## Overview
The backend currently consists of a single module: the parser. It receives .md documentation files via multipart HTTP upload, processes them through a sequential pipeline (extraction → YAML parsing → validation → model building → reference resolution → persistence) and returns a unified JSON model representing the application's architecture.

No frontend modules or additional backend modules are implemented yet.

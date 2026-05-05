# Gantt final de CodeAtlas

Versión refinada del plan de trabajo para la entrega del proyecto.

```mermaid
gantt
    title CodeAtlas · planificación final hasta la entrega
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m
    excludes    weekends

    section Análisis y definición
    Definición final del proyecto                     :done, a1, 2026-05-06, 1d
    Requisitos funcionales y no funcionales          :a2, after a1, 1d
    Casos de uso y UML inicial                       :a3, after a2, 1d
    Sistema de gestión vía web y originalidad        :a4, after a2, 1d
    Ampliaciones futuras y mantenimiento             :a5, after a3, 1d

    section Diseño funcional y técnico
    Formato MD y transformación visual               :b1, 2026-05-08, 1d
    Arquitectura general                             :b2, after b1, 1d
    Stack frontend y backend                         :b3, after b2, 1d
    Separación cliente servidor                      :b4, after b2, 1d
    Modelo de datos y web services                   :b5, after b3, 1d
    Integración mínima de IA                         :b6, after b5, 1d
    Estrategia de autenticación                      :b7, after b5, 1d

    section Base del proyecto
    Planificación inicial y base del Gantt           :c1, 2026-05-10, 1d
    Seguimiento semanal                              :c2, 2026-05-10, 13d
    Inicialización frontend y backend                :c3, 2026-05-10, 1d
    Configuración de base de datos                   :c4, after c3, 1d
    Autenticación básica                             :c5, after c4, 1d
    Estructura principal del proyecto                :c6, after c3, 2d
    Diseño de pantallas principales                  :c7, after c3, 2d

    section MVP documentación estructurada
    Inicio parser MD                                 :d1, 2026-05-11, 1d
    Parser MD completo                               :d2, after d1, 2d
    Subida y lectura de archivos MD                  :d3, after d2, 1d
    Procesado de documentos                          :d4, after d3, 1d
    Representación visual principal                  :d5, after d4, 2d
    Integración frontend backend base de datos       :d6, after d5, 1d
    Pruebas base del MVP                             :d7, after d6, 1d
    Planificación de tests                           :d8, after d6, 1d
    Cierre MVP                                       :milestone, d9, after d7, 0d

    section Documentación paralela
    Memoria primer avance                            :e1, 2026-05-12, 5d
    Manual técnico primer avance                     :e2, 2026-05-12, 5d
    Manual de usuario primer avance                  :e3, 2026-05-12, 5d
    Justificación plataforma desarrollo producción   :e4, 2026-05-15, 1d
    Anexos iniciales                                 :e5, 2026-05-16, 1d

    section Aplicación completa
    Análisis de aplicaciones ya creadas              :f1, 2026-05-18, 1d
    Detección de archivos y módulos                  :f2, after f1, 1d
    Detección de funciones relaciones e imports      :f3, after f2, 1d
    Transformación al formato CodeAtlas              :f4, after f3, 1d
    Integración visual segunda funcionalidad         :f5, after f4, 1d
    Revisión técnica global                          :f6, after f5, 1d

    section Calidad y seguridad
    Revisión de errores                              :g1, 2026-05-20, 2d
    Seguridad básica                                 :g2, 2026-05-20, 1d
    Robustez ante fallos y ataques comunes           :g3, after g2, 1d
    Responsive y multidispositivo                    :g4, 2026-05-22, 1d
    SSH seguro y HTTPS                               :g5, 2026-05-22, 1d

    section Cierre y entrega
    Entorno de producción                            :h1, 2026-05-22, 1d
    Despliegue y URL final                           :h2, after h1, 1d
    Memoria final                                    :h3, 2026-05-22, 1d
    Manual técnico final                             :h4, 2026-05-22, 1d
    Manual de usuario final                          :h5, 2026-05-22, 1d
    Anexos finales                                   :h6, 2026-05-22, 1d
    Presentación multimedia                          :h7, 2026-05-22, 1d
    Revisión texto diapositivas                      :h8, after h7, 1d
    Guion final                                      :h9, 2026-05-22, 1d
    Exportación PDF y material Moodle/nube           :h10, after h3, 1d
    Defensa individual y ensayo                      :h11, 2026-05-22, 1d
    Punto de innovación                              :h12, 2026-05-22, 1d
    Entrega lista                                    :milestone, h13, after h10, 0d
```

## Observaciones

- El MVP se cierra primero, pero el objetivo sigue siendo llegar con la aplicación completa.
- La documentación no se deja solo para el final, sino que avanza en paralelo.
- El cierre del 22 de mayo concentra despliegue, revisión final, documentación final y defensa.

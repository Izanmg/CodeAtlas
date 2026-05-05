# Resumen de requisitos y criterios del proyecto de síntesis DAW

Este documento resume lo más importante de los archivos de `documentos-clase`, con foco en qué hay que entregar, qué requisitos mínimos debe cumplir la aplicación y qué condiciones afectan al desarrollo, la defensa y la evaluación del proyecto.

## 1. Qué exige el proyecto como base

Según la guía del proyecto de síntesis, el trabajo debe consistir en una **aplicación web** y el tema es libre, pero **debe incluir un sistema de gestión a través de web**.

Además, el proyecto debe cubrir la lógica general del ciclo DAW:

- desarrollar la aplicación
- implantarla
- mantenerla
- garantizar acceso seguro a los datos
- respetar accesibilidad, usabilidad y calidad

## 2. Qué debe tener la aplicación como mínimo

### Requisitos técnicos generales

- El proyecto **debe implementarse y ponerse en producción**.
- En la defensa hay que **justificar la plataforma de desarrollo y la de producción**.
- Hay que **indicar la URL** donde está desplegado el proyecto.
- La documentación debe reflejar las **fases de la ingeniería del software**.
- Las especificaciones deben hacerse con **diagramas UML y/o casos de uso**.
- Hay que hacer una **planificación inicial con Gantt**.
- Hay que incluir **planificación de ampliaciones y mantenimiento**, aunque no se lleguen a desarrollar.
- Hay que incluir **planificación de tests** alineada con el reparto del trabajo.

### Seguridad obligatoria

- La aplicación debe ser **robusta ante SQL injection u otros ataques**.
- El acceso al servidor debe hacerse por **SSH seguro**.
- **FTP está prohibido**.
- Debe usarse **HTTPS** para cifrar contraseñas e información confidencial.

### Requisitos no funcionales mínimos

- Uso obligatorio de **framework de backend**.
- Uso obligatorio de **framework de frontend**.
- **Web Services obligatorios**.
- HTML validado y diseño **responsive / multidispositivo**.
- Separación entre **parte cliente** y **parte servidor**.
- **Registro y autenticación de usuarios**.
- **Base de datos** relacional o no relacional con **mínimo 3 tablas o colecciones relacionadas entre sí**.
- Integración de **al menos un modelo de IA** para resolver alguna utilidad o aspecto del sistema.

## 3. Qué hay que entregar

El material a presentar debe incluir, como mínimo:

- **Manual técnico** en formato digital
- **Manual de usuario** en formato digital
- **Memoria del trabajo** en formato digital
- **Anexos** en formato digital
- **Enlace al proyecto funcional en producción**
- **Guion escrito de la exposición** basado en la memoria
- **Presentación multimedia** de la exposición

Los documentos PDF deben subirse a Moodle o, si pesan demasiado, alojarse en nube y dejar el enlace en Moodle.

## 4. Qué debe llevar cada documento

## 4.1 Memoria del proyecto

La memoria **no es lo mismo que el manual técnico**. Debe explicar el trabajo realizado de forma organizada, clara y precisa.

### Límites y puntos clave

- Máximo **20 páginas**
- Debe servir de base para la **exposición oral**
- Debe reflejar:
  - objetivos
  - proceso seguido
  - planificación
  - desarrollo
  - problemas encontrados
  - soluciones aplicadas
  - resultados
  - conclusiones
  - referencias

### Estructura recomendada de la memoria

- Portada
- Resumen ejecutivo
- Índice
- Introducción
- Planificación
- Desarrollo del proyecto
- Evaluación y resultados
- Conclusiones
- Referencias y bibliografía
- Anexos

### Lo más importante para nuestro caso

La memoria debe dejar muy claro:

- qué problema resuelve la aplicación
- qué objetivos tiene el proyecto
- cuál es su alcance real
- cómo se planificó
- qué se llegó a implementar
- qué quedó pendiente como ampliación futura
- qué decisiones técnicas se tomaron y por qué
- qué problemas aparecieron y cómo se resolvieron

## 4.2 Manual técnico

El manual técnico está orientado a que **otro técnico pueda entender, instalar, configurar, desplegar y mantener el proyecto**.

No hace falta repetir aquí toda la plantilla, pero sí seguir el patrón general marcado en los documentos de clase.

### Lo esencial que debe cubrir

- arquitectura general del sistema
- stack tecnológico
- estructura del proyecto
- entorno técnico y dependencias
- instalación y configuración
- despliegue
- base de datos
- APIs e integraciones
- seguridad
- logs, mantenimiento y resolución de problemas

### En la práctica, para este proyecto

El manual técnico deberá permitir que otra persona pueda:

- levantar el proyecto en local
- entender su estructura
- configurar variables y servicios
- desplegarlo
- mantenerlo o ampliarlo

## 4.3 Manual de usuario

El manual de usuario debe estar pensado para el **usuario final**, con lenguaje claro y apoyado en capturas o explicaciones visuales.

Tampoco hace falta repetir toda la plantilla en este resumen, pero sí respetar el patrón definido en los documentos de clase.

### Lo esencial que debe cubrir

- qué es la aplicación
- cómo se accede
- cómo se usa
- funciones principales
- procedimientos habituales
- resolución de dudas o problemas frecuentes

## 5. Planificación y seguimiento: obligatorio

Antes de empezar se pide una **previsión de planificación y temporización**.

Durante el proyecto se pide una **planificación semanal**, indicando:

- qué se hizo la semana anterior
- qué se hará la siguiente

Además:

- debe usarse software de planificación, por ejemplo **Trello**
- hay que comparar la planificación inicial con la evolución real
- el seguimiento debe reflejar desviaciones y avances

Los documentos de calendarización insisten en varias ideas importantes:

- dividir el proyecto en tareas manejables
- definir dependencias entre tareas
- asignar tiempos realistas
- asignar responsables
- definir resultados concretos por tarea
- asociar tareas a hitos
- revisar el progreso periódicamente

## 6. Exposición y defensa

La exposición será por grupos, con aproximadamente:

- **20 minutos de exposición**
- resto del tiempo para preguntas

Puntos importantes:

- se basa en la **memoria**
- requiere **guion previo**
- requiere **presentación multimedia**
- cada miembro debe poder **defender cualquier parte** del proyecto

Además, en la presentación **no debe abusarse del texto**. Solo puede aparecer texto en el título de la diapositiva y, si hace falta, dentro de imágenes o esquemas.

## 7. Evaluación: qué pesa de verdad

La nota es **individual**, aunque el proyecto pueda hacerse en grupo.

Se evalúan tres bloques principales más innovación:

- **Trabajo hecho durante el tiempo lectivo**: 20%
- **Material entregado**: 45%
- **Exposición individual**: 25%
- **Innovación**: 10%

### Consecuencias prácticas

Para sacar buena nota no basta con que la app funcione. También importa mucho:

- trabajar de verdad durante el proceso
- entregar documentación buena y coherente
- defender bien el proyecto oralmente
- que el material tenga calidad visual y técnica
- que el proyecto tenga algo innovador

Además, se indica expresamente que:

- cada parte evaluable debe quedar superada
- el proyecto debe ser **original**
- el **plagio implica suspenso**

## 8. Producción y servidor

En la documentación también aparece una guía de acceso al servidor de aplicaciones de DAW y al entorno Kubernetes.

### Lo más importante aquí

- el proyecto debe quedar **desplegado en producción**
- hay acceso por **SSH** al entorno del grupo
- se trabaja con recursos compartidos, así que conviene ser moderado con consumo de disco y recursos
- si se usan cuotas o límites, los contenedores deben declarar correctamente `requests` y `limits`
- el despliegue y la infraestructura deben poder justificarse en la defensa

Para nosotros esto significa que no basta con desarrollar localmente: habrá que pensar desde pronto en **cómo desplegar CodeAtlas** y cómo explicar bien ese despliegue.

## 9. Qué implica esto para CodeAtlas

Si aterrizamos todos estos documentos al proyecto CodeAtlas, lo más importante es esto:

### Mínimos que no deberíamos olvidar

- app web funcional
- sistema de gestión vía web
- frontend y backend separados
- frameworks en ambos lados
- web service
- autenticación de usuarios
- base de datos con mínimo 3 entidades relacionadas
- integración de IA
- despliegue real en producción
- documentación completa
- planificación y seguimiento
- exposición defendible

### Enfoque sensato para llegar a tiempo

Dado el tiempo limitado, conviene priorizar:

1. cerrar un **MVP claro y defendible**
2. asegurar que cumple los **mínimos obligatorios**
3. dejar bien preparada la **documentación**
4. mantener una **planificación semanal realista**
5. preparar desde pronto la **puesta en producción**

## 10. Recomendación operativa

La lectura conjunta de estos documentos deja una conclusión clara: el proyecto no se evalúa solo por la aplicación, sino por el conjunto completo formado por:

- aplicación funcional
- despliegue
- planificación
- memoria
- manual técnico
- manual de usuario
- exposición

Por tanto, CodeAtlas debe desarrollarse como un producto entregable completo, no solo como código.

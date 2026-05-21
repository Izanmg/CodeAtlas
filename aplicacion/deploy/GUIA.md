# Guía de despliegue — CodeAtlas en Kubernetes (grup5)

Despliegue de CodeAtlas en el clúster del cole (infla.cat).
URL final: **http://grup5.infla.cat**

## Datos del grupo

- SSH (exterior): `ssh -p 2269 grup5@infla.cat` · pass `Azrr7yoz3f`
- SSH (interior aula): `ssh grup5@10.52.5.102`
- Namespace: `grup5` · ClusterIP fija: `10.96.5.101`
- Harbor (registro Docker): `https://infla.cat:2270` (mismas credenciales que SSH)

## Arquitectura desplegada

- **MySQL 8** — Deployment + PVC (datos persistentes) + Service. El volcado
  completo de tu BD local (`codeatlas-dump.sql`, estructura + TODOS los datos)
  se carga automáticamente la PRIMERA vez que arranca, vía un ConfigMap.
- **Backend** (Node/Express, puerto 3000) — Deployment + Service.
- **Frontend** (Vue compilado + Nginx) — Deployment + Service ClusterIP `10.96.5.101`.
  Nginx sirve los estáticos y proxea `/api` → backend. El cole redirige
  `grup5.infla.cat` a esa IP.

## Archivos

```
backend/Dockerfile        imagen Node
frontend/Dockerfile       build Vite + Nginx (multi-stage)
frontend/nginx.conf       SPA + proxy /api
deploy/01-secret.yaml     passwords, JWT, API key Gemini
deploy/02-mysql.yaml      MySQL + PVC (carga el dump al arrancar)
deploy/03-backend.yaml    API + Service
deploy/04-frontend.yaml   Nginx + Service ClusterIP 10.96.5.101
deploy/codeatlas-dump.sql volcado completo de tu BD local (datos incluidos)
```

---

## Pasos

### 1. Secretos
`deploy/01-secret.yaml` YA viene relleno con contraseñas generadas y tu
`GEMINI_API_KEY` real. No tienes que tocar nada.
OJO: contiene credenciales reales -> no subas este archivo a un repo público.

### 2. Empaqueta y sube el código (en tu PC, PowerShell, desde `aplicacion/`)
El backend necesita tambien la carpeta `ia-doc/` (guia de IA del bot).
```powershell
tar --exclude=node_modules --exclude=.git -czf codeatlas-src.tgz backend frontend ia-doc deploy
# Desde la red del cole: 10.52.5.102 (puerto 22). Exterior: -P 2269 grup5@infla.cat
scp codeatlas-src.tgz grup5@10.52.5.102:~/
```

### 3. Conéctate y construye en el servidor
```bash
ssh grup5@10.52.5.102                 # desde el cole. Exterior: ssh -p 2269 grup5@infla.cat
mkdir -p ~/aplicacion && tar -xzf codeatlas-src.tgz -C ~/aplicacion
cd ~/aplicacion
docker login kube0.lacetania.cat      # user grup5 (pass de Harbor, distinta de la de SSH)
# Backend: contexto = aplicacion/ (incluye backend + ia-doc), por eso el -f y el "."
docker build -f backend/Dockerfile -t kube0.lacetania.cat/grup5/codeatlas-backend:1.0 .
docker build -t kube0.lacetania.cat/grup5/codeatlas-frontend:1.0 ./frontend
docker push kube0.lacetania.cat/grup5/codeatlas-backend:1.0
docker push kube0.lacetania.cat/grup5/codeatlas-frontend:1.0
```
> El registro real es `kube0.lacetania.cat` (su certificado es para ese nombre).
> El proyecto `grup5` ya existe en Harbor. La contraseña de Harbor es DISTINTA de
> la de SSH (suele quedar cacheada en `~/.docker/config.json` si ya entraste en clase).

### 4. Secreto para descargar de Harbor (proyecto privado)
```bash
kubectl create secret docker-registry harbor-cred \
  --docker-server=kube0.lacetania.cat --docker-username=grup5 \
  --docker-password=<TU_PASS_HARBOR> -n grup5
```
Si haces el proyecto público, borra las líneas `imagePullSecrets` de los dos
deployments.

### 5. Crea el ConfigMap con los datos de la BD
A partir del volcado, para que MySQL lo cargue solo al arrancar:
```bash
kubectl create configmap codeatlas-initdb \
  --from-file=deploy/codeatlas-dump.sql -n grup5
```

### 6. Despliega
```bash
kubectl apply -f deploy/
kubectl get pods -n grup5 -w     # espera a que los 3 estén Running
```
> Importante: los datos solo se cargan la PRIMERA vez (volumen vacío). Si más
> tarde regeneras el dump y quieres recargarlo, borra el ConfigMap y el PVC,
> vuelve a crearlos y reinicia el pod de MySQL (pierdes lo que hubiera en prod).

### 7. Comprueba
Abre **http://grup5.infla.cat** en el navegador.

---

## Diagnóstico

```bash
kubectl get pods,svc -n grup5
kubectl logs -n grup5 deploy/codeatlas-backend
kubectl logs -n grup5 deploy/codeatlas-mysql
kubectl describe resourcequota -n grup5     # ver la cuota real del namespace
```

- **Cuota más pequeña de lo previsto** → baja los `limits` de los pods.
- **Recargar el schema** (resetea la BD, pierdes datos):
  `kubectl delete pvc codeatlas-mysql-pvc -n grup5` y vuelve a aplicar.
- **MySQL no arranca por permisos en `/var/lib/mysql`** (NFS) → mira los logs;
  puede requerir ajustar permisos del volumen con el profe.
- **Certificado de Harbor no válido** → acéptalo / configura el registro como
  inseguro según os enseñaron en clase de Desplegament.

# 📱 SÍNTESIS — Cliente Móvil Nativo (React Native & Expo)

<div align="center">
  <img src="https://img.shields.io/badge/Estado-PRODUCCI%C3%93N_STABLE-success" alt="Estado" />
  <img src="https://img.shields.io/badge/React_Native-0.76-000000?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-52-black?logo=expo" alt="Expo SDK 52" />
  <img src="https://img.shields.io/badge/Expo_Router-v4-black?logo=expo" alt="Expo Router v4" />
  <img src="https://img.shields.io/badge/TypeScript-Estricto-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-Estado_Global-orange" alt="Zustand" />
</div>

> **Sistema INtegral Tecnológico para la Enseñanza y el Seguimiento Interactivo Secuencial.**

Aplicación móvil nativa del ecosistema **SÍNTESIS**, diseñada con alta ergonomía visual y accesibilidad pedagógica para estudiantes de educación básica/media y docentes en formación de la Escuela Normal Superior María Auxiliadora de Girardot.

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura de Roles y Navegación (RBAC)](#-arquitectura-de-roles-y-navegación-rbac)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Seguridad y Red](#-seguridad-y-red)
6. [Instalación y Uso Local](#-instalación-y-uso-local)
7. [Compilación APK y EAS Build](#-compilación-apk-y-eas-build)

---

## 🚀 Características Principales

* **Consumo Integral de OVAs:** Visualización de Objetos Virtuales de Aprendizaje con soporte multimedia avanzado:
  * Videos MP4 directos con `expo-video` y soporte de pantalla completa en orientación horizontal.
  * Videos de YouTube con `react-native-youtube-iframe`.
  * Recursos web embebidos (Vimeo, Loom, TikTok, Drive) en `WebView`.
  * Lector de texto enriquecido estructurado con controles de zoom tipográfico dinámico (`A-` / `A+`).
* **Evaluación Interactiva en Tiempo Real:** Realización de pruebas por OVA con opciones de respuesta interactiva, temporización y calificación automática contra el backend.
* **Módulo de Progreso del Estudiante:**
  * **Resumen General:** Total de intentos, promedio porcentual y evaluaciones aprobadas.
  * **Progreso por Materia:** Lista paginada y con buscador independiente, indicadores de nota más alta y baja, cantidad de evaluaciones aprobadas y barra de avance porcentual.
  * **Exportación PDF:** Generación y compartición nativa de reportes de rendimiento académico vía `expo-print` y `expo-sharing`.
* **Historial de Intentos Dedicado (`history.tsx`):**
  * Pantalla propia accesible desde Progreso con métricas acumuladas (Total intentos, Aprobados).
  * Buscador por nombre de evaluación y paginación para auditoría detallada de notas históricas.
* **Navegación Robusta (MOV-23):** Helper reutilizable `goBackOrTo` en `src/utils/navigation.ts` para garantizar retornos limpios en el stack de navegación, evitando bucles hacia la pantalla de inicio.

---

## 👥 Arquitectura de Roles y Navegación (RBAC)

El proyecto utiliza `expo-router` con guardias de redirección por rol en los layouts:

| Rol | Ruta Base | Funcionalidades |
| :--- | :--- | :--- |
| **Estudiante** | `app/(student)` | Exploración de materias, unidades temáticas, OVAs, evaluaciones, visor de progreso académico e historial de intentos. |
| **Docente** | `app/(teacher)` | Auditoría rápida de grupos y seguimiento de evaluaciones en movilidad. |
| **Trainee (Practicante)** | `app/(trainee)` | Modo de observación pedagógica de solo lectura con bloqueo de red para operaciones mutables. |

---

## 🛠️ Stack Tecnológico

* **Core:** React Native + Expo SDK 52 (Nueva Arquitectura compatible).
* **Navegación:** Expo Router v4 (basado en el sistema de archivos con soporte para Tabs y Stacks anidados).
* **Estado Global:** Zustand con persistencia en `AsyncStorage` y tokens en almacenamiento seguro.
* **Cliente HTTP:** Axios con interceptores para inyección de JWT Bearer y encolado automático de Refresh Token en errores `401`.
* **Multimedia:** `expo-video`, `react-native-youtube-iframe`, `react-native-webview`, `expo-screen-orientation`.
* **Documentos & Reportes:** `expo-print` y `expo-sharing`.
* **Feedback y Notificaciones:** `react-native-toast-message`.
* **Tipado:** TypeScript 5.3 en modo estricto.

---

## 📂 Estructura del Proyecto

```text
sintesis-mobile/
├── app/                          # Rutas de Expo Router
│   ├── (auth)/                   # Login y recuperación de credenciales
│   ├── (student)/                # Portal del estudiante
│   │   ├── subjects/             # Listado de materias asignadas
│   │   ├── ovas/                 # Exploración de OVAs, visor de video, texto y examen
│   │   ├── progress/             # Tab de Progreso: métricas, materias paginadas
│   │   │   ├── index.tsx         # Dashboard de rendimiento y exportación PDF
│   │   │   └── history.tsx       # Pantalla independiente de historial de intentos
│   │   └── profile/              # Perfil de usuario y cierre de sesión
│   ├── (teacher)/                # Vistas móviles para docentes
│   ├── (trainee)/                # Vistas de solo lectura para practicantes
│   ├── _layout.tsx               # Entrypoint con providers de tema y auth
│   └── index.tsx                 # Redirección automática según rol
│
├── src/                          # Lógica de negocio y dominio
│   ├── api/                      # Clientes Axios (authApi, academicApi)
│   ├── hooks/                    # Custom Hooks (useColors, etc.)
│   ├── models/                   # Interfaces de TypeScript (AcademicGroup, OVA, Exam, etc.)
│   ├── store/                    # Stores de Zustand (authStore, themeStore)
│   ├── theme/                    # Paleta de colores dinámica (claro y oscuro)
│   └── utils/                    # Helpers: navigation.ts (goBackOrTo), pdfExport.ts
│
├── assets/                       # Iconos, splash screens y fuentes
├── app.json                      # Configuración de Expo y EAS (com.sintesis.app)
└── eas.json                      # Perfiles de compilación para Android (APK y AAB)
```

---

## 🛡️ Seguridad y Red

1. **Bloqueo Local por Rol:** Interceptores de Axios impiden que usuarios con rol *Trainee* envíen mutaciones (`POST`, `PUT`, `DELETE`), protegiendo la base de datos de modificaciones accidentales.
2. **Cola de Refresco de Token:** Si el access token caduca, las peticiones concurrentes se pausan mientras se solicita un nuevo token de fondo y se reintentan de forma transparente sin expulsar al usuario.
3. **Manejo Seguro de Almacenamiento:** Las sesiones persistentes se sincronizan sin comprometer claves críticas.

---

## ⚙️ Instalación y Uso Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Bonifacho/SINTESIS_MOBILE.git
   cd FRONT_MOBILE/sintesis-mobile
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar el archivo `.env`**:
   Crear un archivo `.env` en la raíz:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XX:5000  # O la URL de Render en producción
   ```

4. **Verificar tipado**:
   ```bash
   npx tsc --noEmit
   ```

5. **Iniciar el servidor de Expo**:
   ```bash
   npx expo start -c
   ```
   Escanear el código QR con **Expo Go** o presionar `a` para abrir en el emulador de Android.

---

## 📦 Compilación APK y EAS Build

El proyecto está configurado para empaquetarse de manera autónoma con **Expo Application Services (EAS)**:

* **Package ID:** `com.sintesis.app`
* **Perfil de Compilación:** `preview` (genera un archivo `.apk` instalable directamente sin pasar por Play Store).

Para compilar un nuevo APK en la nube:
```bash
npx eas-cli build -p android --profile preview
```

---
*Desarrollado para el proyecto académico SÍNTESIS (2026).*
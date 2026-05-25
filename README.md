# 📱 SÍNTESIS - Frontend Móvil (LMS React Native)

<div align="center">
  <img src="https://img.shields.io/badge/Estado-PRODUCCI%C3%93N_MVP-success" alt="Estado MVP" />
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_52-000000?logo=react" alt="React Native Expo" />
  <img src="https://img.shields.io/badge/TypeScript-Estricto-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-Estado_Global-orange" alt="Zustand" />
</div>

> **Sistema INtegral Tecnológico para la Enseñanza y el Seguimiento Interactivo Secuencial.**

**SÍNTESIS** es una plataforma educativa de nueva generación diseñada para transformar la enseñanza y el seguimiento académico, con un enfoque particular en ciencias exactas (como la Química). Este repositorio contiene el **Cliente Móvil Nativo**, construido para ofrecer una experiencia fluida, segura y ergonómicamente diseñada para estudiantes de educación básica/media y docentes en formación (Normal Superior María Auxiliadora de Girardot).

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura de Roles (RBAC)](#-arquitectura-de-roles-rbac)
3. [Stack Tecnológico](#-stack-tecnológico)
4. [Estructura del Proyecto y Navegación](#-estructura-del-proyecto-y-navegación)
5. [Seguridad y Red](#-seguridad-y-red)
6. [Instalación y Uso Local](#-instalación-y-uso-local)

---

## 🚀 Características Principales

* **Consumo de OVAs Interactivos:** Interfaz optimizada para renderizar Objetos Virtuales de Aprendizaje y material audiovisual sin distracciones, utilizando Stacks anidados para preservar el contexto de navegación.
* **Evaluación Automatizada:** El sistema descarga la carga operativa del docente calculando métricas y resultados desde el backend en tiempo real.
* **Navegación Aislada (Guards):** Rutas completamente protegidas e independientes basadas en el rol del usuario autenticado y su Token JWT.
* **Sistema de Diseño Centralizado:** Implementación del hook `useColors` para garantizar consistencia visual total en toda la aplicación, reduciendo la fatiga visual.

---

## 👥 Arquitectura de Roles (RBAC)

El sistema maneja tres universos de navegación a través de `expo-router`, garantizando que cada usuario vea únicamente las herramientas de su competencia:

| Rol | Dominio / Ruta | Funcionalidades Clave |
| :--- | :--- | :--- |
| **Estudiante** | `app/(student)` | Exploración de materias, consumo de OVAs, evaluación interactiva y métricas de progreso personal. |
| **Docente** | `app/(teacher)` | Panel de administración, gestión de grupos asignados, auditoría de resultados y seguimiento del alumnado. |
| **Trainee** | `app/(trainee)` | *Rol de Solo Lectura.* Diseñado para practicantes. Permite observar métricas para investigación pedagógica **sin riesgo** de alterar la base de datos gracias a bloqueos a nivel de red. |

---

## 🛠️ Stack Tecnológico

Este proyecto implementa los estándares más altos de desarrollo móvil actual:

* **Core UI:** React Native + Expo (Arquitectura basada en archivos y `expo-router`).
* **Gestión de Estado Persistente:** Zustand con middlewares (`AsyncStorage` / `expo-secure-store`) para mantener sesiones vivas.
* **Capa de Red HTTP:** Axios con Interceptores globales para inyección de JWT y manejo de errores 401.
* **Componentes UI Dinámicos:** Integración de reproductores de Video, renderizadores PDF, y Toast Notifications no intrusivas.

---

## 📂 Estructura del Proyecto y Navegación

El código fuente sigue los principios de **Clean Architecture**, separando la UI de la lógica de negocio, y utiliza una sofisticada combinación de **Tabs y Stacks** para una experiencia nativa.

```text
sintesis-mobile/
│
├── app/                      # Capa de Presentación (Expo Router)
│   ├── (auth)/               # Pantallas públicas (Login, Recuperación de clave)
│   ├── (student)/            # Tabs de Estudiante (con sub-stacks anidados para OVAS)
│   ├── (teacher)/            # Tabs de Docente (con sub-stacks anidados para Actividades)
│   ├── (trainee)/            # Tabs del Practicante
│   ├── _layout.tsx           # Entry point, Middleware de Auth y control de gestos
│   └── index.tsx             # Semáforo de Redirección según Rol
│
├── src/                      # Capa de Dominio y Lógica de Negocio
│   ├── api/                  # Axios Interceptors, authApi.ts, academicApi.ts
│   ├── components/           # UI reutilizable (SearchableSelect, PaginatedList)
│   ├── hooks/                # Custom Hooks (useColors)
│   ├── models/               # Interfaces estricta en TypeScript
│   └── store/                # Memoria persistente Zustand
│
└── assets/                   # Iconos, Fuentes y Splash Screen
```

---

## 🛡️ Seguridad y Red

SÍNTESIS incorpora protecciones avanzadas en el lado del cliente móvil:
1. **RBAC por Interceptores (Practicantes):** Todo intento de enviar peticiones de escritura (`POST`, `PUT`, `DELETE`) por parte de un usuario *Trainee* es interceptado y bloqueado localmente por Axios antes de salir del dispositivo, asegurando la integridad académica.
2. **Refresh Token Queue:** Si el token caduca a mitad de una sesión, el sistema encola las peticiones, solicita un nuevo JWT de fondo sin molestar al usuario y reintenta las solicitudes de manera transparente.
3. **Visibilidad Segura:** Toggles de contraseñas implementados en todas las vistas de Auth para garantizar correcta escritura de credenciales, y manejo de errores nativos mediante `react-native-toast-message`.

---

## 💻 Instalación y Uso Local

Para ejecutar el proyecto de forma local para pruebas o desarrollo:

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` en la raíz copiando la estructura de configuración requerida (Asegúrate de enlazar la API correcta, sea tu `localhost` o la de producción en *Render*).
3. Inicia el servidor de desarrollo de Expo:
   ```bash
   npx expo start -c
   ```
4. Escanea el código QR con la app **Expo Go** en tu celular Android/iOS, o presiona `a` para abrir el emulador de Android.
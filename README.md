# 📱 SÍNTESIS - Frontend Móvil

> **Sistema INtegral Tecnológico para la Enseñanza y el Seguimiento Interactivo Secuencial.**

Repositorio oficial del frontend móvil de SÍNTESIS. Este LMS (Learning Management System) de rigor académico está construido con React Native y Expo. Su arquitectura de interfaz está diseñada bajo estrictos principios de ergonomía visual, psicología del color y baja carga cognitiva, con el objetivo principal de facilitar la gestión y el consumo de Objetos Virtuales de Aprendizaje (OVAs) optimizando la concentración del estudiante.

---

## 🛠️ Stack Tecnológico

Este proyecto se mantiene a la vanguardia de las normativas de desarrollo móvil (estándares 2026):

* **Framework Core:** React Native (con Nueva Arquitectura y motor Hermes) + Expo.
* **Enrutamiento:** Expo Router (Navegación basada en sistema de archivos).
* **Gestión de Estado:** Zustand (Estado global ligero y predecible).
* **Capa de Red:** Axios (Peticiones HTTP con interceptores de seguridad).
* **Almacenamiento Seguro:** Expo Secure Store (Bóveda nativa para JWT).

---

## 🏗️ Arquitectura de Navegación

La aplicación implementa un sistema de ruteo basado en roles, separando estrictamente los flujos para garantizar la seguridad y la experiencia de usuario:

1. **Auth Stack (`/auth`):** Flujo de autenticación seguro y de pantalla completa.
2. **Student Tabs (`/student`):** * Barra de navegación inferior: *Inicio, Materias, Progreso*.
   * *Nota Arquitectónica:* El consumo de OVAs es un sub-nivel de navegación para no saturar el menú principal.
3. **Teacher Tabs (`/teacher`):** * Barra de navegación inferior: *Mis Grupos, Resultados (Estadísticas)*.

---

## 🎨 Identidad Visual y Ergonomía Cognitiva

Para evitar la fatiga visual en sesiones prolongadas de estudio, la UI sigue este manual estricto:

* **Fondo Principal (Anti-fatiga):** Blanco Grisáceo (`#F8FAFC`).
* **Tarjetas y Superficies:** Blanco Puro (`#FFFFFF`).
* **Color Primario (Acción/Header):** Índigo Institucional (`#4F46E5`).
* **Color Secundario (Alertas visuales):** Ámbar (`#F59E0B`).
* **Textos de Alto Contraste:** Gris Pizarra Oscuro (`#0F172A`).

---

## 🔐 Seguridad y Autenticación

El sistema implementa un protocolo estricto de autenticación con JSON Web Tokens (JWT). 
* Las contraseñas y tokens **nunca** se almacenan en texto plano ni en `AsyncStorage`. Se utiliza la bóveda encriptada del dispositivo mediante `expo-secure-store`.
* Todas las peticiones al backend pasan por un interceptor de Axios que inyecta automáticamente el Bearer Token en las cabeceras.

---

## 🚀 Instrucciones de Desarrollo

### Requisitos Previos
* Node.js (v22 o superior recomendado)
* Cuenta y CLI de Expo (`npm install -g eas-cli`)

### Instalación local

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/TU_USUARIO/sintesis-movil.git](https://github.com/Bonifacho/sintesis-movil.git)
   cd sintesis-movil
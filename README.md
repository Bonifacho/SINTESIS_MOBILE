# 📱 SÍNTESIS - Frontend Móvil (LMS React Native)

<div align="center">
  <img src="https://img.shields.io/badge/Estado-MVP_Terminado-success" alt="Estado MVP" />
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
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Identidad Visual y Ergonomía](#-identidad-visual-y-ergonomía)
6. [Seguridad y Red](#-seguridad-y-red)
7. [Instalación y Configuración](#-instalación-y-configuración)

---

## 🚀 Características Principales

* **Consumo de OVAs Interactivos:** Interfaz optimizada para renderizar Objetos Virtuales de Aprendizaje sin distracciones.
* **Evaluación Automatizada:** El sistema descarga la carga operativa del docente calculando métricas y resultados desde el backend.
* **Navegación Aislada:** Rutas completamente protegidas e independientes basadas en el rol del usuario autenticado.
* **Diseño Anti-Fatiga:** Paleta de colores científicamente seleccionada para reducir la carga cognitiva en sesiones prolongadas.

---

## 👥 Arquitectura de Roles (RBAC)

El sistema maneja tres universos de navegación a través de `expo-router`, garantizando que cada usuario vea únicamente las herramientas de su competencia:

| Rol | Dominio / Ruta | Funcionalidades Clave |
| :--- | :--- | :--- |
| **Estudiante** | `app/(student)` | Exploración de materias, consumo de OVAs, evaluación interactiva y métricas de progreso personal. |
| **Docente** | `app/(teacher)` | Panel de administración, gestión de grupos asignados, auditoría de resultados y seguimiento del alumnado. |
| **Trainee** | `app/(trainee)` | *Rol de Solo Lectura.* Diseñado para docentes practicantes. Permite observar métricas y dinámicas de grupo para investigación pedagógica sin riesgo de alterar la base de datos. |

---

## 🛠️ Stack Tecnológico

Este proyecto implementa los estándares más altos de desarrollo móvil actual:

* **Core UI:** React Native + Expo (Arquitectura basada en archivos).
* **Navegación:** Expo Router (Tabs y Stacks anidados).
* **Gestión de Estado:** Zustand (Ligero, rápido y libre de boilerplate).
* **Capa de Red:** Axios (Configurado con Interceptores globales).
* **Almacenamiento Seguro:** Expo Secure Store (Bóveda nativa de iOS/Android para JWT).
* **Tipado Estricto:** TypeScript (Modelos reflejados directamente del Entidad-Relación).

---

## 📂 Estructura del Proyecto

El código fuente sigue los principios de **Clean Architecture**, separando la UI de la lógica de negocio:

```text
sintesis-mobile/
│
├── app/                      # Capa de Presentación (Expo Router)
│   ├── (auth)/               # Pantallas públicas (Login)
│   ├── (student)/            # Tabs y Stacks del Estudiante
│   ├── (teacher)/            # Tabs y Stacks del Docente
│   ├── (trainee)/            # Tabs y Stacks del Practicante
│   ├── _layout.tsx           # Entry point y Provider global
│   └── +not-found.tsx        # Fallback 404
│
├── src/                      # Lógica de Negocio y Configuración
│   ├── api/                  # Configuración de Axios e interceptores
│   ├── models/               # Interfaces TS (Contratos de datos)
│   ├── store/                # Zustand Stores (AuthStore, etc.)
│   └── theme/                # Sistema de Diseño (Colores, Tipografía)
│
└── components/               # Componentes UI reutilizables
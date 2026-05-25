// src/api/academic.ts
import api from './client';
import { createCrudService } from './baseCrud';
import {
  AcademicGroup,
  AcademicTopic,
  AcademicOva,
  Exam,
  ExamAttempt,
  EnrolledStudent,
} from '@/src/models/academic';

// ── Fábricas CRUD del profesor (para portal web / gestión) ───────────────────
export const groupService = createCrudService<AcademicGroup>('/api/v1/academic/groups');
export const topicService = createCrudService<AcademicTopic>('/api/v1/academic/topics');
export const ovaService = createCrudService<AcademicOva>('/api/v1/academic/ovas');

// ── API Académica Completa ───────────────────────────────────────────────────
// Cada método mapea directamente a un endpoint del backend.
// Referencia: FRONTEND_MIGRATION_PLAN.md → Tabla "Mapeo mockDB → API"
export const academicApi = {

  // ── Grupos ────────────────────────────────────────────────────────────────
  /** Obtener grupos del usuario (funciona para estudiante, docente y practicante) */
  getUserGroups: (userId: number) =>
    api.get<{ status: string; data: AcademicGroup[] }>(
      `/api/v1/academic/users/${userId}/groups`
    ),

  // ── Temas ─────────────────────────────────────────────────────────────────
  /** Obtener temas/unidades de un grupo */
  getGroupTopics: (groupId: number) =>
    api.get<{ status: string; data: AcademicTopic[] }>(
      `/api/v1/academic/groups/${groupId}/topics`
    ),

  // ── OVAs ──────────────────────────────────────────────────────────────────
  /** Obtener OVAs de un tema (Sprint 1 — Task 1.1) */
  getOvasByTopic: (topicId: number) =>
    api.get<{ status: string; data: AcademicOva[] }>(
      `/api/v1/academic/topics/${topicId}/ovas`
    ),

  /** Obtener una OVA por ID */
  getOva: (ovaId: number) =>
    api.get<{ data: AcademicOva }>(
      `/api/v1/academic/ovas/${ovaId}`
    ),

  // ── Exámenes ──────────────────────────────────────────────────────────────
  /** Obtener examen con preguntas por OVA (Sprint 1 — Task 1.2) */
  getExamByOva: (ovaId: number) =>
    api.get<{ status: string; data: Exam }>(
      `/api/v1/academic/exams/by-ova/${ovaId}`
    ),

  // ── Intentos ──────────────────────────────────────────────────────────────
  /** Iniciar un intento de examen */
  startAttempt: (studentId: number, examId: number) =>
    api.post<{ data: { id: number } }>(
      '/api/v1/academic/attempts',
      { student_id: studentId, exam_id: examId }
    ),

  /** Enviar respuestas de un intento */
  submitAttempt: (attemptId: number, answers: { question_id: number; selected_option_id: number }[]) =>
    api.post<{ data: ExamAttempt }>(
      `/api/v1/academic/attempts/${attemptId}/submit`,
      { answers }
    ),

  /** Obtener resultado de un intento */
  getAttemptResult: (attemptId: number) =>
    api.get<{ data: ExamAttempt }>(
      `/api/v1/academic/attempts/${attemptId}/result`
    ),

  /** Obtener intentos de un estudiante (Sprint 1 — Task 1.3) */
  getStudentAttempts: (studentId: number) =>
    api.get<{ status: string; data: ExamAttempt[] }>(
      `/api/v1/academic/students/${studentId}/attempts`
    ),

  /** Obtener intentos de un grupo (Sprint 1 — Task 1.4) — para docente/practicante */
  getGroupAttempts: (groupId: number) =>
    api.get<{ status: string; data: ExamAttempt[] }>(
      `/api/v1/academic/groups/${groupId}/attempts`
    ),

  // ── Matrículas ────────────────────────────────────────────────────────────
  /** Obtener estudiantes matriculados en un grupo (Sprint 1 — Task 1.5) */
  getGroupEnrollments: (groupId: number) =>
    api.get<{ status: string; data: EnrolledStudent[] }>(
      `/api/v1/academic/groups/${groupId}/enrollments`
    ),

  // ── Progreso (ya conectado) ───────────────────────────────────────────────
  /** Registrar acceso/progreso de un estudiante a un recurso (tracking silencioso) */
  trackProgress: (userId: number, ovaId: number, action: string, details?: { topic_name?: string, resource_name?: string }) =>
    api.post('/api/v1/academic/progress', {
      user_id: userId,
      ova_id: ovaId,
      action,
      ...details,
    }),

  /** Consultar historial de actividad de un grupo (tracking) */
  getGroupActivity: (groupId: number) =>
    api.get<{ data: any[] }>(
      `/api/v1/academic/groups/${groupId}/activity`
    ),
};
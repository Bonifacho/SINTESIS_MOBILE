import { create } from 'zustand';

// ── Tipos ──────────────────────────────────────────────────────────────────
export interface MockUser { id: number; username: string; password: string; full_name: string; role: 'docente' | 'estudiante' | 'practicante'; }
export interface MockGroup { id: number; name: string; teacher_id: number; description: string; }
export interface MockTopic { id: number; group_id: number; title: string; order_index: number; }
export interface MockOVA { id: number; topic_id: number; title: string; description: string; resource_type: 'pdf' | 'video' | 'link' | 'text' | 'exam'; resource_url: string | null; resource_content: string | null; has_exam: boolean; order_index: number; }
export interface MockQuestion { id: number; exam_id: number; statement: string; options: { id: number; text: string }[]; correct_option_id: number; points: number; }
export interface MockAttempt { id: number; ova_id: number; student_id: number; score: number; passed: boolean; correct_answers: number; total_questions: number; submitted_at: string; answers: { question_id: number; selected_option_id: number }[]; }
export interface MockEnrollment { student_id: number; group_id: number; }
export interface MockObserver { trainee_id: number; group_id: number; }

// ── Datos Iniciales (Coherencia Académica) ─────────────────────────────────
const INITIAL_USERS: MockUser[] = [
  { id: 1, username: 'docente', password: '1234', full_name: 'María García Rodríguez', role: 'docente' },
  { id: 2, username: 'estudiante', password: '1234', full_name: 'Juan Pérez López', role: 'estudiante' },
  { id: 3, username: 'practicante', password: '1234', full_name: 'Laura Martínez Silva', role: 'practicante' },
  { id: 4, username: 'carlos', password: '1234', full_name: 'Carlos Ruiz Torres', role: 'estudiante' },
];

const INITIAL_GROUPS: MockGroup[] = [
  { id: 1, name: 'Química 10°A', teacher_id: 1, description: 'Fundamentos de química inorgánica y tabla periódica.' },
  { id: 2, name: 'Física 10°A', teacher_id: 1, description: 'Leyes de Newton y cinemática clásica.' },
];

// Estudiantes matriculados lógicamente en 10°A
const INITIAL_ENROLLMENTS: MockEnrollment[] = [
  { student_id: 2, group_id: 1 }, { student_id: 2, group_id: 2 },
  { student_id: 4, group_id: 1 }, { student_id: 4, group_id: 2 },
];

const INITIAL_OBSERVERS: MockObserver[] = [ { trainee_id: 3, group_id: 1 } ];

const INITIAL_TOPICS: MockTopic[] = [
  { id: 1, group_id: 1, title: 'Unidad 1 — Tabla Periódica', order_index: 1 },
  { id: 2, group_id: 1, title: 'Unidad 2 — Enlace Químico', order_index: 2 },
  { id: 3, group_id: 2, title: 'Unidad 1 — Cinemática', order_index: 1 },
];

const INITIAL_OVAS: MockOVA[] = [
  // Grupo 1: Química
  { id: 1, topic_id: 1, title: 'Grupos y Periodos', description: 'Lectura', resource_type: 'text', resource_url: null, resource_content: 'Contenido...', has_exam: false, order_index: 1 },
  { id: 2, topic_id: 1, title: 'Evaluación: Tabla Periódica', description: 'Examen de opción múltiple', resource_type: 'exam', resource_url: null, resource_content: null, has_exam: true, order_index: 2 },
  { id: 3, topic_id: 2, title: 'Tipos de Enlace (Clase Grabada)', description: 'Video', resource_type: 'video', resource_url: 'https://www.youtube.com/watch?v=0RRVV4Diomg', resource_content: null, has_exam: false, order_index: 1 },
  
  // Grupo 2: Física
  { id: 4, topic_id: 3, title: 'Introducción al MRU', description: 'PDF', resource_type: 'pdf', resource_url: 'https://...', resource_content: null, has_exam: false, order_index: 1 },
  { id: 5, topic_id: 3, title: 'Evaluación: Cinemática', description: 'Examen', resource_type: 'exam', resource_url: null, resource_content: null, has_exam: true, order_index: 2 },
];

const INITIAL_QUESTIONS: MockQuestion[] = [
  // Preguntas para el Examen ID: 2 (Química)
  { id: 1, exam_id: 2, statement: '¿Cuántos elementos conforman la tabla periódica actual?', options: [{ id: 1, text: '92 elementos' }, { id: 2, text: '108 elementos' }, { id: 3, text: '118 elementos' }, { id: 4, text: '128 elementos' }], correct_option_id: 3, points: 1 },
  { id: 2, exam_id: 2, statement: '¿En qué grupo se encuentran los gases nobles?', options: [{ id: 5, text: 'Grupo 1' }, { id: 6, text: 'Grupo 17' }, { id: 7, text: 'Grupo 18' }, { id: 8, text: 'Grupo 2' }], correct_option_id: 7, points: 1 },
  
  // Preguntas para el Examen ID: 5 (Física)
  { id: 3, exam_id: 5, statement: 'En el Movimiento Rectilíneo Uniforme (MRU), la velocidad es:', options: [{ id: 9, text: 'Acelerada' }, { id: 10, text: 'Constante' }, { id: 11, text: 'Cero' }, { id: 12, text: 'Variable' }], correct_option_id: 10, points: 1 },
  { id: 4, exam_id: 5, statement: '¿Cuál es la fórmula para calcular la distancia en MRU?', options: [{ id: 13, text: 'd = v * t' }, { id: 14, text: 'd = v / t' }, { id: 15, text: 'd = m * a' }, { id: 16, text: 'd = t / v' }], correct_option_id: 13, points: 1 },
];

// ── Store de Zustand ───────────────────────────────────────────────────────
interface MockDBState {
  users: MockUser[]; groups: MockGroup[]; topics: MockTopic[]; ovas: MockOVA[]; questions: MockQuestion[]; attempts: MockAttempt[]; enrollments: MockEnrollment[]; observers: MockObserver[];
  getUserByCredentials: (u: string, p: string) => MockUser | null;
  getGroupsByTeacher: (id: number) => MockGroup[];
  getGroupsByStudent: (id: number) => MockGroup[];
  getGroupsByTrainee: (id: number) => MockGroup[];
  getTopicsByGroup: (id: number) => MockTopic[];
  getOvasByTopic: (id: number) => MockOVA[];
  getOvaById: (id: number) => MockOVA | null;
  getQuestionsByOva: (id: number) => MockQuestion[];
  getAttemptsByStudent: (id: number) => MockAttempt[];
  getAttemptsByGroup: (id: number) => MockAttempt[];
  getStudentsByGroup: (id: number) => MockUser[];
  getUserById: (id: number) => MockUser | null;
  registerAttempt: (ovaId: number, studentId: number, answers: { question_id: number; selected_option_id: number }[]) => MockAttempt;
}

export const useMockDB = create<MockDBState>((set, get) => ({
  users: INITIAL_USERS, groups: INITIAL_GROUPS, topics: INITIAL_TOPICS, ovas: INITIAL_OVAS, questions: INITIAL_QUESTIONS, attempts: [], enrollments: INITIAL_ENROLLMENTS, observers: INITIAL_OBSERVERS,
  
  getUserByCredentials: (u, p) => get().users.find((user) => user.username === u && user.password === p) ?? null,
  getUserById: (id) => get().users.find((u) => u.id === id) ?? null,
  getGroupsByTeacher: (id) => get().groups.filter((g) => g.teacher_id === id),
  getGroupsByStudent: (id) => {
    const gIds = get().enrollments.filter((e) => e.student_id === id).map((e) => e.group_id);
    return get().groups.filter((g) => gIds.includes(g.id));
  },
  getGroupsByTrainee: (id) => {
    const gIds = get().observers.filter((o) => o.trainee_id === id).map((o) => o.group_id);
    return get().groups.filter((g) => gIds.includes(g.id));
  },
  getTopicsByGroup: (id) => get().topics.filter((t) => t.group_id === id).sort((a, b) => a.order_index - b.order_index),
  getOvasByTopic: (id) => get().ovas.filter((o) => o.topic_id === id).sort((a, b) => a.order_index - b.order_index),
  getOvaById: (id) => get().ovas.find((o) => o.id === id) ?? null,
  getQuestionsByOva: (id) => get().questions.filter((q) => q.exam_id === id),
  getAttemptsByStudent: (id) => get().attempts.filter((a) => a.student_id === id).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()),
  getAttemptsByGroup: (id) => {
    const sIds = get().enrollments.filter((e) => e.group_id === id).map((e) => e.student_id);
    return get().attempts.filter((a) => sIds.includes(a.student_id));
  },
  getStudentsByGroup: (id) => {
    const sIds = get().enrollments.filter((e) => e.group_id === id).map((e) => e.student_id);
    return get().users.filter((u) => sIds.includes(u.id) && u.role === 'estudiante');
  },
  
  registerAttempt: (ovaId, studentId, answers) => {
    const questions = get().getQuestionsByOva(ovaId);
    const correct = answers.reduce((count, ans) => {
      const q = questions.find((q) => q.id === ans.question_id);
      return q?.correct_option_id === ans.selected_option_id ? count + 1 : count;
    }, 0);
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const newAttempt: MockAttempt = {
      id: Date.now(), ova_id: ovaId, student_id: studentId, score, passed: score >= 60,
      correct_answers: correct, total_questions: questions.length, submitted_at: new Date().toISOString(), answers,
    };
    set((state) => ({ attempts: [...state.attempts, newAttempt] }));
    return newAttempt;
  },
}));
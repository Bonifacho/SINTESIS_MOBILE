// src/models/academic.ts

// ── Dominio: Grupos y Temas ──────────────────────────────────────────────────
export interface AcademicGroup {
  id: number;
  name: string;
  // Nota: el modelo Group en el backend NO tiene campo description.
  teacher_id: number;
  is_active?: boolean;
}

export interface AcademicTopic {
  id: number;
  title: string;
  group_id: number;
  order_index: number;
  is_active?: boolean;
}

// ── Dominio: OVAs y Recursos ─────────────────────────────────────────────────
export interface OVAResource {
  id: number;
  resource_type: 'pdf' | 'video' | 'link' | 'text';
  display_title: string;
  url: string | null;
  content: string | null;
  order_index: number;
}

export interface AcademicOva {
  id: number;
  title: string;
  description: string | null;
  topic_id: number;
  order_index: number;
  is_active: boolean;
  resources: OVAResource[];
  has_exam?: boolean;
  exam_id?: number | null;
  exam_title?: string | null;
}

// ── Dominio: Exámenes y Preguntas ────────────────────────────────────────────
export interface ExamOption {
  id: number;
  text: string;
}

export interface ExamQuestion {
  id: number;
  statement: string;
  options: ExamOption[];
  points: number;
}

export interface Exam {
  id: number;
  ova_id: number;
  title: string;
  questions: ExamQuestion[];
}

// ── Dominio: Intentos y Resultados ───────────────────────────────────────────
export interface QuestionResult {
  question_id: number;
  statement: string;
  selected_option_id: number;
  selected_option_text: string;
  correct_option_id: number;
  correct_option_text: string;
  is_correct: boolean;
}

export interface ExamAttempt {
  attempt_id: number;
  exam_id: number;
  ova_id: number | null;      // ID del OVA al que pertenece el examen
  ova_title: string | null;   // Título del OVA — devuelto por _calculate_result()
  student_id: number;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  passing_score: number;
  submitted_at: string;
  status?: 'completed' | 'in_progress';
  /** Retroalimentación pregunta por pregunta (solo en detalle de intento) */
  question_results?: QuestionResult[];
}

// ── Dominio: Matrículas ──────────────────────────────────────────────────────
export interface EnrolledStudent {
  id: number;
  student_id: number;
  username: string;
  full_name: string;
}
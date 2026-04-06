// src/models/academic.ts
// Interfaces basadas estrictamente en el ERD de SÍNTESIS

export interface AcademicTopic {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface AcademicGroup {
  id: number;
  name: string;
  topic_id: number;
  teacher_id: number;
  is_active: boolean;
}

export interface AcademicOva {
  id: number;
  topic_id: number;
  title: string;
  description: string;
  is_active: boolean;
}

export interface ExamAttempt {
  id: number;
  enrollment_id: number;
  ova_id: number;
  start_time: string;
  end_time: string | null;
  
  // 💡 REGLA DE NEGOCIO (ERD - Regla 2):
  // 'score' y 'passed' NO existen físicamente en la DB.
  // Se reciben dinámicamente desde el backend al hacer GET al resultado.
  score?: number; 
  passed?: boolean;
}

export interface AcademicGroupObserver {
  id: number;
  group_id: number;
  practitioner_id: number; // Referencia al usuario con rol 'practicante'
  is_active: boolean;
}
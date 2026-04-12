// src/models/academic.ts
export interface AcademicGroup {
  id: number;
  name: string;
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
}

export interface ExamAttempt {
  attempt_id: number;
  exam_id: number;
  student_id: number;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  passing_score: number;
  submitted_at: string;
}
// src/api/academic.ts
import api from './client';
import { createCrudService } from './baseCrud';
import { AcademicGroup, AcademicTopic, AcademicOva, ExamAttempt } from '@/src/models/academic';

// Fábricas del profesor
export const groupService = createCrudService<AcademicGroup>('/api/v1/academic/groups');
export const topicService = createCrudService<AcademicTopic>('/api/v1/academic/topics');
export const ovaService = createCrudService<AcademicOva>('/api/v1/academic/ovas');

// Endpoints complejos
export const academicApi = {
  getUserGroups: (userId: number) =>
    api.get<{ status: string; data: AcademicGroup[] }>(`/api/v1/academic/users/${userId}/groups`),
    
  getGroupTopics: (groupId: number) =>
    api.get<{ status: string; data: AcademicTopic[] }>(`/api/v1/academic/groups/${groupId}/topics`),
    
  getOva: (ovaId: number) =>
    api.get<{ data: AcademicOva }>(`/api/v1/academic/ovas/${ovaId}`),
    
  startAttempt: (studentId: number, examId: number) =>
    api.post<{ data: { id: number } }>('/api/v1/academic/attempts', { student_id: studentId, exam_id: examId }),
    
  submitAttempt: (attemptId: number, answers: { question_id: number; selected_option_id: number }[]) =>
    api.post<{ data: ExamAttempt }>(`/api/v1/academic/attempts/${attemptId}/submit`, { answers }),
    
  getAttemptResult: (attemptId: number) =>
    api.get<{ data: ExamAttempt }>(`/api/v1/academic/attempts/${attemptId}/result`),
};
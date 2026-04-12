import { useQuery } from '@tanstack/react-query';
import { academicApi } from '@/src/api/academic';

export const useUserGroups = (userId: number) =>
  useQuery({
    queryKey: ['groups', userId],
    queryFn: () => academicApi.getUserGroups(userId).then(r => r.data.data),
    enabled: !!userId,
  });

export const useGroupTopics = (groupId: number) =>
  useQuery({
    queryKey: ['topics', groupId],
    queryFn: () => academicApi.getGroupTopics(groupId).then(r => r.data.data),
    enabled: !!groupId,
  });

export const useOva = (ovaId: number) =>
  useQuery({
    queryKey: ['ova', ovaId],
    queryFn: () => academicApi.getOva(ovaId).then(r => r.data.data),
    enabled: !!ovaId,
  });

export const useAttemptResult = (attemptId: number) =>
  useQuery({
    queryKey: ['result', attemptId],
    queryFn: () => academicApi.getAttemptResult(attemptId).then(r => r.data.data),
    enabled: !!attemptId,
  });
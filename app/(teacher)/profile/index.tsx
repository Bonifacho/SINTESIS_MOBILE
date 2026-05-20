import React, { useEffect, useState } from 'react';
import ProfileView, { type StatItem } from '@/src/components/profile/ProfileView';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Colors } from '@/src/theme/colors';

export default function TeacherProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<StatItem[]>([
    { value: '—', label: 'Grupos\na cargo', color: Colors.primary },
    { value: '—', label: 'Total\nestudiantes', color: Colors.primary },
    { value: '—', label: 'Evaluaciones\ncreadas', color: Colors.success },
  ]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const groupsRes = await academicApi.getUserGroups(user.id);
        const groups = groupsRes.data.data;

        // Contar estudiantes totales y evaluaciones por grupo
        let totalStudents = 0;
        let totalExams = 0;
        await Promise.all(
          groups.map(async (g: any) => {
            try {
              const [enrollRes, attemptsRes] = await Promise.all([
                academicApi.getGroupEnrollments(g.id),
                academicApi.getGroupAttempts(g.id),
              ]);
              totalStudents += enrollRes.data.data.length;
              totalExams += attemptsRes.data.data.length;
            } catch (_) {}
          })
        );

        setStats([
          { value: groups.length, label: 'Grupos\na cargo', color: Colors.primary },
          { value: totalStudents, label: 'Total\nestudiantes', color: Colors.primary },
          { value: totalExams, label: 'Evaluaciones\ncreadas', color: Colors.success },
        ]);
      } catch (e) {
        console.error('[Profile] Error cargando stats:', e);
      }
    };
    load();
  }, [user?.id]);

  return <ProfileView stats={stats} roleLabel="DOCENTE" />;
}
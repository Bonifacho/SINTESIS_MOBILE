import React, { useEffect, useState } from 'react';
import ProfileView, { type StatItem } from '@/src/components/profile/ProfileView';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Colors } from '@/src/theme/colors';

export default function TraineeProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<StatItem[]>([
    { value: '—', label: 'Grupos\nasignados', color: Colors.info },
    { value: '—', label: 'Estudiantes\nobservados', color: Colors.info },
  ]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const groupsRes = await academicApi.getUserGroups(user.id);
        const groups = groupsRes.data.data;

        let totalStudents = 0;
        await Promise.all(
          groups.map(async (g: any) => {
            try {
              const enrollRes = await academicApi.getGroupEnrollments(g.id);
              totalStudents += enrollRes.data.data.length;
            } catch (_) {}
          })
        );

        setStats([
          { value: groups.length, label: 'Grupos\nasignados', color: Colors.info },
          { value: totalStudents, label: 'Estudiantes\nobservados', color: Colors.info },
        ]);
      } catch (e) {
        console.error('[Profile] Error cargando stats:', e);
      }
    };
    load();
  }, [user?.id]);

  return (
    <ProfileView
      stats={stats}
      readOnly
      roleLabel="PRACTICANTE EN OBSERVACIÓN"
    />
  );
}
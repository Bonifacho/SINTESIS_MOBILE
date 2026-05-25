import React, { useEffect, useState } from 'react';
import ProfileView, { type StatItem } from '@/src/components/profile/ProfileView';
import { useAuthStore } from '@/src/store/authStore';
import { academicApi } from '@/src/api/academic';
import { Colors } from '@/src/theme/colors';

export default function StudentProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<StatItem[]>([
    { value: '—', label: 'Materias\ninscritas', color: Colors.primary },
    { value: '—', label: 'Exámenes\nrealizados', color: Colors.primary },
    { value: '—', label: 'Promedio\ngeneral', color: Colors.success },
  ]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const [groupsRes, attemptsRes] = await Promise.all([
          academicApi.getUserGroups(user.id),
          academicApi.getStudentAttempts(user.id),
        ]);
        const groups = groupsRes.data.data;
        const attempts = attemptsRes.data.data;
        const avg = attempts.length > 0
          ? Math.round(attempts.reduce((s: number, a: any) => s + a.score, 0) / attempts.length) / 10
          : 0;
        setStats([
          { value: groups.length, label: 'Materias\ninscritas', color: Colors.primary },
          { value: attempts.length, label: 'Exámenes\nrealizados', color: Colors.primary },
          { value: avg.toFixed(1), label: 'Promedio\ngeneral', color: Colors.success },
        ]);
      } catch (e) {
        console.error('[Profile] Error cargando stats:', e);
      }
    };
    load();
  }, [user?.id]);

  return <ProfileView stats={stats} roleLabel="ESTUDIANTE" />;
}
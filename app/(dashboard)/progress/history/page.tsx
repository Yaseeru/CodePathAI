import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import ProgressHistory from '@/components/progress/ProgressHistory';

/**
 * Progress History page
 * Shows archived roadmaps and goal change timeline
 */
export default async function ProgressHistoryPage() {
     const user = await requireAuth();
     await requireOnboarding(user.id);

     return <ProgressHistory />;
}

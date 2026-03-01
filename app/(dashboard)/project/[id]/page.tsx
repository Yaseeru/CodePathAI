import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ProjectPageClient from './ProjectPageClient';

interface PageProps {
     params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
     const { id } = await params;
     const supabase = await createClient();

     // Get authenticated user
     const {
          data: { user },
          error: authError,
     } = await supabase.auth.getUser();

     if (authError || !user) {
          redirect('/login');
     }

     // Fetch project data
     const { data: project, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

     if (projectError || !project) {
          redirect('/dashboard');
     }

     // Fetch saved code for this project
     const { data: savedCode } = await supabase
          .from('code_saves')
          .select('*')
          .eq('user_id', user.id)
          .eq('project_id', id)
          .order('saved_at', { ascending: false })
          .limit(1)
          .single();

     // Fetch latest submission for this project
     const { data: latestSubmission } = await supabase
          .from('project_submissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('project_id', id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

     // Determine default language from project requirements or use javascript
     const defaultLanguage = 'javascript'; // Could be extracted from project metadata

     return (
          <ProjectPageClient
               project={project}
               savedCode={savedCode?.code || ''}
               savedLanguage={savedCode?.language || defaultLanguage}
               userId={user.id}
               latestSubmission={latestSubmission}
          />
     );
}

import { requireAuth, requireOnboarding } from '@/lib/auth/utils';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default async function ChatPage() {
     const user = await requireAuth();
     await requireOnboarding(user.id);

     return (
          <div className="h-[calc(100vh-4rem)] bg-gray-50">
               <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
                         <div className="p-6 border-b border-gray-200">
                              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                   AI Mentor Chat
                              </h1>
                              <p className="text-gray-600">
                                   Ask questions, get help with coding, or discuss your learning journey
                              </p>
                         </div>
                         <div className="flex-1 overflow-hidden">
                              <ChatInterface />
                         </div>
                    </div>
               </div>
          </div>
     );
}

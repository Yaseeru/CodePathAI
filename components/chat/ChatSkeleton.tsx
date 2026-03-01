/**
 * ChatSkeleton Component
 * Loading skeleton for ChatInterface component
 */

export default function ChatSkeleton() {
     return (
          <div className="w-full h-full bg-white flex flex-col">
               <div className="p-4 border-b border-gray-200">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
               </div>
               <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                         <div key={i} className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                         </div>
                    ))}
               </div>
               <div className="p-4 border-t border-gray-200">
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
               </div>
          </div>
     );
}

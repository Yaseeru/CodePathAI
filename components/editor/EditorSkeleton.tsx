/**
 * EditorSkeleton Component
 * Loading skeleton for CodeEditor component
 */

export default function EditorSkeleton() {
     return (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
               <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p className="text-gray-400 text-sm">Loading editor...</p>
               </div>
          </div>
     );
}

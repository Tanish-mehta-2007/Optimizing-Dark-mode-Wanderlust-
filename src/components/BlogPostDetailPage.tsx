
import React, { useEffect, useState } from 'react';
import { MOCK_BLOG_POSTS } from '../constants';
import { BlogPost } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImageWithFallback } from './common/ImageDisplayUtils';
import LoadingSpinner from './common/LoadingSpinner';

interface BlogPostDetailPageProps {
  postId: string;
  onNavigateBack: () => void;
}

const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const BlogPostDetailPage: React.FC<BlogPostDetailPageProps> = ({ postId, onNavigateBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundPost = MOCK_BLOG_POSTS.find(p => p.id === postId);
    setPost(foundPost || null);
    setIsLoading(false);
  }, [postId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner message="Loading blog post..." size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50 dark:bg-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">Blog Post Not Found</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-4">Sorry, we couldn't find the blog post you're looking for.</p>
        <button
          onClick={onNavigateBack}
          className="mt-8 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors button-interactive"
        >
          <BackArrowIcon /> Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button
            onClick={onNavigateBack}
            className="mb-6 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group button-interactive"
        >
            <BackArrowIcon />
            <span className="group-hover:underline">Back to Blog</span>
        </button>

        <article className="bg-white dark:bg-slate-850 p-5 sm:p-8 md:p-10 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-3 sm:mb-4">
              {post.title}
            </h1>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>By {post.author}</span> | <span>Published on {new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="mt-3 sm:mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs font-medium mr-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mb-1">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <ImageWithFallback 
            src={post.imageUrl} 
            alt={`Cover image for ${post.title}`} 
            className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[450px] object-cover rounded-lg shadow-lg mb-6 sm:mb-8"
            placeholderClassName="w-full h-64 sm:h-80 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-6 sm:mb-8"
          />
          
          <div className="prose prose-slate dark:prose-invert max-w-none 
                        prose-sm sm:prose-base 
                        prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 
                        prose-p:text-slate-700 dark:prose-p:text-slate-300 
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-700 dark:hover:prose-a:text-blue-300
                        prose-strong:text-slate-800 dark:prose-strong:text-slate-100
                        prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400
                        prose-code:bg-slate-100 dark:prose-code:bg-slate-700 prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-code:p-1 prose-code:rounded-md prose-code:text-xs sm:prose-code:text-sm
                        prose-ul:list-disc prose-ol:list-decimal
                        prose-li:my-0.5 sm:prose-li:my-1
                        ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .prose p { line-height: 1.65; }
        .prose img { border-radius: 0.5rem; margin-top: 1.25em; margin-bottom: 1.25em; }
        .prose blockquote { font-style: italic; padding-left: 0.75em; border-left-width: 0.2rem; }
        .prose-sm p, .prose-sm ul, .prose-sm ol { margin-top: 0.75em; margin-bottom: 0.75em; }
        @media (min-width: 640px) {
          .sm\\:prose-base p, .sm\\:prose-base ul, .sm\\:prose-base ol { margin-top: 1em; margin-bottom: 1em; }
        }
      `}</style>
    </div>
  );
};

export default BlogPostDetailPage;

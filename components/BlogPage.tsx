
import React from 'react';
import { MOCK_BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';
import { ImageWithFallback } from './common/ImageDisplayUtils';

interface BlogPageProps {
  onViewPostDetail: (postId: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onViewPostDetail }) => {
  
  const handleReadMore = (blogPost: BlogPost) => {
    onViewPostDetail(blogPost.id);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-400">
          Wanderlust Travel Blog
        </h1>
        <p className="mt-3 text-md sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Insights, stories, and tips from fellow travelers and our AI to inspire your next journey.
        </p>
      </header>

      {MOCK_BLOG_POSTS.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">No blog posts available yet.</p>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Check back soon for inspiring travel stories!</p>
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-12">
          {MOCK_BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row">
              <div className="md:w-2/5 xl:w-1/3">
                <ImageWithFallback 
                  src={post.imageUrl} 
                  alt={`Cover image for ${post.title}`} 
                  className="w-full h-60 sm:h-64 md:h-full object-cover"
                  placeholderClassName="w-full h-60 sm:h-64 md:h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
                />
              </div>
              <div className="p-5 sm:p-6 md:p-8 md:w-3/5 xl:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="mb-2 sm:mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="inline-block bg-blue-100 dark:bg-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mr-2 px-2.5 py-1 rounded-full mb-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3">
                    {post.title}
                  </h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
                    <span>By {post.author}</span> | <span>Published on {new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-3">
                    {post.snippet}
                  </p>
                </div>
                <button
                  onClick={() => handleReadMore(post)}
                  className="self-start inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold group text-sm"
                >
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPage;

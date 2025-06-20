
import React, { useState, useContext } from 'react';
import { AuthContext, SocialLoginProvider } from '../contexts/AuthContext';
import { AppView } from '../types'; 

// SVG Icons for Social Logins (re-used from LoginPage for consistency)
const GoogleIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 .5H.5v10.5H11V.5z" fill="#f25022"/>
    <path d="M22.5 .5H12v10.5h10.5V.5z" fill="#7fba00"/>
    <path d="M11 12H.5v10.5H11V12z" fill="#00a4ef"/>
    <path d="M22.5 12H12v10.5h10.5V12z" fill="#ffb900"/>
  </svg>
);
const AppleIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.483 11.693C17.483 10.058 18.339 8.667 20 7.917C19.007 6.213 17.34 5.25 15.417 5.25C13.948 5.25 12.593 6.017 11.771 6.017C10.948 6.017 9.703 5.25 8.167 5.25C6.036 5.25 4.117 6.432 3.156 8.349C1.583 11.557 2.974 16.5 4.807 19.078C5.729 20.26 6.87 21.75 8.406 21.734C9.927 21.719 10.375 20.862 12.031 20.862C13.688 20.862 14.104 21.734 15.677 21.734C17.25 21.734 18.229 20.323 19.094 19.156C19.773 18.229 20.201 17.141 20.318 16H15.5C14.161 16 13.198 15.062 13.198 13.839C13.198 12.609 14.073 11.693 15.406 11.693H17.483ZM14.917 4C15.927 2.828 15.703 1.25 14.625 0.5C13.479 -0.292 12.042 0.052 11.125 1.036C10.25 1.938 10.375 3.375 11.521 4.219C12.625 5 14.052 4.938 14.917 4Z"/>
  </svg>
);

interface SignupPageProps {
  onSignupSuccess: () => void;
  navigateToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, navigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, socialLogin } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signup(email, password);
      onSignupSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: SocialLoginProvider) => {
    setError(null);
    setIsLoading(true);
    try {
      await socialLogin(provider);
      onSignupSuccess(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sign up with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 p-4 page-transition-enter">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-6 sm:mb-8">
           <div className="inline-flex items-center justify-center mb-2 sm:mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand dark:text-brand-light mr-1.5 sm:mr-2"><path d="M2 12h20"/><path d="M6.343 17.657 12 12l5.657-5.657"/><path d="m17.657 6.343-5.657 5.657L6.343 17.657"/><path d="M12 2v20"/></svg>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-brand-light">Join Wanderlust</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Create your account to start planning.</p>
        </div>

        {error && <p className="mb-4 text-center text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2.5 sm:p-3 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="email-signup" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
            <input id="email-signup" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-sm sm:text-base text-slate-700 dark:text-slate-200"
              placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password-signup"className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
            <input id="password-signup" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-sm sm:text-base text-slate-700 dark:text-slate-200"
              placeholder="Create a password" />
          </div>
          <div>
            <label htmlFor="confirm-password-signup"className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Confirm Password</label>
            <input id="confirm-password-signup" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand text-sm sm:text-base text-slate-700 dark:text-slate-200"
              placeholder="Confirm your password" />
          </div>
          <div>
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light dark:focus:ring-offset-slate-800 disabled:opacity-70 transition-colors">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="my-5 sm:my-6"><div className="relative"><div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300 dark:border-slate-600" /></div><div className="relative flex justify-center text-xs sm:text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or sign up with</span></div></div></div>

        <div className="space-y-2.5 sm:space-y-3">
          <button onClick={() => handleSocialLogin('google')} disabled={isLoading} className="w-full inline-flex items-center justify-center px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/70 disabled:opacity-70 transition-colors"> <GoogleIcon /> Sign up with Google </button>
          <button onClick={() => handleSocialLogin('microsoft')} disabled={isLoading} className="w-full inline-flex items-center justify-center px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600/70 disabled:opacity-70 transition-colors"> <MicrosoftIcon /> Sign up with Microsoft </button>
          <button onClick={() => handleSocialLogin('apple')} disabled={isLoading} className="w-full inline-flex items-center justify-center px-4 py-2 sm:py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm bg-black text-xs sm:text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 disabled:opacity-70 transition-colors"> <AppleIcon /> Sign up with Apple </button>
        </div>
        
        <p className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={navigateToLogin} className="font-medium text-brand hover:text-brand-dark dark:text-brand-light dark:hover:text-blue-400 underline"> Log in </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

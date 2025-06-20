
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { MOCK_NOTIFICATIONS_DATA } from '../constants';
import { NotificationItem, AppView } from '../types';

// Icons
const BackArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1.5 sm:mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
const BellIconHeader = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-500 mr-2 sm:mr-3">
        <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.879 3.051 1.5 4.795 1.5 6.75V11.7c0 3.118 2.026 5.899 5.006 6.931a13.61 13.61 0 001.178 3.957.75.75 0 001.312.005 12.083 12.083 0 01.691-3.319 22.495 22.495 0 001.987-.359C13.712 18.55 15 17.132 15 15.7V8.998a22.508 22.508 0 00-1.728-8.225.75.75 0 00-.434-.433C12.606 2.283 12.312 2.25 12 2.25zM8.25 8.625a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25zM10.125 7.5a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM10.875 9.75a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
        <path d="M12.75 18.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
        <path d="M15 15.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
    </svg>
);
const NotificationTypeIcon: React.FC<{ type: NotificationItem['type'] }> = ({ type }) => {
  let iconElement: JSX.Element | null = null;
  let colorClasses = "text-slate-500 dark:text-slate-400";
  switch (type) {
    case 'alert':
      iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM9 12a1 1 0 112 0v1a1 1 0 11-2 0v-1zm1-4a1 1 0 011 1v2a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>;
      colorClasses = "text-red-500 dark:text-red-400";
      break;
    case 'info':
      iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>;
      colorClasses = "text-blue-500 dark:text-blue-400";
      break;
    case 'reminder':
      iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>;
      colorClasses = "text-amber-500 dark:text-amber-400";
      break;
    case 'update':
      iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" /><path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" /></svg>;
      colorClasses = "text-emerald-500 dark:text-emerald-400";
      break;
    case 'system':
       iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path fillRule="evenodd" d="M11.09 3.562A4.5 4.5 0 105.59 9.062a4.5 4.5 0 005.5 0zM10 12.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.125 5.462a3 3 0 101.75 5.075V12.5a.75.75 0 00-1.5 0V10.537A3 3 0 009.125 5.462z" /></svg>;
      colorClasses = "text-purple-500 dark:text-purple-400";
      break;
    default:
      iconElement = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5"><path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM5.404 15.657a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 101.06 1.06l1.06-1.06zM16.717 10a.75.75 0 01-1.5 0h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 011.5 0zM4.283 10a.75.75 0 01-1.5 0H1.25a.75.75 0 010-1.5h1.533a.75.75 0 011.5 0zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM4.343 5.404a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.061 1.06z" /></svg>;
  }
  return iconElement ? <span className={colorClasses}>{iconElement}</span> : null;
};


interface NotificationsPageProps {
  onNavigateBack: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigateBack }) => {
  const { currentUser } = useContext(AuthContext);
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (currentUser) {
      const filtered = MOCK_NOTIFICATIONS_DATA.filter(n => n.userId === currentUser.id);
      setUserNotifications(filtered.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } else {
      setUserNotifications([]);
    }
  }, [currentUser]);

  const handleMarkAsRead = (id: string) => {
    setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setUserNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearNotification = (id: string) => {
    setUserNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!currentUser) {
    return (
      <div className="text-center py-16 sm:py-20 px-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">Access Denied</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-3 sm:mt-4 text-sm sm:text-base">Please log in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <button
        onClick={onNavigateBack}
        className="mb-6 sm:mb-8 inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group button-interactive"
      >
        <BackArrowIcon />
        <span className="group-hover:underline">Back</span>
      </button>

      <header className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center">
            <BellIconHeader />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                Your Notifications
            </h1>
        </div>
        {userNotifications.some(n => !n.isRead) && (
            <button 
                onClick={handleMarkAllAsRead}
                className="self-start sm:self-center px-3 py-1.5 text-xs sm:text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-md transition button-interactive"
            >
                Mark All as Read
            </button>
        )}
      </header>

      {userNotifications.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-3">No new notifications</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {userNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 sm:p-4 rounded-lg shadow-md border transition-all duration-300 flex items-start space-x-2 sm:space-x-3
                          ${notification.isRead 
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70' 
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 hover:shadow-lg'
                          }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                <NotificationTypeIcon type={notification.type} />
              </div>
              <div className="flex-grow">
                <p className={`text-sm ${notification.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {new Date(notification.timestamp).toLocaleString(undefined, {dateStyle: 'medium', timeStyle: 'short'})}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="px-2 py-1 text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-700/50 transition button-interactive"
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => handleClearNotification(notification.id)}
                  className="p-1 sm:p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition button-interactive"
                  title="Clear notification"
                  aria-label="Clear notification"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
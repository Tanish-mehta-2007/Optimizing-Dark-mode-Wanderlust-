
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, BillingAddressDetails } from '../../types'; 

// Moved from storageService.ts
const USERS_STORAGE_KEY = 'aiTravelPlanner_users_v1';
const CURRENT_USER_STORAGE_KEY = 'aiTravelPlanner_currentUser_v1';

// --- Helper functions for user storage (internal to AuthContext) ---
const getAllUsersInternal = (): User[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

const storageRegisterUserInternal = (email: string, passwordInput: string): User => {
  const users = getAllUsersInternal();
  if (users.find(u => u.email === email)) {
    throw new Error("User already exists internally."); // Should be checked before calling
  }
  const newUser: User = { 
    id: email, 
    email, 
    password: passwordInput, 
    profileImageUrl: undefined,
    phoneNumber: undefined, 
    secondaryEmail: undefined, 
    streetAddress1: '', 
    streetAddress2: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    country: '',
  };
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return newUser;
};

const storageFindUserByEmailInternal = (email: string): User | null => {
  const users = getAllUsersInternal();
  return users.find(u => u.email === email) || null;
};

const storageSaveCurrentUserInternal = (user: User): void => {
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
};

const storageGetCurrentUserInternal = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (!userJson) {
    return null;
  }
  try {
    return JSON.parse(userJson) as User;
  } catch (e) {
    console.error("Corrupted current user data in localStorage. Clearing it.", e);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY); // Clear corrupted item
    return null;
  }
};

const storageClearCurrentUserInternal = (): void => {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
};

const storageUpdateUserProfileInternal = (userId: string, updates: Partial<User>): User | null => {
  const users = getAllUsersInternal();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex > -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const currentUserFromStorage = storageGetCurrentUserInternal();
    if (currentUserFromStorage && currentUserFromStorage.id === userId) {
      const updatedCurrentUser = { ...currentUserFromStorage, ...updates };
      storageSaveCurrentUserInternal(updatedCurrentUser);
      return updatedCurrentUser;
    }
    return users[userIndex];
  }
  return null;
};
// --- End Helper functions ---


export type SocialLoginProvider = 'google' | 'microsoft' | 'apple';

export interface AuthContextType { 
  currentUser: User | null;
  isLoadingAuth: boolean;
  login: (email: string, passwordInput: string) => Promise<User | null>;
  signup: (email: string, passwordInput: string) => Promise<User | null>;
  logout: () => void;
  socialLogin: (provider: SocialLoginProvider) => Promise<User | null>;
  updateCurrentUserProfileImage: (imageUrl: string) => Promise<void>;
  updateUserContactDetails: (details: { phoneNumber?: string; secondaryEmail?: string }) => Promise<void>; 
  updateUserBillingAddress: (details: BillingAddressDetails) => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoadingAuth: true,
  login: async () => null,
  signup: async () => null,
  logout: () => {},
  socialLogin: async () => null,
  updateCurrentUserProfileImage: async () => {},
  updateUserContactDetails: async () => {}, 
  updateUserBillingAddress: async () => {}, 
});

interface AuthProviderProps {
  children: ReactNode;
}

const MOCK_SOCIAL_PASSWORD = "SOCIAL_LOGIN_MOCK_PASSWORD";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setIsLoadingAuth(true); 
    try {
      const user = storageGetCurrentUserInternal(); 
      if (user) {
        setCurrentUser(user);
      }
    } catch (e) {
      console.error("Error initializing current user in AuthProvider:", e);
      storageClearCurrentUserInternal(); 
    } finally {
      setIsLoadingAuth(false); 
    }
  }, []);

  const login = async (email: string, passwordInput: string): Promise<User | null> => {
    const user = storageFindUserByEmailInternal(email);
    if (user && user.password === passwordInput) { 
      setCurrentUser(user);
      storageSaveCurrentUserInternal(user);
      return user;
    }
    throw new Error("Invalid email or password.");
  };

  const signup = async (email: string, passwordInput: string): Promise<User | null> => {
    const existingUser = storageFindUserByEmailInternal(email);
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }
    const newUser = storageRegisterUserInternal(email, passwordInput);
    setCurrentUser(newUser);
    storageSaveCurrentUserInternal(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    storageClearCurrentUserInternal();
  };
  
  const socialLogin = async (provider: SocialLoginProvider): Promise<User | null> => {
    const mockEmail = `user_${provider}@example.com`;
    let user = storageFindUserByEmailInternal(mockEmail);

    if (user) {
      if (user.password === MOCK_SOCIAL_PASSWORD) {
        setCurrentUser(user);
        storageSaveCurrentUserInternal(user);
        return user;
      } else {
        throw new Error(`An account with email ${mockEmail} exists but was not created via social login.`);
      }
    } else {
      const newUser = storageRegisterUserInternal(mockEmail, MOCK_SOCIAL_PASSWORD);
      setCurrentUser(newUser);
      storageSaveCurrentUserInternal(newUser);
      return newUser;
    }
  };

  const updateCurrentUserProfileImage = async (imageUrl: string): Promise<void> => {
    if (currentUser) {
      try {
        const updatedUserInStorage = storageUpdateUserProfileInternal(currentUser.id, { profileImageUrl: imageUrl });
        if (updatedUserInStorage) {
          setCurrentUser(updatedUserInStorage); 
        } else {
          throw new Error("Failed to update profile image in storage for current user.");
        }
      } catch (error) {
        console.error("Error updating profile image:", error);
        throw error;
      }
    } else {
      throw new Error("No current user to update profile image for.");
    }
  };

  const updateUserContactDetails = async (details: { phoneNumber?: string; secondaryEmail?: string }): Promise<void> => {
    if (currentUser) {
      try {
        const updates: Partial<User> = {};
        if (details.phoneNumber !== undefined) updates.phoneNumber = details.phoneNumber;
        if (details.secondaryEmail !== undefined) updates.secondaryEmail = details.secondaryEmail;
        
        const updatedUserInStorage = storageUpdateUserProfileInternal(currentUser.id, updates);
        if (updatedUserInStorage) {
          setCurrentUser(updatedUserInStorage);
        } else {
          throw new Error("Failed to update contact details in storage.");
        }
      } catch (error) {
        console.error("Error updating contact details:", error);
        throw error;
      }
    } else {
      throw new Error("No current user to update contact details for.");
    }
  };

  const updateUserBillingAddress = async (details: BillingAddressDetails): Promise<void> => {
    if (currentUser) {
      try {
        const updates: Partial<User> = { ...details };
        const updatedUserInStorage = storageUpdateUserProfileInternal(currentUser.id, updates);
        if (updatedUserInStorage) {
          setCurrentUser(updatedUserInStorage);
        } else {
          throw new Error("Failed to update billing address in storage.");
        }
      } catch (error) {
        console.error("Error updating billing address:", error);
        throw error;
      }
    } else {
      throw new Error("No current user to update billing address for.");
    }
  };

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        isLoadingAuth, 
        login, 
        signup, 
        logout, 
        socialLogin, 
        updateCurrentUserProfileImage, 
        updateUserContactDetails,
        updateUserBillingAddress 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

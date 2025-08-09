// authService.js
import { Auth } from 'aws-amplify';

const authService = {
  signUp: async (email, password) => {
    try {
      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email
        }
      });
      return user;
    } catch (error) {
      throw error;
    }
  },

  confirmSignUp: async (email, code) => {
    try {
      await Auth.confirmSignUp(email, code);
      return true;
    } catch (error) {
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      const user = await Auth.signIn(email, password);
      return user;
    } catch (error) {
      throw error;
    }
  },

  signOut: async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      return user;
    } catch (error) {
      return null;
    }
  }
};

export default authService;
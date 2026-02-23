import { configureStore } from '@reduxjs/toolkit';
import profileSlice from  './profileSlice';
import Chats from './chat';
import Matches from './matches';
import presenceSlice from './presenceSlice';

export const store = configureStore({
  reducer: {
    profileSlice,
    chats: Chats,
    matches: Matches,
    presence: presenceSlice,
   
   
   
   
   
   
   
   
   
   
   
   
   
  },
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

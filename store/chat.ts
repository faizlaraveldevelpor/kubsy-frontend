import { ProfileData } from '@/types/slice';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



const chats = createSlice({
  name: 'chats',
  initialState:{
  chats:null,
  singleChatData:null,
  unreadedmessages:null
  },
  reducers: {
    Getchats(state,actions){
    state.chats=actions.payload
    },
    singleChatFnc(state,actions){
    state.singleChatData=actions.payload
    },
    unreadedMessages(state,actions){
    state.unreadedmessages=actions.payload
    }
},
});

export const { Getchats,singleChatFnc,unreadedMessages } = chats.actions;
export default chats.reducer;



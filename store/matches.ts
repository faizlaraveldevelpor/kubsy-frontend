import { createSlice } from '@reduxjs/toolkit';



 const Matches = createSlice({
  name: 'Matches',
  initialState:{
 Match:null
  },
  reducers: {
    getMatches(state,actions){
        console.log(actions.payload);
        
   state.Match=actions.payload
    }
    
  },
});

export const { getMatches } = Matches.actions;
export default Matches.reducer;



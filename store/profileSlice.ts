import { ProfileData } from '@/types/slice';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



const profileSlice = createSlice({
  name: 'profileSlice',
  initialState:{
  profiledata:null,
  profileavtar:null,
  profileImages:null,
  intrests:null,
  cetagory:null,
  userlogininfo:null,
  userApi:null,
  allprofiles:null,
  profilesMetadata: null,
  agefilter:null,
  intrestesfilter:null,
  cetagoryfilter:null,
  blockUser:[],
  distancefilter:null,
  genderfilter:null,
  // profileSlice.ts mein initialState mein add karein:
isDarkMode: false,

// reducers mein add karein:

  },
  reducers: {
    profiledata(state, action: PayloadAction<ProfileData>) {
      state.profiledata = action.payload;
      console.log(state.profiledata)
    },
    profileavtar(state, action: PayloadAction<any>) {
      state.profileavtar = action.payload.image;
      // console.log(state.profileavtar)

    },
    profileImages(state, action: PayloadAction<any>){
    state.profileImages=action.payload
    },
    cetagory(state,action){
    state.cetagory=action.payload
    },
    profileintrests(state,action:PayloadAction<any>){
    state.intrests=action.payload
    // console.log(state.intrests)
    },
    userlogininfo(state,action:PayloadAction<any>){
    state.userlogininfo=action.payload
    },
    GetprofileApi(state,actions:PayloadAction<any>){
    state.userApi=actions.payload
    },
    allprofilesFnc(state,actions:PayloadAction<any>){
    state.allprofiles=actions.payload
    },
    setProfilesMetadata(state, action: PayloadAction<any>) {
      state.profilesMetadata = action.payload;
    },
    intrestsfilter(state,actions:PayloadAction<any>){
    state.intrestesfilter=actions.payload
    },
    genderfilterfnc(state,actions:PayloadAction<any>){
    state.genderfilter=actions.payload
    
    },
    distancefilterfnc(state,actions:PayloadAction<any>){
    state.distancefilter=actions.payload
    },

    agefilter(state,actions:PayloadAction<any>){
    state.agefilter=actions.payload
    },
    setCategoryFilter(state,action){
    state.cetagoryfilter=action.payload
    },
    blockprofile(state,actions){
    state.blockUser.push(actions.payload)
    console.log(state.blockUser);
    
    },
    UnblockProfile(state,actions){
   state.blockUser=  state.blockUser.filter((blockUser)=>blockUser!==actions.payload)
    },
    toggleTheme(state) {
  state.isDarkMode = !state.isDarkMode;
  console.log(state.isDarkMode);
  
},
    
  },
});

export const { profiledata,profileavtar,profileImages,profileintrests,userlogininfo,GetprofileApi,allprofilesFnc,setProfilesMetadata,intrestsfilter,agefilter,blockprofile,UnblockProfile,cetagory,setCategoryFilter,genderfilterfnc,distancefilterfnc,toggleTheme } = profileSlice.actions;
export default profileSlice.reducer;



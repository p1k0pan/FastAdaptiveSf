import axios from 'axios';

const state = {
  user: null,

  access_token: null,
  refresh_token: null,
};

const getters = {
  isAuthenticated: state => !!state.user,
  stateUser: state => state.user,

  getAccessToken: state => state.access_token,
  getRefreshToken: state => state.refresh_token,
};

const actions = {

  async register(context, userForm) {
    //form: { // IN DATA SECTION
    //  username: '',
    //  password:'',
    //}

    //const User = new FormData();
    //User.append('user_name', this.form.username);
    //User.append('password', this.form.password);
  
    const res = await dispatch('createUser', userForm);

    if(res === 200) {
      await dispatch('logIn', userForm);
    } else {
      console.log("could not log in: there was an error while creating a user during the user registration")

      // TODO: Delete user again
    }
  },
  

  async createUser(userForm) {
    var res = 0
    username = userForm.user_name
    password = userForm.password

    const data = JSON.stringify({
            user_name: username,
            password: password,
            histories: null,
    })
    const endpoint = "/" + `user`;
    const headers = { 
      // "Content-Type": "multipart/form-data",
      // Authorization: 'Bearer ' + token //the token is a variable which holds the token
    };

    await axios
        .post(endpoint, data, { headers })
        .then((response) => {

        if (response.data) {
          // return success
          if (response.status === 200) {
          console.log("created user successfully!")
          res = 200
          }
        // reject errors & warnings
        }
      })
      .catch((error) => {
        console.log(error);
    });

    return res
  },


  async logIn(context, userForm) {
    const authorizationData = JSON.stringify({ // TODO: stringify?
      username: userForm.user_name,
      access_token: null,
      refresh_token: null,
    })

    username = userForm.user_name
    password = userForm.password

    const data = JSON.stringify({
            user_name: username,
            password: password,
    })
    const endpoint = "/" + `login`;
    const headers = { 
      // "Content-Type": "multipart/form-data",
      // Authorization: 'Bearer ' + token //the token is a variable which holds the token
    };

    await axios
        .post(endpoint, data, { headers })
        .then((response) => {

        if (response.data) {
          // return success
          if (response.status === 200) {
          console.log("user login successful!")
          authorizationData.access_token = response.headers.access_token
          authorizationData.refresh_token = response.headers.refresh_token

          } else if(response.status === 400) {
            console.log("user login not successful!")
            
            if(response.message === "Invalid user name or user not found"){
              console.log("Invalid user name or user not found!")
            }
            if(response.message === "Invalid password"){
              console.log("Invalid password!")
            }

          }

        // reject errors & warnings
        }
      })
      .catch((error) => {
        console.log(error);
    });


    //await dispatch('viewMe');
    context.commit('SET_USER', authorizationData)
  },


  async viewMe({commit}) {
    //let {data} = await axios.get('users/whoami');
    //await commit('setUser', data);
  },

  // eslint-disable-next-line no-empty-pattern
  async deleteUser({}, id) {
    //await axios.delete(`user/${id}`);
  },


  async logOut(context) {
    console.log("logging user out")
    context.commit('LOGOUT')
  }
};



const mutations = {
  SET_USER(state, authorizationData) {
    console.log("setting user state")
    state.user = authorizationData.username;

    state.access_token = authorizationData.access_token;
    state.refresh_token = authorizationData.refresh_token;
  },
  
  LOGOUT(state){
    console.log("removing user from state")
    state.user = null;

    state.access_token = null;
    state.refresh_token = null;
  },
};



export default {
  state,
  getters,
  actions,
  mutations
};
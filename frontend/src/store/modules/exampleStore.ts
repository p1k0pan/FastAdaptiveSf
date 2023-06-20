import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        todos: [],
        user: null,
    },

    mutations: {
        SET_TODOS(state, todos) {
            //state.todos = todos
        },

        ADD_TODO(state, todo) {
          /*
            state.todos = [...state.todos, todo]
            
            console.log("")
            console.log("Added a new todo item:")
            console.log("id: " + String(todo.id))
            console.log("task: " + String(todo.task))
            console.log("completed: " + String(todo.completed))
            */
        },

        TOGGLE_TODO(state, { id, completed }) {
          /*
            state.todos.find(todo => todo.id == id).completed = completed

            var todo = state.todos.find(todo => todo.id == id)
            console.log("")
            console.log("Changed state of todo: " + String(todo.task) + " (id: " + String(todo.id)+ ")")
            console.log("Completed: " + String(todo.completed))
            */
        }
    },

    actions: {
        async setTodos(context) {
            //Assume that this is an api call and we get DATASET as a response.  
            //context.commit('SET_TODOS', DATASET)
        },

        async addTodo(context, todo) {
            //Api call to add a todo item to the database
            //context.commit('ADD_TODO', todo)
        },

        async toggleTodo(context, { id, completed }) {
            //Api call that will toggle the completed state of the todo in the database 
            //context.commit('TOGGLE_TODO', { id, completed })
        }

    },

    getters: {
      todos(state) {
          //return state.todos
      },

      incompleteTodos(state) {
          //return state.todos.filter(todo => todo.completed == false)
      },

      completeTodos(state) {
          //return state.todos.filter(todo => todo.completed == true)
      }
  },
})
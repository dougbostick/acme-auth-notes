import { combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import axios from "axios";

const notes = (state = [], action) => {
  if (action.type === "SET_NOTES") {
    console.log("notes thunk", action);
    return action.notes;
  }
  if (action.type === "DELETE_NOTE") {
    const filtered = state.filter((note) => {
      return note.id !== action.id;
    });
    return (state = filtered);
  }
  if (action.type === "ADD_NOTE") {
    return (state = [...state, action.note]);
  }
  return state;
};

const auth = (state = {}, action) => {
  if (action.type === "SET_AUTH") {
    return action.auth;
  }
  return state;
};

const logout = () => {
  window.localStorage.removeItem("token");
  return {
    type: "SET_AUTH",
    auth: {},
  };
};

const signIn = (credentials) => {
  return async (dispatch) => {
    let response = await axios.post("/api/auth", credentials);
    const { token } = response.data;
    window.localStorage.setItem("token", token);
    console.log("token", token);
    // dispatch(getNotes());
    return dispatch(attemptLogin());
  };
};
const attemptLogin = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.get("/api/auth", {
        headers: {
          authorization: token,
        },
      });
      console.log("login thunk", response);
      dispatch({ type: "SET_AUTH", auth: response.data });
    }
  };
};

const getNotes = () => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.get("/api/notes", {
        headers: {
          authorization: token,
        },
      });
      dispatch({ type: "SET_NOTES", notes: response.data });
    }
  };
};

const deleteNote = (id) => {
  return async (dispatch) => {
    await axios.delete(`/api/notes/${id}`);
    dispatch({ type: "DELETE_NOTE", id });
  };
};

const addNote = (text) => {
  return async (dispatch) => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await axios.post(
        "/api/notes",
        {
          text,
        },
        {
          headers: {
            authorization: token,
          },
        }
      );
      console.log("addnotethunk", response);
      const data = response.data;
      console.log("addnote thunk data", data);
      dispatch({ type: "ADD_NOTE", note: data });
    }
    // const response = await axios.post("/api/notes", { text });
    // console.log("response", response);
    // const data = response.data;
    // dispatch({ type: "ADD_NOTE", data });
  };
};

const store = createStore(
  combineReducers({
    auth,
    notes,
  }),
  applyMiddleware(thunk, logger)
);

export { attemptLogin, signIn, logout, getNotes, deleteNote, addNote };

export default store;

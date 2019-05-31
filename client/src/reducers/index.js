import { combineReducers } from "redux";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";
import sidebarReducer from "./sidebarReducer";

export default combineReducers({
  error: errorReducer,
  auth: authReducer,
  sidebar: sidebarReducer
});
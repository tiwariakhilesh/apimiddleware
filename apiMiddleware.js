import axios from "axios";
import {showLoader} from "../actions/auth";
import {API_CALL} from "../actions/actionTypes";

// timeout in 3 sec
export const instance = axios.create({
  timeout: 3000,
});
let loaderStack = 0;
export default ({dispatch}) => (next) => async (action) => {
  if (action.type !== API_CALL) {
    return next(action);
  }
  const {
    url,
    onSuccess,
    onError,
    method = "get",
    data
  } = action.payload;

  const headers = {Accept: "application/json", "Content-Type": "application/json"};

  // loader initiated
  dispatch(showLoader(true));
  loaderStack++;

  const options = {
    url,
    method,
    headers,
    data,
  };
  try {
    const response = await instance(options);
    if (onSuccess) {
      const successAction = onSuccess(response, dispatch);
      if (successAction) {
        dispatch(successAction);
      }
    }
  } catch (error) {
    if (onError) {
      const errorAction = onError(error.response || error.toString(), dispatch);
      if (errorAction) {
        dispatch(errorAction);
      }
    }
  } finally {
    loaderStack--;
  }
  if (loaderStack) {
    dispatch(showLoader(true));
  } else {
    dispatch(showLoader(false));
  }

  return next(action);
};

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import invoices from './store/invoices';
const root = combineReducers({ invoices });
const store = createStore(root, applyMiddleware(thunk));
export default store;

// Redux slice for invoices (minimal)
const initial = { list: [], page:1, limit:10, loading:false };
export default function invoices(state=initial, action){
  switch(action.type){
    case 'INV_LOADING': return {...state, loading:true};
    case 'INV_LOADED': return {...state, loading:false, list: action.payload};
    default: return state;
  }
}

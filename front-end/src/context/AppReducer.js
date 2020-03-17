export default (state, action) => {
    switch(action.type){
        case 'GET_CHATS':
            return {
                ...state,
                loading: false,
                chats: action.payload
            }
        case 'GET_ROOMS':
            return {
                ...state,
                loading: false,
                rooms: action.payload
            }
        case 'GET_USERS':
            return {
                ...state,
                loading: false,
                users: action.payload
            }
        case 'GET_EVENTS':
            return {
                ...state,
                loading: false,
                events: action.payload
            }
        case 'ADD_CHAT':
            return {
            ...state,
            chats: [...state.chats, action.payload]
        }

        case 'DELETE_ROOM':
            return {
                ...state,
                loading: false,
                rooms: action.payload
            }
        case 'CHAT_ERROR':
            return {
                ...state,
                error: action.payload
            }
        case 'DELETE_ERROR':
            return{
                ...state,
                error: action.payload
            }
        case 'ROOM_ERROR':
            return {
                ...state,
                error: action.payload
            }
        case 'EVENT_ERROR':
            return {
                ...state,
                error: action.payload
            }
        default:
            return state
    }
}
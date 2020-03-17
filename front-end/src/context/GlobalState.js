import React, { createContext, useReducer, useState} from 'react'
import AppReducer from './AppReducer'
import io from 'socket.io-client'
import axios from 'axios'



// Declare initialState for application
const initialState = {
  chats:[],
  rooms:[],
  users:[],
  events:[],
  error: null,
  loading: true
}


let socket;


// Send Chat to server
const sendChatAction = (chatMessage) => {
    socket.emit('chat message', chatMessage)
}

const sendUser = (user) => {
    socket.emit('user joined', user)
}

const sendUserLeft = (user) => {
  socket.emit('user left', user)
}

const joinRoom = (joinRoomEvent) => {
  socket.emit('join room', joinRoomEvent)
}

const leaveRoom = (leaveRoomEvent) => {
    socket.emit('leave room', leaveRoomEvent)
}

// Create context
export const GlobalContext = createContext()

// Provider Component
export const GlobalProvider = ({children}) => {
    const [user, setUser] = useState('')
    const [activeRoom, changeActiveRoom ] = useState('General')
    const [state, dispatch] = useReducer(AppReducer, initialState)
    const [token, setToken] = useState('')
    const SERVER = "https://api-chat-react.herokuapp.com";
    

    // Socket.io client implementation    
    if(!socket){    
      socket = io(`${SERVER}`)
      socket.on('chat message', function(msg) {
        const token = localStorage.getItem('token')
        addChat(msg, token)
      })
      
      socket.on('user joined', function(joinedUser){
        const { name, token } = joinedUser
        localStorage.setItem('token',token)
        const event = {
            type:"User Join",
            user: name,
            source: "Guest Join"
        }
        addEvent(event, token)
      })

      socket.on('join room', function(joinRoomEvent) {
        const { user, room} = joinRoomEvent
        if(user) {
          const event = {
            type: "Join Room",
            user: user,
            source: room
          }
          const token = localStorage.getItem('token')
          addEvent(event, token)
        }
      })

      socket.on('leave room', function(leaveRoomEvent) {
        const { user, room } = leaveRoomEvent
        if(user){
          const event = {
            type: "Leave Room",
            user: user,
            source: room
          }
          const token = localStorage.getItem('token')
          addEvent(event, token)
        }
      })

      socket.on('user left', function(leftUser) {
          const event = {
            type:"User Left",
            user: leftUser,
            source: "Main Page"
          }
          const token = localStorage.getItem('token')
          addEvent(event, token)
          localStorage.removeItem('token')
      })
  }   

  // Add Event
  const addEvent = async (event, token) => {
    const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
    }
    try {
        await axios.post(`${SERVER}/api/eventlog`, event, config);
    }
    catch (err) {
        console.log(err.response.data.error)
    }
}


    // Get all chats from the DB
    const getChats = async (token) => {
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
        try {
          const res = await axios.get(`${SERVER}/api/chat`, config);
            
          dispatch({
            type: 'GET_CHATS',
            payload: res.data.data
          });
        } catch (err) {
          dispatch({
            type: 'CHAT_ERROR',
            payload: err.response.data.error
          });
        }
    }

    const getUsers = async (token) => {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
      try {
        const res = await axios.get(`${SERVER}/api/user`, config);
          
        dispatch({
          type: 'GET_USERS',
          payload: res.data.data
        });
      } catch (err) {
        dispatch({
          type: 'USER_ERROR',
          payload: err.response.data.error
        });
      }
  }

  const getEvents = async (token) => {
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    try {
      const res = await axios.get(`${SERVER}/api/eventlog`, config);
        
      dispatch({
        type: 'GET_EVENTS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'EVENT_ERROR',
        payload: err.response.data.error
      });
    }
}

    // Get all rooms from the DB
    const getRooms = async (token) => {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
        try {
          const res = await axios.get(`${SERVER}/api/room`, config);
    
          dispatch({
            type: 'GET_ROOMS',
            payload: res.data.data
          });
        } catch (err) {
          dispatch({
            type: 'ROOM_ERROR',
            payload: err.response.data.error
          });
        }
    }

    // Add new chat to the DB
    const addChat = async (chat, token) => {
        const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
        }
        try {
            const res = await axios.post(`${SERVER}/api/chat`, chat, config);

            dispatch({
              type: 'ADD_CHAT',
              payload: res.data.data
            });
        }
        catch (err) {
          dispatch({
            type: 'CHAT_ERROR',
            payload: err.response.data.error
          });
        }
    }

    // Delete Room 
    const deleteRoom = async (id,token) => {
      const config = {
        headers: {
          'Authorization':`Bearer ${token}`
        }
      }

      try{
        const res = await axios.delete(`${SERVER}/api/room/${id}`,config);

        dispatch({
          type: 'DELETE_ROOM',
          payload: res.data.data
        });
      }
      catch(err){
        dispatch({
          type: 'DELETE_ERROR',
          payload:err.response.data.error
        })
      }
    }

    return (
        <GlobalContext.Provider value={{
          /* List of items */
            chats: state.chats,
            rooms: state.rooms,
            error: state.error,
            users: state.users,
            events: state.events,
            loading: state.loading,
            /* Socket methods*/
            sendChatAction,
            sendUser,
            sendUserLeft,
            /* user getter and setter */
            user,
            setUser,
            token,
            setToken,
            activeRoom,
            changeActiveRoom,
            joinRoom,
            leaveRoom,
            addChat,
            /* Get list of items */
            getUsers,
            getChats,
            getRooms,
            getEvents
            }}>
            {children}
        </GlobalContext.Provider>
    )
}
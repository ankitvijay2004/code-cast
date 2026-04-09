import {io} from 'socket.io-client';

export const initSocket = async () =>{
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    const options = {
        forceNew: true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(backendUrl, options);
}
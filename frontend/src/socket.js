import { io } from 'socket.io-client';
const URL = 'http://localhost:8800';
export const socket = io(URL); // Connect automatically
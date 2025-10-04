import { io } from 'socket.io-client';
const URL = 'quizarenaproject-production.up.railway.app';
export const socket = io(URL); // Connect automatically
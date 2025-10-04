import { io } from 'socket.io-client';
const URL = 'https://quizarenaproject-production.up.railway.app';
export const socket = io(URL); // Connect automatically
import http from 'http';
import { Server } from 'socket.io';
import app from './app';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

interface ChatMessage {
  sender: string;
  recipient: string;
  message: string;
  timestamp: string;
  type: 'private' | 'broadcast';
}

const clients = new Map<string, string>(); // clientId => socketId
let adminSocket: string | null = null;

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Register client
  socket.on('register_client', (clientId: string) => {
    clients.set(clientId, socket.id);
    console.log(`Client registered: ${clientId}`);

    // Notify admin of new client
    if (adminSocket) {
      io.to(adminSocket).emit('client_connected', clientId);
      io.to(adminSocket).emit('client_list', Array.from(clients.keys()));
    }

    // Attach clientId to socket instance
    (socket as any).clientId = clientId;
  });

  // Register admin
  socket.on('register_admin', () => {
    adminSocket = socket.id;
    console.log('Admin registered');

    socket.emit('client_list', Array.from(clients.keys()));
  });

  // Client sends message to admin
  socket.on('client_message', ({  message }: {  message: string }) => {
    const clientId = (socket as any).clientId; // ✅ Get clientId from socket
    if (!clientId) {
      console.warn('Client message received but clientId is missing on socket.');
      return;
    }
    console.log("clientId+++",clientId)
    const msg: ChatMessage = {
      sender: clientId,
      recipient: 'admin',
      message,
      timestamp: new Date().toISOString(),
      type: 'private'
    };

    console.log(`Client message from ${clientId}: ${message}`);

    // Send to admin
    if (adminSocket) {
      io.to(adminSocket).emit('message_received', msg);
    }

    // Optional: echo back to client (if needed for their UI)
    const clientSocketId = clients.get(clientId);
    if (clientSocketId) {
      io.to(clientSocketId).emit('message_received', msg);
    }
  });

  // Admin sends message to specific client
  socket.on('admin_message', ({ clientId, message }: { clientId: string; message: string }) => {
    const msg: ChatMessage = {
      sender: 'admin',
      recipient: clientId,
      message,
      timestamp: new Date().toISOString(),
      type: 'private'
    };

    console.log(`Admin message to ${clientId}: ${message}`);

    const clientSocketId = clients.get(clientId);
    if (clientSocketId) {
      io.to(clientSocketId).emit('message_received', msg);
    }

    // Echo to admin for state sync
    if (adminSocket) {
      io.to(adminSocket).emit('message_received', msg);
    }
  });

  // Admin sends broadcast
  socket.on('admin_broadcast', (message: string) => {
    const msg: ChatMessage = {
      sender: 'admin',
      recipient: 'all',
      message,
      timestamp: new Date().toISOString(),
      type: 'broadcast'
    };

    console.log(`Admin broadcast: ${message}`);

    clients.forEach((socketId) => {
      io.to(socketId).emit('message_received', msg);
    });

    if (adminSocket) {
      io.to(adminSocket).emit('message_received', msg);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);

    if (socket.id === adminSocket) {
      console.log('Admin disconnected');
      adminSocket = null;
    } else {
      const clientIdToRemove = Array.from(clients.entries()).find(([_, sId]) => sId === socket.id)?.[0];

      if (clientIdToRemove) {
        clients.delete(clientIdToRemove);
        console.log(`Client ${clientIdToRemove} disconnected`);

        if (adminSocket) {
          io.to(adminSocket).emit('client_disconnected', clientIdToRemove);
          io.to(adminSocket).emit('client_list', Array.from(clients.keys()));
        }
      }
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

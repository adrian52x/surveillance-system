# Object Detection App - Backend + Frontend with WebSockets

## 🚀 Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
# From root directory
npm install
```

### 2. Start Development Servers

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Server will run on: http://localhost:5000

**Terminal 2 - Frontend App:**
```bash
npm run dev
```
App will run on: http://localhost:3000

### 3. Test WebSocket Connection

1. Open http://localhost:3000
2. Enter your name or generate a random one
3. Click "Start Detection Session"
4. Check browser console for connection logs

### 4. Test API Endpoints

- Health Check: http://localhost:5000/health
- Connected Users: http://localhost:5000/api/users
- Recent Detections: http://localhost:5000/api/detections

## 🏗️ Architecture

```
Frontend (Next.js - Port 3000)     Backend (Express + Socket.io - Port 5000)
├── User Join Page                 ├── WebSocket Server
├── Camera Detection               ├── REST API
├── Real-time Updates              ├── In-memory Storage (for now)
└── Socket.io Client               └── CORS Enabled
```

## 📡 WebSocket Events

**Client → Server:**
- `join-session` - User joins with name
- `detection` - Send object detection data
- `ping` - Test connection

**Server → Client:**
- `session-joined` - Confirm session joined
- `new-detection` - Broadcast detection to all users
- `user-joined` - New user connected
- `user-left` - User disconnected
- `pong` - Response to ping

## 🔄 Next Steps

1. ✅ Basic WebSocket connection
2. ⏳ Integrate camera detection with WebSocket
3. ⏳ Create dashboard view
4. ⏳ Add database (SQLite → PostgreSQL)
5. ⏳ Add authentication

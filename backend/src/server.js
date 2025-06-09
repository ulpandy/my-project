const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Маршруты
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const activityRoutes = require('./routes/activityRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Загрузка .env
dotenv.config();
require('./config/database');

// Инициализация express
const app = express();
const PORT = process.env.PORT || 3000;

// Создание HTTP-сервера
const server = http.createServer(app);

// Настройка socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Vite frontend
    methods: ['GET', 'POST']
  }
});

// 📡 WebSocket логика
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  // Пример: сервер получил уведомление и транслирует пользователю
  socket.on('send-notification', ({ userId, message }) => {
    io.emit(`notification:${userId}`, {
      id: Date.now(),
      message,
      createdAt: new Date(),
      isRead: false
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// Сделать io доступным глобально (опционально)
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Проверка состояния сервера
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Статические файлы (например, аватарки)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Обработка ошибок
app.use(errorHandler);

// Запуск сервера
server.listen(PORT, () => {
  logger.info(`🚀 Server with socket.io running on http://localhost:${PORT}`);
});

// Глобальные обработчики ошибок
process.on('uncaughtException', (err) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection:', promise, 'reason:', reason);
  process.exit(1);
});

import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import { connectDB } from './config/database';
import defaultRouter from './routes/default';
import healthRouter from './routes/heath';
import usersRouter from './routes/users';
import boardsRouter from './routes/boards';
import listsRouter from './routes/lists';
import cardsRouter from './routes/cards';
import chatRouter from './routes/chat';
import authRouter from './routes/auth';
import { logger, corsMiddleware, notFound, errorHandler } from './middleware';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Connect to MongoDB
connectDB();

// Middlewares
app.use(logger);
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('', defaultRouter);
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/chat', chatRouter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

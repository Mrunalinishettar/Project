const mongoose = require('mongoose');
const dotenv = require('dotenv');

// crash on sync errors
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// load env before anything else
dotenv.config({ path: './config.env' });

const app = require('./app');

// Build the final Mongo URI by replacing the placeholder
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,   // fixes old SDAM warning
    useCreateIndex: true,       // kept for Mongoose v5 projects
    useFindAndModify: false     // kept for Mongoose v5 projects
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => {
    console.error('Mongo connect error:', err.name, err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// crash on rejected promises
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => process.exit(1));
});

// graceful shutdown on SIGTERM (optional)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => process.exit(0));
});

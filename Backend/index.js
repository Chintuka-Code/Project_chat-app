require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 4000;
const DB_URL = process.env.DB_URL;

// Database Connection
mongoose
  .connect(DB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DataBase Connect'))
  .catch((error) => {
    console.log(error);
  });

// required Route
const User = require('./Routes/admin_route');
const Permission = require('./Routes/permission');
const Subject = require('./Routes/subject');
const Course = require('./Routes/course');
const Batch = require('./Routes/batch');
const Student = require('./Routes/student');
const Category = require('./Routes/category');
const Blog = require('./Routes/blog');
const Chat = require('./Routes/chat');

// Using middle ware
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);
app.use(express.json({ limit: '50mb' }));

app.use('/user', User);
app.use('/permission', Permission);
app.use('/subject', Subject);
app.use('/course', Course);
app.use('/batch', Batch);
app.use('/student', Student);
app.use('/category', Category);
app.use('/blog', Blog);
app.use('/chat', Chat);

// export socket.io connection to chat module
require('./Chat/chat')(io);

//wire up the server to listen to our PORT
http.listen(PORT, () => {
  console.log(`App started on http://localhost:${PORT}`);
});

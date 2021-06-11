const CHAT = require('../Models/chat');

const chat = (io) => {
  try {
    io.on('connection', (socket) => {
      socket.on('join', (data) => {
        socket.join(data.room_id);
      });

      // how many connection
      // console.log(io.engine.clientsCount);

      socket.on('message', async (message, data) => {
        io.in(data.room_id).emit('new message', message);

        if (message.sender_type == 'student') {
          const admin_unread_count = await CHAT.findById(
            { _id: data.chat_id },
            { admin_unread_count: 1, _id: 0 }
          );

          io.sockets.emit('increment counter', {
            admin_unread_count: admin_unread_count.admin_unread_count,
            chat_id: data.chat_id,
          });

          await CHAT.findByIdAndUpdate(
            { _id: data.chat_id },
            {
              admin_unread_count:
                parseInt(admin_unread_count.admin_unread_count) + 1,
              student_unread_count: 0,
              $push: { message: message },
            }
          );
        } else {
          const student_unread_count = await CHAT.findById(
            { _id: data.chat_id },
            { student_unread_count: 1, _id: 0 }
          );

          await CHAT.findByIdAndUpdate(
            { _id: data.chat_id },
            {
              student_unread_count:
                parseInt(student_unread_count.student_unread_count) + 1,
              admin_unread_count: 0,
              $push: { message: message },
            }
          );
        }
      });

      socket.on('assign-chat-to-admin', async (data) => {
        // send data to every connection/socket
        io.sockets.emit('assign-chat', data);

        await CHAT.findByIdAndUpdate(
          { _id: data.chat_id },
          { sme_id: data.sme_id }
        );
      });

      socket.on('end-all-chat', (data) => {
        io.sockets.emit('end-chat', data);

        Promise.all(
          data.map(async (chat) => {
            await CHAT.findByIdAndUpdate({ _id: chat._id }, { sme_id: null });
          })
        );
      });

      socket.on('transfer', async (data) => {
        io.sockets.emit('transfer-chat', data);

        await CHAT.findByIdAndUpdate(
          { _id: data._id },
          { sme_id: data.sme_id }
        );
      });

      socket.on('leave', async (data) => {
        socket.leave(data.room_id);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = chat;

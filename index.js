//Express server for socket connections between webRTC clients.
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("<h1>Socket Server running</h1>");
});

const io = require("socket.io")(
  app.listen(process.env.PORT || 8000, () => {
    console.log(`App started on port ${process.env.PORT || 8000}`);
  }),
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  }
);

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user-joined", (name) => {
    if(name){
      console.log(`${name} has joined the chat.`);
      users[socket.id] = `${name}_${socket.id}`;
      io.to(socket.id).emit("active-users", users);
      socket.broadcast.emit("user-joined", {
      id: socket.id,
      name: users[socket.id],
    });
    }
    else{
      socket.disconnect();
    }
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("recieve", { message: data, user: users[socket.id] });
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("Disconnected", {
      id: socket.id,
      name: users[socket.id],
    });
    console.log(`${users[socket.id]} disconnected`);
    delete users[socket.id];
    socket.off
  });
});

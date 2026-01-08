const net = require("net");


const testPort = (host, port) => {
  const socket = new net.Socket();
  socket.setTimeout(5000);

  socket.on("connect", () => {
    console.log(`Port ${port} on ${host} is OPEN`);
    socket.destroy();
  });

  socket.on("timeout", () => {
    console.log(`Port ${port} on ${host} TIMED OUT`);
    socket.destroy();
  });

  socket.on("error", (err) => {
    console.log(`Port ${port} on ${host} ERROR:`, err.message);
  });

  socket.connect(port, host);
};

// Test Gmail SMTP ports
testPort("smtp.gmail.com", 25);
testPort("smtp.gmail.com", 465);
testPort("smtp.gmail.com", 587);

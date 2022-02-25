const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const items = [];

// protocol buffer file -> javascript representation of file -> gRPC object that's useable
const protoPath = '../item.proto';
const packageDefinition = protoLoader.loadSync(protoPath, {});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);

// service implementation

// unary
const createItem = (call, callback) => {
  items.push({ name: call.request.name });
  callback(null, { success: true });
};
const getItems = (call, callback) => {
  callback(null, { items });
};
const createItems = (call, callback) => {
  items.push(...call.request.items.map((item) => ({ name: item.name })));
  callback(null, { success: true });
};
// client stream
const createItemsStream = (call, callback) => {
  call.on('data', (item) => {
    items.push({ name: item.name });
  });
  call.on('end', () => callback(null, { success: true }));
};
// server stream
const getItemsStream = (call, callback) => {
  items.forEach((item) => {
    call.write(item);
  });
  call.end();
};
// bidirectional stream
const findItemsStream = (call, callback) => {
  call.on('data', (item) => {
    call.write({ found: typeof items.map(item => item.name).find(itemName => itemName === item.name) !== 'undefined' });
  });
  call.on('end', () => call.end());
};

// gRPC server
const server = new grpc.Server();
server.addService(grpcObject.Itemizer.service, {
  createItem,
  createItems,
  getItems,
  createItemsStream,
  getItemsStream,
  findItemsStream,
});
server.bindAsync(
  '0.0.0.0:3000',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('gRPC server listening on port 3000.');
    server.start(); // callback that starts server
  },
);

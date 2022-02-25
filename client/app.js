const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const yargs = require('yargs');

// protocol buffer file -> javascript representation of file -> gRPC object that's useable
const protoPath = '../item.proto';
const packageDefinition = protoLoader.loadSync(protoPath, {});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
// gRPC client
const client = new grpcObject.Itemizer(
  'localhost:3000',
  grpc.credentials.createInsecure(),
);

const argv = yargs.command(
  'create_item', 'Create an item.'
).command(
  'create_items', 'Create multiple items.'
).command(
  'get_items', 'Get an item.'
).command(
  'create_items_stream', 'Create multiple items from an input stream.'
).command(
  'get_items_stream', 'Get items and writes into an output stream.'
).command(
  'find_items_stream', 'Find items from an input stream and writes to an output stream.'
).help().alias('help', 'h').argv;

let call;

switch (argv._[0]) {
  case 'create_item':
    client.createItem({ name: argv._[1] }, (err, response) => {
      console.log(err ? err : response);
    });
    break;
  case 'create_items':
    client.createItems({ items: argv._.slice(1).map((name) => ({ name })) }, (err, response) => {
      console.log(err ? err : response);
    });
    break;
  case 'get_items':
    client.getItems(null, (err, response) => {
      console.log(err ? err : response);
    });
    break;
  case 'create_items_stream':
    call = client.createItemsStream((err, response) => {
      console.log(err ? err : response);
    });
    argv._.slice(1).map((name) => ({ name })).forEach((item) => call.write(item));
    call.end();
    break;
  case 'get_items_stream':
    call = client.getItemsStream();
    call.on('data', (item) => console.log(item));
    call.on('end', () => {});
    break;
  case 'find_items_stream':
    let numToFind = argv._.length-1;
    call = client.findItemsStream();
    argv._.slice(1).map((name) => ({ name })).forEach((item) => {
      call.write(item);
    });
    call.on('data', (foundResponse) => {
      console.log(foundResponse.found);
      --numToFind;
      if (numToFind === 0) call.end();
    });
    call.on('end', () => {});
    break;
}

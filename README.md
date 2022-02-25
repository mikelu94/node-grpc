# gRPC Client/Server in Node.js
Example of gRPC client and server in Node.js.

## Dependencies

- `npm` or `yarn`

## How to Set Up

```bash
for dir in client server
do
    cd ${dir}
    yarn install
    # alternatively: npm install
    cd ..
done
```

## How to Run Server

```bash
$ cd server
$ yarn start &
```

## How to Use Client

```bash
$ cd client
$ node app.js --help
```

# matrix-contract

This is a sub package of [web3.js][repo]

This is the contract package to be used in the `web3-eth` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install matrix-contract
```

### In the Browser

Build running the following in the [web3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/matrix-contract.js` in your html file.
This will expose the `matrixContract` object on the window object.


## Usage

```js
// in node.js
var matrixContract = require('matrix-contract');

// set provider for all later instances to use
matrixContract.setProvider('ws://localhost:8546');

var contract = new matrixContract(jsonInterface, address);
contract.methods.somFunc().send({from: ....})
.on('receipt', function(){
    ...
});
```


[docs]: http://Matrix.readthedocs.io/en/1.0/
[repo]: https://github.com/MatrixAINetwork/aiman



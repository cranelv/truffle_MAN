import BN from "bn.js";
import { Web3Shim } from "./web3-shim";
import { Iban } from "web3-eth-iban";
import { ContractexecuteMethod } from  "../src/matrix-override.js";
//import aiman from 'aiman';
//import { Callback } from "web3/types";

export const MatrixDefinition = {
  async initNetworkType (web3: Web3Shim) {
    console.log("Welcome to Matrix AI Network");
//    let provider = web3.eth.currentProvider;
//    const man = new aiman(provider);
//    web3.eth = man.man;
//    web3.eth.setProvider(provider);
//    web3.eth.net.setProvider(provider);
    // truffle has started expecting gas used/limit to be
    // hex strings to support bignumbers for other ledgers
    overrides.getAccounts(web3);
    overrides.getBlock(web3);
    overrides.getTransaction(web3);
    overrides.getTransactionReceipt(web3);
    overrides.getOrSetDefaultOptions(web3);
    overrides.executeMethod(web3);
   }
}

var isStrictAddress = function (address : string) {
  return /^[A-Z]{2,8}\.[0-9a-zA-Z]{18,29}$/i.test(address);
};
var isAddress = function (address : string) {
  if (!(/^[A-Z]{2,8}\.[0-9a-zA-Z]{18,29}$/.test(address))) {
    // check if it has the basic requirements of an address
    return false;
  } else if ((/^[A-Z]{2,8}\.[0-9a-zA-Z]{18,29}$/.test(address))) {
    // If it's all small caps or all all caps, return true
    return true;
  } else {
    // Otherwise check each case
    return address;
  }
};
function bigNumbertoHex(value : string){
  return "0x" + new BN(value).toString(16);
}
function bigNumbertoDecimal(value : string){
  return new BN(value).toString(10);
}
var inputAddressFormatter = function (address : string) {
  var iban = new Iban(address);
  if (iban.isValid() && iban.isDirect()) {
    return iban.toAddress();
  } else if (isStrictAddress(address)) {
    return address;
  } else if (isAddress(address)) {
    return address;
  }
  throw new Error('invalid address');
};
var isBoolean = function (object : any) {
  return typeof object === 'boolean';
};
var isArray = function (object : any) {
  return object instanceof Array;
};
const overrides = {
// The ts-ignores are ignoring the checks that are
// saying that web3.eth.getBlock is a function and doesn't
  "executeMethod": (web3: Web3Shim) => ContractexecuteMethod,
  "getAccounts": (web3: Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.getAccounts.method.outputFormatter = accounts => {
      // @ts-ignore
      // Perhaps there is a better method of doing this,
      // but the raw hexstrings work for the time being
      return accounts[0];
    };
  },
  "getOrSetDefaultOptions" : (web3: Web3Shim) => {
    web3.eth.Contract.prototype._getOrSetDefaultOptions = function getOrSetDefaultOptions(options : any) {
      var gasPrice = options.gasPrice ? String(options.gasPrice): null;
      var from = options.from ? inputAddressFormatter(options.from) : null;

      options.data = options.data || this.options.data;

      options.from = from || this.options.from;
      options.gasPrice = gasPrice || this.options.gasPrice;
      options.gas = options.gas || options.gasLimit || this.options.gas;

      // TODO replace with only gasLimit?
      delete options.gasLimit;

      return options;
    };
  },
  "estimateGas": (web3: Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.estimateGas.method.outputFormatter = function (options){

      if (options.from) {
        options.from = inputAddressFormatter(options.from);
      }

      if (options.to) { // it might be contract creation
        options.to = inputAddressFormatter(options.to);
      }

      ['gasPrice', 'gas', 'value', 'nonce'].filter(function (key) {
        return options[key] !== undefined;
      }).forEach(function(key){
        options[key] = bigNumbertoHex(options[key]);
      });

      return options;
    };
  },
  "getBlock": (web3: Web3Shim) => {
    // @ts-ignore

    // @ts-ignore
    web3.eth.getBlock.method.outputFormatter = block => {

      // transform to number
      block.gasLimit = bigNumbertoDecimal(block.gasLimit);
      block.gasUsed = bigNumbertoDecimal(block.gasUsed);
      block.size = bigNumbertoDecimal(block.size);
      block.timestamp = bigNumbertoDecimal(block.timestamp);
      if (block.number !== null)
        block.number = bigNumbertoDecimal(block.number);

      block.difficulty = bigNumbertoDecimal(block.difficulty);
      block.totalDifficulty = bigNumbertoDecimal(block.totalDifficulty);
      // block.version=buffer.from(block.version,"ascii").toString();

//      block.version = utils.toAscii(block.version);
      //block.version=new String(block.version);
      if (block.versionSignatures instanceof Array) {
        for (var i = 0; i < block.versionSignatures.length; i++) {
          var temp = block.versionSignatures[i];
          block.versionSignatures[i] = "0x";
          for (var j = 0; j < temp.length; j++) {
            var n = temp[j].toString(16);
            block.versionSignatures[i] += n.length < 2 ? '0' + n : n;
          }
        }
      }

            if (block.transactions instanceof Array) {
              for(var i=0;i<block.transactions.length;i++){
                if(typeof block.transactions[i] !== 'string')
                  var tx = block.transactions[i]
                if(tx.blockNumber !== null)
                  tx.blockNumber = bigNumbertoDecimal(tx.blockNumber);
                if(tx.transactionIndex !== null)
                  tx.transactionIndex = bigNumbertoDecimal(tx.transactionIndex);
                tx.nonce = bigNumbertoDecimal(tx.nonce);
                tx.gas = bigNumbertoDecimal(tx.gas);
                tx.gasPrice = bigNumbertoDecimal(tx.gasPrice);
                tx.value = bigNumbertoDecimal(tx.value);
                for(var i = 0; tx.extra_to && i < tx.extra_to.length; i++){
                  tx.extra_to[i].value = bigNumbertoDecimal(tx.extra_to[i].value);
                }
              }
            }

      return block;
    };
  },

  "getTransaction": (web3: Web3Shim) => {
    const _oldTransactionFormatter =
      // @ts-ignore
      web3.eth.getTransaction.method.outputFormatter;

    // @ts-ignore
    web3.eth.getTransaction.method.outputFormatter = tx => {
      let result = _oldTransactionFormatter.call(
        // @ts-ignore
        web3.eth.getTransaction.method,
        tx
      );

      // Perhaps there is a better method of doing this,
      // but the raw hexstrings work for the time being
      result.gas = "0x" + new BN(result.gas).toString(16);

      return result;
    };

  },

  "getTransactionReceipt": (web3: Web3Shim) => {
    const _oldTransactionReceiptFormatter =
      // @ts-ignore
      web3.eth.getTransactionReceipt.method.outputFormatter;

    // @ts-ignore
    web3.eth.getTransactionReceipt.method.outputFormatter = receipt => {
      let result = _oldTransactionReceiptFormatter.call(
        // @ts-ignore
        web3.eth.getTransactionReceipt.method,
        receipt
      );

      // Perhaps there is a better method of doing this,
      // but the raw hexstrings work for the time being
      result.gasUsed = "0x" + new BN(result.gasUsed).toString(16);

      return result;
    };
  }
};

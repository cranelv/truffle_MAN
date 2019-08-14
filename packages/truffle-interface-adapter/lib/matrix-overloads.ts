import BN from "bn.js";
import { Web3Shim } from "./web3-shim";
import { Iban } from "web3-eth-iban";
import utils from "web3-utils";
import { ContractNewOptions,balanceOutputFormatter,getcodeInputFormatter } from  "../src/matrix-override.js";
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
    for (let key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        // @ts-ignore
        overrides[key](web3);
      }
    }
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
  "contractNewOptions": (web3:Web3Shim) => { ContractNewOptions(web3); },
  // "executeMethod":(web3: Web3Shim) => {ContractexecuteMethod (web3);},
  "getAccounts": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.getAccounts.method.outputFormatter = accounts => {
      // @ts-ignore
      // Perhaps there is a better method of doing this,
      // but the raw hexstrings work for the time being
      return accounts[0];
    };
  },
  /*
  "getOrSetDefaultOptions" : (web3: Web3Shim) => {
    web3.eth.Contract.prototype._getOrSetDefaultOptions = function getOrSetDefaultOptions(options : any) {
      var gasPrice = options.gasPrice ? String(options.gasPrice): null;
      var from = options.from ? InputAddressFormatter(options.from) : null;

      options.data = options.data || this.options.data;

      options.from = from || this.options.from;
      options.gasPrice = gasPrice || this.options.gasPrice;
      options.gas = options.gas || options.gasLimit || this.options.gas;

      // TODO replace with only gasLimit?
      delete options.gasLimit;

      return options;
    };
  },
  */
  "estimateGas": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.estimateGas.method.inputFormatter = [inputCallFormatter];
  },
  "getBalanceInput": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.getBalance.method.inputFormatter[0] = matrix_override_js_1.InputAddressFormatter;
  },
  "getBalanceOutput": (web3:Web3Shim) => {
    balanceOutputFormatter(web3);
  },
  "sendTransaction": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.sendTransaction.method.inputFormatter = [inputCallFormatter];
  },
  "sendTransactionConfirm": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.sendTransaction.method._confirmTransaction = matrix_override_js_1.confirmTransaction;
  },
  "getTransactionReceipt": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.getTransactionReceipt.method.outputFormatter = outputTransactionReceiptFormatter;
  },
  "getBlock": (web3:Web3Shim) => {
    // @ts-ignore
    // @ts-ignore
    web3.eth.getBlock.method.outputFormatter = block => {
      // transform to number
      block.gasLimit = utils.hexToNumber(block.gasLimit);
      block.gasUsed = utils.hexToNumber(block.gasUsed);
      block.size = utils.hexToNumber(block.size);
      block.timestamp = utils.hexToNumber(block.timestamp);
      if (block.number !== null)
        block.number = utils.hexToNumber(block.number);
      block.difficulty = utils.hexToNumber(block.difficulty);
      block.totalDifficulty = utils.hexToNumber(block.totalDifficulty);
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
        for (var i = 0; i < block.transactions.length; i++) {
          if (typeof block.transactions[i] !== 'string')
            var tx = block.transactions[i];
          if (tx.blockNumber !== null)
            tx.blockNumber = utils.hexToNumber(tx.blockNumber);
          if (tx.transactionIndex !== null)
            tx.transactionIndex = utils.hexToNumber(tx.transactionIndex);
          tx.nonce = utils.hexToNumber(tx.nonce);
          tx.gas = utils.hexToNumber(tx.gas);
          tx.gasPrice = utils.hexToNumber(tx.gasPrice);
          tx.value = utils.hexToNumber(tx.value);
          for (var i = 0; tx.extra_to && i < tx.extra_to.length; i++) {
            tx.extra_to[i].value = utils.hexToNumber(tx.extra_to[i].value);
          }
        }
      }
      return block;
    };
  },
  "getCode": (web3:Web3Shim) => { getcodeInputFormatter(web3); },
  "getTransaction": (web3:Web3Shim) => {
    // @ts-ignore
    web3.eth.getTransaction.method.outputFormatter = tx => {
      if (tx.blockNumber !== null)
        tx.blockNumber = utils.hexToNumber(tx.blockNumber);
      if (tx.transactionIndex !== null)
        tx.transactionIndex = utils.hexToNumber(tx.transactionIndex);
      tx.nonce = utils.hexToNumber(tx.nonce);
      tx.gas = utils.hexToNumber(tx.gas);
      tx.gasPrice = utils.hexToNumber(tx.gasPrice);
      tx.value = utils.hexToNumber(tx.value);
      if (tx.to && isAddress(tx.to)) { // tx.to could be `0x0` or `null` while contract creation
      }
      else {
        tx.to = null; // set to `null` if invalid address
      }
      for (var i = 0; tx.extra_to && i < tx.extra_to.length; i++) {
        tx.extra_to[i].value = utils.hexToNumber(tx.extra_to[i].value);
      }
      return tx;
    };
  }
};

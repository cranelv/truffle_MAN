var MBCToken = artifacts.require("./MBCToken.sol");
module.exports = function(deployer) {
    deployer.deploy(MBCToken);
};
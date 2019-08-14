var EcoSystem = artifacts.require("./EcoSystem.sol");
module.exports = function(deployer) {
    deployer.deploy(EcoSystem);
};
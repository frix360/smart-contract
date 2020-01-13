const Kickstarter = artifacts.require("./Kickstarter.sol");

module.exports = function(deployer) {
    deployer.deploy(Kickstarter, 1, 100000);
};
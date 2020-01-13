# Smart-contract kickstarter


## About the project
This project is a basic implementation of smart contracts in Ethereum, to learn how it all works and how to communicate to the smart contract using Web3.js library. 

Task is located [here](https://github.com/blockchain-group/Blockchain-technologijos/blob/master/pratybos/4uzduotis-SmartContract.md).

## Business model

The purpose of this smart contract is to simplify crowdfunding model (like a popular platform called Kickstarter), so no 3rd party is required.

### How It works:

There 2 entities in this business model:
* **Project creator** - the person who owns the project.
* **Backers** - people who pledge their money for the project.

Each project has **goal** and **deadline**. Backers can pledge their money (in our case Ether) to the project and if project reaches its goal by the deadline, a project creator gets all the funds raised. However, if project does not reach its goal by the deadline, all the backers are refunded and project creator does not get anything.

This is usually implemented by having a 3rd party, that manages money (collects pledged money and gives funds to the creators or refunds to the backers). For this to work, both project creator and backer has to trust this 3rd party with their money. This smart-contract attempts to solve this problem, by eliminating the 3rd party and making these transactions as safe and transparent as possible. 

## Application structure

This project consists of 2 seperate applications:
- Truffle project, that contains a smart-contract created in Solidity programming language.  This application can be deployed to the test Ethereum network like this:

```
truffle compile
truffle migrate
```

- React project, that provides a minimalistic UI to communicate to the smart contract using Web3.js library. Within the project folder it can be runned like this:
```
npm run start
```

## Smart contract

This smart contract was created and tested in Remix IDE tool and then also tested locally (using Ganache) with Truffle. It solves the business problem and also exposes some methods that will be useful to the frontend.

```
pragma solidity >=0.4.22 <0.6.0;

contract Kickstarter {
    address owner;
    uint256 public deadline;
    uint256 public goal;

    mapping(address => uint256) public pledgeOf;

    constructor (uint256 numberOfDays, uint256 _goal) public {
        owner = msg.sender;
        deadline = now + (numberOfDays * 1 days);
        goal = _goal;
    }

    function pledge(uint256 amount) public payable {
        require(now < deadline);
        require(msg.value == amount);
        pledgeOf[msg.sender] += amount;
    }

    function claimFunds() public {
        require(address(this).balance >= goal);
        require(now >= deadline);
        require(msg.sender == owner);

        msg.sender.transfer(address(this).balance);
    }

    function getCurrentRaisedBalance() public view returns(uint256) {
        return address(this).balance;
    }

    function isOwner() public view returns(bool) {
        return msg.sender == owner;
    }

    function canClaim() public view returns(bool) {
        require(msg.sender == owner);
        return now >= deadline && address(this).balance >= goal;
    }

    function getRefund() public {
        require(address(this).balance < goal);
        require(now >= deadline);

        uint256 amount = pledgeOf[msg.sender];
        msg.sender.transfer(amount);
    }

}
```

### Smart contract testing in the Ropsten test network

![Connecting Remix IDE to Ropsten using MetaMask and deploying the smart contract](https://i.ibb.co/rwZxbrH/Screenshot-from-2020-01-12-01-57-53.png)

![Remix IDE view and pledge transaction](https://i.ibb.co/H2SkGyp/Screenshot-from-2020-01-12-01-59-19.png)

![Pledge transaction information](https://i.ibb.co/C7btQNM/Screenshot-from-2020-01-12-01-58-52.png)

### UI for interacting with a smart contract

![Main page](https://i.ibb.co/HzFmWHm/Screenshot-from-2020-01-13-02-41-00.png)

![Pledging](https://i.ibb.co/HzFmWHm/Screenshot-from-2020-01-13-02-41-00.png)

![Refunding](https://i.ibb.co/xSp2xDZ/Screenshot-from-2020-01-13-02-44-08.png)

![Claiming fund](https://i.ibb.co/0ftfQdn/Screenshot-from-2020-01-13-02-48-35.png)

## Release history

[v0.1](https://github.com/frix360/smart-contract/releases/tag/v0.1) - (2020-01-13)

- Initial commit





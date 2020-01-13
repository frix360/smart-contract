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
pragma solidity ^0.4.17;
pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampains;

    function createCampain(uint minimumContribution) public {
        address newCampaign = new Campaign(minimumContribution, msg.sender);

        deployedCampains.push(newCampaign);
    }

    function getDeployedCampains() public  view  returns (address[]) {
        return deployedCampains;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalsCount;
        mapping (address => bool) approvals;
    }

    address public manager;
    uint minimumContribution;
    mapping (address => bool) public  approvers;
    Request[] public requests;
    uint approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creater) public {
        manager = creater;
        minimumContribution = minimum;
        approversCount = 0;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
    }

    function createRequest(string description, uint value, address recipient) public  restricted {
        require(approvers[msg.sender]);
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalsCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalsCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalsCount > (approversCount / 2));

        request.complete = true;
        request.recipient.transfer(request.value);
    }
    
}
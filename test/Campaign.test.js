const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const compiledFactory = require("../build/CampaignFactory.json");
const compiledCampaign = require("../build/Campaign.json");
const { INSPECT_MAX_BYTES } = require("buffer");

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  factory.setProvider(provider);

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and campaign contract", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as campaign manager", async () => {
    const manager = await campaign.methods.manager().call();

    assert.equal(accounts[0], manager);
  });

  it("allows pepole to contribute money and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      value: "200",
      from: accounts[1],
    });

    const isContributer = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributer);
  });

  it("require a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        value: "5",
        from: accounts[1],
      });

      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it('allows manager to make a payment request', async () => {
    await campaign.methods.createRequest('Buy laptop', '100', accounts[1])
        .send({
            from: accounts[0],
            gas: '1000000'
        });

        const request = campaign.methods.requests(0).call();

        assert.equal('Buy laptop', request.description);
  });

  it('processes a request', async () => {
    await campaign.methods.contribute().send({
        value: web3.utils.toWei('10', 'ether'),
        from: accounts[0],
      });

    await campaign.methods.createRequest('A',
        web3.utils.toWei('5', 'ether'), accounts[1])
        .send(
        {
            from: accounts[0],
            gas: '1000000'
        });

    await campaign.methods.approveRequest(0).send({
        from: accounts[0],
        gas: '1000000'
    });

    await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '1000000'

    });

    let balance = await web3.eth.getBalance(accounts[1]);

    balance = web3.utils.fromWei(balance, 'ether');

    balance = parseFloat(balance);

    assert(balance > 104);

  });
});

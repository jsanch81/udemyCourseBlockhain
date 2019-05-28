const Airline = artifacts.require('Airline');

let instance;

beforeEach(async () => {
  instance = await Airline.new();
});

contract('Airline', accounts => {
  it('Should have available flights', async() => {
    let totalFlights = await instance.totalFlights();
    assert(totalFlights > 0);
  });

  it('Should allow customes to buy a flight providing its value', async() => {
    let flight = await instance.flights(0);
    let flightName = flight[0], price = flight[1];
    await instance.buyFlight(0, {from: accounts[0], value: price});
    let customerFlight = await instance.customerFlights(accounts[0], 0);
    let customerTotalFlights = await instance.customerTotalFlights(accounts[0]);
    assert(customerFlight[0] , flightName);
    assert(customerFlight[1], price);
    assert(customerTotalFlights, 1);
  });

  it('Should not allow customer to buy flights under the price', async() => {
    let flight = await instance.flights(0);
    let price = flight[1] - 5000;
    try {
        await instance.buyFlight(0, {from: accounts[0], value: price});
    }
    catch(error){
      return;
    }
    assert.fail();
  });

  it('Should get the real balance of the contract', async() => {
    let flight  = await instance.flights(0);
    let price = flight[1];

    let flight2  = await instance.flights(1);
    let price2 = flight2[1];
    await instance.buyFlight(0, {from: accounts[0], value: price});
    await instance.buyFlight(1, {from: accounts[0], value: price2});

    let newAirlineBalance = await instance.getAirlineBalance();
    assert.equal(newAirlineBalance.toNumber(), price.toNumber() + price2.toNumber());
  });

  it('Should allow customers to redeem loyalty points', async() => {
    let flight  = await instance.flights(1);
    let price = flight[1];
    await instance.buyFlight(1, {from: accounts[1], value: price});

    let balance = await web3.eth.getBalance(accounts[1]);
    console.log(balance);
    await instance.redeemLoyalPoints({from: accounts[1]});
    let finalBalance = await web3.eth.getBalance(accounts[1]);
    let customer = await instance.customers(accounts[1]);
    let loyaltyPoints = customer[0];
    assert(loyaltyPoints, 0);
    assert(finalBalance > balance);

  });
});

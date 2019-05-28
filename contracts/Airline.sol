pragma solidity ^0.4.24;

contract Airline {
  address public owner;

  struct Customer {
    uint loyaltyPoints;
    uint totalFlights;
  }

  struct Flight {
    string name;
    uint price;
  }
  uint etherPerPoint = 0.5 ether;

  Flight[] public flights;
  mapping (address => Customer) public customers;
  mapping (address => Flight[]) public customerFlights;
  mapping (address => uint) public customerTotalFlights;

  event FlightPurchased(address indexed customer, uint price, string flight);

  constructor() public {
    owner = msg.sender;
    flights.push(Flight('Tokio', 4 ether));
    flights.push(Flight('Germany', 3 ether));
    flights.push(Flight('Madrid', 3 ether));
  }

  function buyFlight(uint flightIndex) public payable {
    Flight memory flight = flights[flightIndex];
    require(msg.value == flight.price);

    Customer storage customer = customers[msg.sender];
    customer.loyaltyPoints += 5;
    customer.totalFlights += 1;
    customerFlights[msg.sender].push(flight);
    customerTotalFlights[msg.sender] ++;
    emit FlightPurchased(msg.sender, flight.price, flight.name);
  }

  function totalFlights() public view returns (uint) {
    return flights.length;
  }

  function getRefundableEther() public view returns (uint) {
    return etherPerPoint * customers[msg.sender].loyaltyPoints;
  }

  function redeemLoyalPoints() public {
    Customer storage customer = customers[msg.sender];
    uint etherToRefound = etherPerPoint * customer.loyaltyPoints;
    msg.sender.transfer(etherToRefound);
    customer.loyaltyPoints = 0;
  }

  function getAirlineBalance() public isOwner view returns (uint) {
    return address(this).balance;
  }

  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

}

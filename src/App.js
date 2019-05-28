import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from "./airline";
import { AirlineService } from "./airlineService";
import { ToastContainer } from "react-toastr";

const converter = (web3) =>{
  return (value) => {
    return web3.utils.fromWei(value.toString(), 'ether');
  }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
          balance: 0,
          account: undefined,
          flights: [],
          customerFlights: [],
          refundableEther: 0
        };
    }

    async componentDidMount() {
      this.web3 = await getWeb3();
      this.toEther = converter(this.web3);
      this.airline = await AirlineContract(this.web3.currentProvider);
      this.airlineService =new AirlineService(this.airline);

      var account = (await this.web3.eth.getAccounts())[0];

      let flightPurchased = this.airline.FlightPurchased();
      flightPurchased.watch((err, result) => {

          const {customer, price, flight} = result.args;
          console.log(customer);
          if(customer === this.state.account) {
            console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
          } else {
            console.log(`Last customer purchased a flight to ${flight} with a const ${price}`);
            this.container.success(`Last customer purchased a flight to ${flight} with a const ${price}`, 'Flight information');
          }

      });

      this.web3.currentProvider.publicConfigStore.on('update', async (event) => {
        this.setState({
          account: event.selectedAddress.toLowerCase()
        }, () => {
          this.load();
        });
      })

      this.setState({
        account: account.toLowerCase()
      }, () => {
        this.load();
      });
    }

    async getBalance() {
      let weiBalance = await this.web3.eth.getBalance(this.state.account);
      this.setState({
        balance: this.toEther(weiBalance)
      });
    }

    async getFlights() {
      let flights = await this.airlineService.getFlights();
      this.setState({
          flights
      });
    }

    async getRefundableEther() {
      let refundableEther = this.toEther(await this.airlineService.getRefundableEther(this.state.account));
      this.setState({
        refundableEther
      });
    }

    async getCustomerFlights() {
      let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
      this.setState({
        customerFlights
      });
    }

    async buyFlight(flightIndex, flight) {

      await this.airlineService.buyFlight(
        flightIndex,
        this.state.account,
        flight.price
      );
    }

    async load() {
      this.getBalance();
      this.getFlights();
      this.getCustomerFlights();
      this.getRefundableEther();
    }

    async refundLoyaltyPoints() {
      await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }
    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                      <p><strong>Account:</strong> {this.state.account}</p>
                      <spam><strong>Balance:</strong> {this.state.balance}</spam>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <spam>{this.state.refundableEther} eth</spam>
                        <button className="btn btn-sm btn-success text-white" onClick={() => this.refundLoyaltyPoints()}>Refund</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                      {this.state.flights.map((flight, i) => {
                          return <div key={i}>
                                    <spam>{flight.name} - cost: {this.toEther(flight.price)} ethers</spam>
                                    <button className="btn btn-sm btn-success text-white" onClick={ () => this.buyFlight(i, flight) } >Purchase</button>
                                 </div>
                      })}

                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                      {this.state.customerFlights.map((flight, i) => {
                          return <div key={i}>
                                    {flight.name} - cost: {this.toEther(flight.price)}
                                 </div>
                      })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) =>  this.container = input}
              className="toast-top-right"></ToastContainer>
        </React.Fragment>
    }
}

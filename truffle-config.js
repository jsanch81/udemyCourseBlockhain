const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = 'include police immune quit goose boss horror fatigue agree sword allow satoshi';

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 5000000
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/d1dbc16ef0244972af13493915c1fa6e"),
      network_id: 4
    }
  }
}

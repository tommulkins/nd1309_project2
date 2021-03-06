import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function (message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function () {
    try {
      const { createStar } = this.meta.methods;
      const name = document.getElementById("starName").value;
      // Don't know what to do with this
      const symbol = document.getElementById("starSymbol").value;
      const id = document.getElementById("starId").value;
      await createStar(name, id).send({ from: this.account });
      App.setStatus("New Star Owner is " + this.account + ".");
    } catch (error) {
      console.error(error);
      App.setStatus(
        "Problem creating star. Try resetting your Metamask account."
      );
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function () {
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const id = parseInt(document.getElementById("lookid").value);

    if (Number.isNaN(id)) {
      App.setStatus("Must provide a valid number.");
      return;
    }

    try {
      const result = await lookUptokenIdToStarInfo(id).call({
        from: this.account,
      });
      App.setStatus(`Name: ${result}`);
    } catch (error) {
      console.error(error);
      App.setStatus("Star not found!");
    }
  },

  // Exchange stars
  exchangeStars: async function () {
    const { exchangeStars } = this.meta.methods;
    const starOne = parseInt(document.getElementById("exchangeStar1").value);
    const starTwo = parseInt(document.getElementById("exchangeStar2").value);

    if (Number.isNaN(starOne) || Number.isNaN(starTwo)) {
      App.setStatus("Must provide a valid number.");
      return;
    }

    try {
      const result = await exchangeStars(starOne, starTwo).send({
        from: this.account,
      });
      console.log(result);
      App.setStatus("The stars have been exchanged!");
    } catch (error) {
      console.error(error);
      App.setStatus(
        error.message
          ? "You don't own either star and so I can't transfer them."
          : "Encountered a problem"
      );
    }
  },
  // Transfer stars
  transferStar: async function () {
    const { transferStar } = this.meta.methods;
    const id = parseInt(document.getElementById("transferId").value);
    const toAddress = document.getElementById("toAddress").value.trim();

    if (Number.isNaN(id)) {
      App.setStatus("Must provide a valid number.");
      return;
    }

    try {
      const result = await transferStar(toAddress, id).send({
        from: this.account,
      });
      console.log(result);
      App.setStatus("The star has been transferred!");
    } catch (error) {
      console.error(error);
      App.setStatus(
        error.message
          ? "You don't own that star or the wallet address is invalid.  Please check and try again."
          : "Encountered a problem"
      );
    }
  },
};

window.App = App;

window.addEventListener("load", async function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live"
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:9545")
    );
  }

  App.start();
});

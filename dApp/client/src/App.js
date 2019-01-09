import React, { Component } from "react";
import SimpleStorageContract from "./SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import ipfs from './ipfs.js'

import "./App.css";
//<img src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`} alt=""/>
class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      ipfsHash: '',
      web3: null,
      buffer: null,
      accounts: null,
      contract: null,
      hashesCount: 0
    }
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.changeIPFSHash = this.changeIPFSHash.bind(this);

  }


  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ ipfsHash: response });

    const cuenta = await contract.methods.hashesCount().call();

    this.setState({ hashesCount: cuenta})

    var l = document.getElementById('listaH');
    for (var i = 1; i <= this.state.hashesCount; i++) {
      contract.methods.listaHashes(i).call(function(err, res){
          //do something with res here
            //for example

            console.log(res);
            var listaTemplate =  "<option>"+res+"</option>";
            l.innerHTML += listaTemplate;

      });
    }

  };

  captureFile(event){
    console.log("Capture file...")
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit(event){

    const { accounts, contract } = this.state;

    event.preventDefault()
    console.log("on submit...");
    ipfs.files.add(this.state.buffer, (error, result) => {
          if(error) {
            console.error(error)
            return
          }

          contract.methods.set(result[0].hash).send({ from: accounts[0] });
          contract.methods.addHash(result[0].hash).send({ from: accounts[0] });



          this.setState({ ipfsHash: result[0].hash })
          console.log('ifpsHash', this.state.ipfsHash)
    })

  }

  changeIPFSHash(event){
    var e = document.getElementById("listaH");
    var strUser = e.options[e.selectedIndex].text;
    this.setState({ ipfsHash :strUser })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">IPFS File Upload DApp</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Your File</h1>
              <p>This file is stored on IPFS & The Ethereum Blockchain!</p>


              <form onSubmit = {this.changeIPFSHash} action = {`https://ipfs.io/ipfs/${this.state.ipfsHash}`} target="_blank">
                <select id="listaH">

                </select>

                <input type="submit"/>

              </form>
              <h3>Last IPFS Hash: {this.state.ipfsHash}</h3>
              <h2>Upload File</h2>
              <form onSubmit={this.onSubmit} >
                <input type='file' onChange={this.captureFile} />
                <input type='submit'/>
              </form>

            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App;

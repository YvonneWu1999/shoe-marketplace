import React, { Component } from 'react';

import './App.css';
import Web3 from 'web3';
import '@metamask/legacy-web3';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar';
import Main from './Main';
class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  async loadWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
      } catch (error) {
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    if (Marketplace.networks[networkId]) {
      const marketplace = web3.eth.Contract(Marketplace.abi, Marketplace.networks[networkId].address)
      this.setState({ marketplace })

      const shoeCount = await marketplace.methods.shoeCount().call()
      this.setState({ shoeCount })
      //fetch all shoes
      for (let i = 1; i <= shoeCount; i++) {
        const shoe = await marketplace.methods.shoes(i).call()
        console.log(shoe)
        this.setState({
          shoes: [...this.state.shoes, shoe]
        })

      }
      this.setState({ loading: false })
    } else {
      window.alert('Marketplace contract not deployed to detected network!')
    }



  }
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      shoeCount: 0,
      shoes: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  createProduct(name, price) {
    this.setState({ loading: true })
    console.log(this.state.account)
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account }, (error, transactionHash) => {
      if (error) {
        window.alert('transaction failed!')
        this.setState({ loading: false })
      } else {
        console.log(transactionHash)
        let count = parseInt(this.state.shoeCount) + 1
        this.setState({ shoeCount: count })
        let shoe = { id: count, price, name, owner: this.state.account, purchased: false }
        this.setState({
          shoes: [...this.state.shoes, shoe]
        })
        this.setState({ loading: false })
      }
    })
  }
  purchaseProduct(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price }, (error, transactionHash) => {
      if (error) {
        console.log(error)
        window.alert('transaction failed!')
        this.setState({ loading: false })
      } else {
        console.log(transactionHash)
        let items = [...this.state.shoes]
        let item = { ...items[id - 1] }
        if (item.owner === this.state.account) {
          window.alert('transaction failed! SELLERS CANNOT BUY THEIR OWN STUFF!')
          this.setState({ loading: false })
        } else {
          item.owner = this.state.account
          item.purchased = true
          items[id - 1] = item
          this.setState({ shoes: items })
          this.setState({ loading: false })
        }

      }
    })
  }



  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div >
            {/* <main role="main" className="col-lg-12 d-flex"> */}
            <main role="main" className="col-lg-12 ">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  shoes={this.state.shoes}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} />}
            </main>
          </div>

        </div>
      </div>
    );
  }
}

export default App;

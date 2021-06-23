import React, { Component } from 'react';

class Main extends Component {
    constructor() {
        super();
        this.state = {
            n: '',
            p: '',
        };
    }
    handleNChange = (evt) => {
        this.setState({ n: evt.target.value });
    }

    handlePChange = (evt) => {
        this.setState({ p: evt.target.value });
    }
    render() {
        const { n, p } = this.state;
        const enabled =
            n.length > 0 &&
            p.length > 0;
        return (

            <div id="content">
                <h1>Add shoes</h1>
                <form onSubmit={(e) => {
                    console.log('hi')

                    e.preventDefault()
                    const name = this.shoeName.value
                    const price = window.web3.utils.toWei(this.shoePrice.value.toString(), 'Ether')
                    console.log(name, price)
                    this.props.createProduct(name, price)
                }}>
                    <div className="row">
                        <div className="col sm-4">
                            <div className="form-group">
                                <label htmlFor="paperInputs1">Name</label>
                                <input className="input-block" value={this.state.n} onChange={this.handleNChange} type="text" id="paperInputs1" ref={(input) => { this.shoeName = input }} />
                            </div>
                        </div>
                        <div className="col sm-8">
                            <div className="form-group">
                                <label htmlFor="paperInputs2">Price ETH</label>
                                <input className="input-block" value={this.state.p} onChange={this.handlePChange} type="text" id="paperInputs2" ref={(input) => { this.shoePrice = input }} />
                            </div>
                        </div>

                        <button disabled={!enabled} className="btn-secondary-outline">Add</button>
                    </div>
                </form>
                <h1>shoes</h1>

                <div id="cardlist" className="row  row-cols-4 d-flex ">
                    {this.props.shoes.map((shoe, key) => {
                        let source = "https://source.unsplash.com/900x900/?" + shoe.name + ",shoe"
                        return (
                            <div key={key} className="px-md-2" >
                                <div className="card" style={{ width: '15rem' }}>
                                    <img src={source} alt="shoe" />
                                    <div className="card-body">
                                        <h4 className="card-title">{shoe.name}</h4>
                                        <h5 className="card-subtitle">shoeId {shoe.id.toString()}</h5>
                                        <p className="card-text">owner {shoe.owner}</p>
                                        <p className="card-text">price {window.web3.utils.fromWei(shoe.price.toString(), 'Ether')} ETH</p>

                                        {!shoe.purchased
                                            ? <button
                                                name={shoe.id}
                                                value={shoe.price}
                                                onClick={(e) => {
                                                    console.log('click!')
                                                    this.props.purchaseProduct(e.target.name, e.target.value)
                                                }}>Buy!</button>
                                            : null
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}


                </div>
            </div>

        );
    }
}

export default Main;
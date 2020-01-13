import React, {Component} from 'react'
import Web3 from 'web3'
import {KICKSTARTER_ABI, KICKSTARTER_ADDRESS} from './config'
import './App.css'
import moment from "moment";

class App extends Component {
    componentDidMount() {
        this.loadBlockchainData()
    }

    async loadAccountData(account) {
        const isOwner = await this.state.kickstarter.methods.isOwner().call(null, {
            from: account
        })

        let canClaim = null;
        let pledgedAmount = null;

        if (isOwner) {
            canClaim = await this.state.kickstarter.methods.canClaim().call(null, {
                from: account
            })
        } else {
            pledgedAmount = await this.state.kickstarter.methods.pledgeOf(account).call(null, {
                from: account
            })
        }

        this.setState({
            currentAccountData: {
                isOwner,
                canClaim,
                pledgedAmount
            }
        })
    }

    async login() {
        await this.loadAccountData(this.state.currentAccountAddress)
    }

    async logout() {
        this.setState({
            currentAccountData: null
        })
    }

    async claimFunds() {
        try {
            await this.state.kickstarter.methods.claimFunds().send({
                from: this.state.currentAccountAddress,
            })

            await this.loadBlockchainData()
            await this.loadAccountData(this.state.currentAccountAddress)
        } catch (e) {
            console.error(e)
            alert('Operation failed')
        }
    }
    async pledge() {
        try {
            await this.state.kickstarter.methods.pledge(this.state.pledgeValue).send({
                from: this.state.currentAccountAddress,
                value: this.state.pledgeValue
            })

            await this.loadBlockchainData()
            await this.loadAccountData(this.state.currentAccountAddress)

            this.setState({
                pledgeValue: ""
            })
        } catch (e) {
            console.error(e)
            alert('Operation failed')
        }
    }

    async refund() {
        try {
            await this.state.kickstarter.methods.getRefund().send({
                from: this.state.currentAccountAddress
            })

            await this.loadBlockchainData()
            await this.loadAccountData(this.state.currentAccountAddress)
        }
        catch (e) {
            console.error(e)
            alert("Operation failed")
        }
    }

    async loadBlockchainData() {
        const web3 = new Web3("http://localhost:7545")
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})
        const kickstarter = new web3.eth.Contract(KICKSTARTER_ABI, KICKSTARTER_ADDRESS)
        let deadline = await kickstarter.methods.deadline().call()

        if (deadline) {
            deadline = moment.unix(deadline).format("YYYY-MM-DD HH:mm:ss")
        }
        let goal = await kickstarter.methods.goal().call()
        goal = parseInt(goal)
        let raised = await kickstarter.methods.getCurrentRaisedBalance().call()
        raised = parseInt(raised)

        this.setState({
            kickstarter,
            deadline,
            goal,
            raised
        })
    }

    handleAccountFieldChange(event) {
        this.setState({currentAccountAddress: event.target.value});
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            deadline: '',
            raised: '',
            goal: '',
            currentAccountAddress: '',
            currentAccountData: null,
            pledgeValue: ""
        }

        this.handleAccountFieldChange = this.handleAccountFieldChange.bind(this)
        this.login = this.login.bind(this)
        this.loadAccountData = this.loadAccountData.bind(this)
        this.logout = this.logout.bind(this)
        this.pledge = this.pledge.bind(this)
        this.refund = this.refund.bind(this)
        this.claimFunds = this.claimFunds.bind(this)
    }

    render() {
        const LoginForm =  <div><h1>Enter account ID:</h1>
            <div className="form-group">
            <input className="form-control" value={this.state.currentAccountAddress} onChange={this.handleAccountFieldChange} type="text"/>
            </div>
        <div className="form-group">
            <input className="btn btn-primary" value="Login"  onClick={this.login} type="button"/>
        </div>
        </div>

        let LoggedInView = null
        let PledgeView = null
        let ClaimView = null
        let ActionView = null
        let RefundView = null


        if (this.state.currentAccountAddress && this.state.currentAccountData !== null) {

            LoggedInView = <div>
                <h1>Current user: {this.state.currentAccountAddress}</h1>
                <div className="form-group">
                    <input type="button" value="Logout" onClick={this.logout} className="btn btn-danger"/>
                </div>
            </div>

            ClaimView = <div>
                <div className="form-group">
                    <button className="btn btn-primary" value="Claim funds" onClick={this.claimFunds}/>
                </div>
            </div>

            PledgeView = <div>
                <h3>Currently pledged for this campaign: {this.state.currentAccountData.pledgedAmount}</h3>
                <div className="form-group">
                    <input type="text" value={this.state.pledgeValue} onChange={(e) => {
                        this.setState({pledgeValue: e.target.value})
                    }} className="form-control"/>
                </div>

                <div className="form-group">
                    <button className="btn btn-danger" onClick={this.pledge}>Pledge</button>
                </div>
            </div>

            RefundView = <div>
                <h3>You pledged {this.state.currentAccountData.pledgedAmount} but campaign failed.</h3>

                <div className="form-group">
                    <button className="btn btn-danger" onClick={this.refund}>Refund</button>
                </div>
            </div>


            const deadline = moment(this.state.deadline)
            const deadlinePassed = moment().isAfter(deadline)

            if (this.state.currentAccountData.isOwner && deadlinePassed && this.state.raised >= this.state.goal) {
                ActionView = ClaimView
            } else if(! this.state.currentAccountData.isOwner) {
                if (deadlinePassed && this.state.raised < this.state.goal) {
                    ActionView = RefundView
                }
                else {
                    ActionView = PledgeView
                }

            }
        }


        return (
            <div>
                <nav className="navbar navbar-dark bg-dark flex-md-nowrap p-0 shadow">
                    <a className="navbar-brand col-sm-3 col-md-2 mr-0"
                       href="http://www.dappuniversity.com/free-download" target="_blank">Kickstarter</a>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                            <small><a className="nav-link" href="#"><span id="account"></span></a></small>
                        </li>
                    </ul>
                </nav>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-6">
                            <h1>Smart-contract kickstarter: {`${this.state.raised}/${this.state.goal}`}</h1>
                            <h2>Deadline: {this.state.deadline}</h2>

                            {ActionView}

                        </div>

                        <div className="col-md-6">
                            {this.state.currentAccountData === null ? LoginForm : LoggedInView}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
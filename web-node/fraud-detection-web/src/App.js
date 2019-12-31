import React, { Component } from 'react';
import './App.css';

import Pages1 from './components/pages1.jsx';
import Pages2 from './components/pages2.jsx';
import Pages3 from './components/pages3.jsx';
import Pages4 from './components/pages4.jsx';
import Pages5 from './components/pages5.jsx';
// import Fullpage from './components/fullpage.jsx';
import JSONP from 'browser-jsonp';

const data = new Array(10).fill(0).reduce((prev, curr) => [...prev, {
  x: prev.slice(-1)[0].x + 1,
  y: prev.slice(-1)[0].y * (1 + Math.random())
}], [{ x: 0, y: 10 }])

// Root element
// TODO: setup routing ?
class App extends Component {

  constructor(props) {
    super(props);
    this.curSection = 1;
    this.state = {
      num: 0, // total # of swipes
      frauds: 0,  // detected frauds
      busiestStations: data, // busiest stations
      busiestStationsHistory: data,
      avgWaits: [], // the average wait times
      rate: 50.00,
      isHistory: false,
      isStart: true,
      show: true,
      historynum: 100,
      from: 0,
      to:1
    };
    this.handleHistory = this.handleHistory.bind(this);
    this.handleCurrent = this.handleCurrent.bind(this);
    // Update the data
    setInterval(() => {
      // Get the total number of swipes
      JSONP({
        url: 'http://123.57.234.203:8080/api/1.0/',
        data: { Procedure: '@AdHoc', Parameters: "['select count(*) from activity']" },
        success: (data) => {
          this.setState({ num: data.results[0].data[0][0] });
        },
        error: (err) => { console.log(err); },
        callbackName: 'jsonp' // Important !
      });

      // Get the card swipe acceptance rate
      JSONP({
        url: 'http://123.57.234.203:8080/api/1.0/',
        data: { Procedure: 'GetCardAcceptanceRate' },
        success: (data) => {
          this.setState({ frauds: data.results[0].data[0][0] });
        },
        error: (err) => { console.log(err); },
        callbackName: 'jsonp' // Important !
      });

      // Get the swipes for the busiest stations
      JSONP({
        url: 'http://123.57.234.203:8080/api/1.0/',
        data: { Procedure: 'GetBusiestStationInLastMinute' },
        success: (data) => {
          let newData = data.results[0].data;
          newData = newData.map((v, i, arr) => {
            let r = {};
            r.x = v[0];
            r.y = v[1];
            return r;
          });

          this.setState({
            busiestStations: newData
          });
        },
        error: (err) => { console.log(err); },
        callbackName: 'jsonp' // Important !
      });

      JSONP({
          url: 'http://123.57.234.203:8080/api/1.0/',
          data: { Procedure: 'GetBusiestStation' },
          success: (data) => {
            let newData = data.results[0].data;
            newData = newData.map((v, i, arr) => {
              let r = {};
              r.x = v[0];
              r.y = v[1];
              return r;
            });

            this.setState({
              busiestStationsHistory: newData
            });
          },
          error: (err) => { console.log(err); },
          callbackName: 'jsonp' // Important !
        });

      JSONP({
        url: 'http://123.57.234.203:8080/api/1.0/',
        data: { Procedure: 'UpdateWaitTime' , Parameters: "[ '9000' ]" },
        error: (err) => { console.log(err); },
        callbackName: 'jsonp' // Important !
      });
      //delete the repetitive request by dhx
      // Get the info for avg waiting time
      JSONP({
        url: 'http://123.57.234.203:8080/api/1.0/',
        data: { Procedure: 'GetStationWaitTime' },
        success: (data) => {
          let newData = data.results[0].data;
          newData = newData.map((v, i, arr) => {
            let r = {};
            r.x = v[0];
            r.y = v[1] === 0 ? 0 : v[1] / v[2];
            return r;
          });

          this.setState({
            avgWaits: newData
          });
        },
        error: (err) => { console.log(err); },
        callbackName: 'jsonp' // Important !
      });
      
    }, 2000);

    // Update the data
    setInterval(() => {
        if (this.curSection > 4) this.curSection = 0;
        this.curSection = this.curSection + 1;
    }, 9000);
   
    setInterval(() => {
    	console.log('ddddddddddddddddddddddddddddd');
    	 if (this.isHistory){
    		 console.log('WWWWWWWWWWWWWWWWWWWW');
	        	JSONP({
	        		url: 'http://123.57.234.203:8080/api/1.0/',
	        		data: { Procedure: 'GetActivityHistory' , Parameters: ['ACTIVITY',15,'hour',this.currentnum,this.historynum] },
	        		error: (err) => { console.log(err); },
	        		callbackName: 'jsonp' // Important !
	        	});
	        }}, 9000);
    }
  handleHistory() {
      JSONP({
          url: 'http://123.57.234.203:8080/api/1.0/',
          data: { Procedure: '@AdHoc', Parameters: "['alter table activity using ttl 1 hours ON COLUMN date_now MIGRATE TO TARGET oldactivity;']" },
          error: (err) => { console.log(err); },
          callbackName: 'jsonp' // Important !
        });
      
      
//      JSONP({
//          url: 'http://123.57.234.203:8080/api/1.0/',
//          data: { Procedure: 'GetActivityHistory' , Parameters: "[ 'ACTIVITY',100,1,'hour' ]" },
//          error: (err) => { console.log(err); },
//          callbackName: 'jsonp' // Important !
//        });
	    this.setState({isStart: false,isHistory: true});
		console.log(this.state.isStart);
		console.log(this.state.isHistory);
		console.log(this.state.num);
	  }
  handleCurrent() {
	  	this.setState({isStart: false,isHistory: false});
	      JSONP({
	          url: 'http://123.57.234.203:8080/api/1.0/',
	          data: { Procedure: '@AdHoc', Parameters: "['alter table activity using ttl 2 minutes ON COLUMN date_now MIGRATE TO TARGET oldactivity;']" },
	          error: (err) => { console.log(err); },
	          callbackName: 'jsonp' // Important !
	        });
		console.log(this.state.isStart);
		console.log(this.state.isHistory);
		console.log(this.state.num);
	  }
  render() {    
    if (this.state.isStart) {
	    return (
	      <div>
		      <button onClick={this.handleHistory}>
		      {'显示历史数据'}
		      </button>
		      <button onClick={this.handleCurrent}>
		      {'显示当前数据'}
		      </button>
	      </div>
      );  
    } else if (!this.state.isHistory && this.curSection === 1 ) {
        return (
	      <div>
          	<Pages1 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStations} avgWaits={this.state.avgWaits} theme={'car'} />
	      </div>);
    } else if (!this.state.isHistory && this.curSection === 2) {
        return (
      <div>
            <Pages2 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStations} avgWaits={this.state.avgWaits} theme={'car'} />
      </div>);
    } else if (!this.state.isHistory && this.curSection === 3) {
        return (
      <div>
            <Pages3 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStations} avgWaits={this.state.avgWaits} theme={'car'} />
      </div>);
    } else if (!this.state.isHistory && this.curSection === 4) {
        return (
      <div>
            <Pages4 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStations} avgWaits={this.state.avgWaits} theme={'car'} />
      </div>);
    }else if (this.state.isHistory && this.curSection === 1 ) {
        return (
      	      <div>
                	<Pages5 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStationsHistory} avgWaits={this.state.avgWaits} theme={'car'} />
      	      </div>);
    }
//    else if (this.state.isHistory && this.curSection === 2) {
//	      return (
//	    <div>
//	          <Pages5 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStationsHistory} avgWaits={this.state.avgWaits} theme={'car'} />
//	    </div>);
//	  } else if (this.state.isHistory && this.curSection === 3) {
//	      return (
//	    <div>
//	          <Pages5 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStationsHistory} avgWaits={this.state.avgWaits} theme={'car'} />
//	    </div>);
//	  } else if (this.state.isHistory && this.curSection === 4) {
//	      return (
//	    <div>
//	          <Pages5 num={this.state.num} rate={this.state.rate} busiestStations={this.state.busiestStationsHistory} avgWaits={this.state.avgWaits} theme={'car'} />
//	    </div>);
//	  }
	  else {
	    return (
	  	      <div>
	  		      <button onClick={this.handleHistory}>
	  		        {'显示历史数据'}
	  		      </button>
	  		      <button onClick={this.handleCurrent}>
	  		        {'显示当前数据'}
	  		      </button>
	  	      </div>
	        );         
    }
  }
}

export default App;

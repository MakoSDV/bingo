import React from 'react';
import ReactDOM from 'react-dom';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {Route, HashRouter as Router} from 'react-router-dom'

import './styles.css';
import App from './App'
import Bingo from './bingo'
//import CocoSpeed from './CocoSpeed';

const routes = (
  <Router>
    <div>
      <Route exact path='/' component={App} />
      <Route path='/bingo' component={Bingo} />
      <Route path='/CocoSpeed' render={() => (<Bingo title='CocoConfession Speedrun Chat Bingo' dataset='Speedrun'/>)} />
      <Route path='/Test' render={() =>(<Bingo title='Test' dataset='Test'/>)} />
    </div>
  </Router>
);
ReactDOM.render(routes, document.getElementById('root'));
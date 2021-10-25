import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import {Route, HashRouter as Router} from 'react-router-dom'
import App from './App'
import Bingo from './bingo'
import CocoSpeed from './CocoSpeed';

const routes = (
  <Router>
    <div>
      <Route exact path='/' component={App} />
      <Route path='/bingo' component={Bingo} />
      <Route path='/CocoSpeed' component={CocoSpeed} />
    </div>
  </Router>
);
ReactDOM.render(routes, document.getElementById('root'));
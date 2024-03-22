import React from 'react';
import ReactDOM from 'react-dom';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {Route, HashRouter as Router} from 'react-router-dom'

import './styles.css';
import App from './App'
import Bingo from './bingo'

const routes = (
  <Router>
    <div>
      <Route exact path='/' component={App} />
      <Route path='/bingo' component={Bingo} />
      <Route path='/CocoSpeed' render={() => (<Bingo title='CocoConfession Speedrun Chat Bingo' dataset='Speedrun'/>)} />
      <Route path='/Test' render={() =>(<Bingo title='Test' dataset='Test'/>)} />
      <Route path='/8bitDee' render={() => (<Bingo title='DEESMAS Stream Bingo' dataset='8bitDee'/>)} />
      <Route path='/CocoCrazyCastle' render={() => (<Bingo title='CocoConfession Crazy Castle Bingo' dataset='BBCC2'/>)} />
    </div>
  </Router>
);
ReactDOM.render(routes, document.getElementById('root'));
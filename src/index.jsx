import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import "./styles.css";
import App from "./App";
import Bingo from "./bingo";

const routes = (
  <Router>
    <Routes>
      <Route exact path="/" element={<App />} />
      <Route path="/bingo" element={<Bingo />} />
      <Route
        path="/CocoSpeed"
        element={
          <Bingo
            title="CocoConfession Speedrun Chat Bingo"
            dataset="Speedrun"
          />
        }
      />
      <Route
        path="/Test"
        element={
          <Bingo
            title="Test"
            gsId="1CgR0v768DOLFzPdsVo5o8bnHO4D0-AIfpXGdoRKBldw"
            dataset="Test"
          />
        }
      />
      <Route
        path="/8bitDee"
        element={<Bingo title="DEESMAS Stream Bingo" dataset="8bitDee" />}
      />
      <Route
        path="/CocoCrazyCastle"
        element={
          <Bingo title="CocoConfession Crazy Castle Bingo" dataset="BBCC2" />
        }
      />
    </Routes>
  </Router>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(routes);

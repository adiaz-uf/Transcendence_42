import React, { useState, useEffect} from "react";

const Menu = ({ onGameModeSelect }) => {
  return (
    <div className="menu-container">
          <h1>Pooooiiiinngg</h1>
          <button onClick={() => onGameModeSelect("local")}>Local Game (2P)</button>
          <button onClick={() => onGameModeSelect("online")} disabled>Online Game (Comming soon..)</button>
    </div>
  );
};
export default Menu;



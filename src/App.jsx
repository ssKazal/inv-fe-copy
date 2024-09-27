import "./App.css";
import React from "react";
import { useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./redux/Store.js";
import { AllPages } from "./routes.jsx";

const App = () => {
  const all_pages = useRoutes(AllPages);

  return (
    <>
      <Provider store={Store}>{all_pages}</Provider>
    </>
  );
};

export default App;

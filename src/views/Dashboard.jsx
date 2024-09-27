import React, { useRef } from "react";
import Copyright from "../components/Copyright";
import NavBar from "../components/NavBar";
import Goods from "../components/Goods";

function Dashboard() {
  const ref = useRef();
  return (
    <>
      <div className="app" ref={ref}>
        <div>
          <NavBar />
          <Goods contentRef={ref} />
        </div>
        <Copyright sx={{ mt: 4, mb: 4 }} />
      </div>
    </>
  );
}

export default Dashboard;

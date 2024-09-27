import React, { useRef } from "react";
import Copyright from "../components/Copyright";
import NavBar from "../components/NavBar";
import HowToUseContent from "../components/HowToUseContent";

function HowToUse() {
  const ref = useRef();
  return (
    <>
      <div className="app" ref={ref}>
        <div>
          <NavBar />
          <HowToUseContent />
        </div>
        <Copyright sx={{ mt: 4, mb: 4 }} />
      </div>
    </>
  );
}

export default HowToUse;

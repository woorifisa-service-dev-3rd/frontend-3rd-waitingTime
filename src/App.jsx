import "./App.css";
import MainPage from "./components/MainPage";
import { useMediaQuery } from "react-responsive";
import SidePage from "./components/SidePage";
import { useState, useEffect } from "react";
import { MainContext } from "./contexts/PageContexts";

function App() {
  const isLargeScreen = useMediaQuery({ query: "(min-width: 700px)" });
  const [clickedButtonName, setClickedButtonName] = useState("기업은행");

  return (
    <>
      <MainContext.Provider value={{ clickedButtonName, setClickedButtonName }}>
        <div
          className={`${
            isLargeScreen
              ? `main-page-large h-screen  bg-[url('./assets/w1.jpg')] bg-cover bg-center`
              : `main-page-small`
          } h-screen`}
        >
          {isLargeScreen ? (
            <div className={`flex justify-center h-[100%] w-[100%]`}>
              <div className="flex items-center mr-20">
                <SidePage />
              </div>
              <MainPage className="w-[40%]" />
            </div>
          ) : (
            <MainPage className="flex justify-center" />
          )}
        </div>
      </MainContext.Provider>
    </>
  );
}

export default App;

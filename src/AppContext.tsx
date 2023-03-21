import React, { useState } from "react";

// we are going to use basic React Contexts to manage shared state
export const AppContext = React.createContext({} as any);

export const AppContextProvider = (props:any) => {
  // create our state in the usual fashion
  const [isLoading, setIsLoading] = useState(false);

  // expose our state via a Context wrapper
  return (
    <AppContext.Provider value={{ isLoading, setIsLoading }}>
      {props.children}
    </AppContext.Provider >
  )
}

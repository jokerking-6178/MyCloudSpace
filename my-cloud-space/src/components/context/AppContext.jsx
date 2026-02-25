import { createContext, useEffect, useState } from "react";

export const AppContext =  createContext(null)

export const AppContextProvider = (props) => {
    const [authToken, setAuthToken] = useState("")
    const [userData, setUserData] = useState({})

    useEffect(() => {
        
    })


    const contextValue = {
        authToken,
        setAuthToken,
        userData,
        setUserData,
        
    }
    return <AppContext.Provider value={contextValue}>
        {props.children}
    </AppContext.Provider>
}


import React, { useState, createContext } from 'react'

export const ScannerContext = createContext({
    temScanner: true,
    setTemScanner: (a: boolean) => {},
})

export const ScannerProvider = ({ children }) => {
    const [temScanner, setTemScanner] = useState<boolean>(false)

    const val = {
        temScanner: temScanner,
        setTemScanner: (a: boolean) => setTemScanner(a),
    }

    return <ScannerContext.Provider value={val}>{children}</ScannerContext.Provider>
}

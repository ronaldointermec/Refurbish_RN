import React from 'react'
import { StatusBar } from 'react-native'
import Routes from './src/routes/index'
import Reducer from './src/store/reducer'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { ScannerProvider } from './src/context/scanner'
import { RefurbshProvider } from './src/context/refurbshContext'

export default function App() {
    const store = createStore(Reducer)

    return (
        <>
            <ScannerProvider>
                <RefurbshProvider>
                    <Provider store={store}>
                        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                        <Routes />
                    </Provider>
                </RefurbshProvider>
            </ScannerProvider>
        </>
    )
}

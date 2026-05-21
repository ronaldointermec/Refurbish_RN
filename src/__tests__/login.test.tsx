import React from 'react'
import { render } from '@testing-library/react-native'
import { NavigationContext } from '@react-navigation/native'
import Login from '../main/login'

jest.mock('react-redux', () => {
    return {
        useDispatch: jest.fn(),
        useSelector: jest.fn().mockReturnValue({
            read: '',
            buttonScanner: false,
            scannerMock: false,
        }),
    }
})
const navContext = {
    isFocused: () => true,
    addListener: jest.fn(() => jest.fn()),
}

describe('Login', () => {
    it('O login está correga?', async () => {
        const test = render(
            <NavigationContext.Provider value={navContext}>
                <Login />
            </NavigationContext.Provider>
        )
        expect(test).toMatchSnapshot()
    })
})

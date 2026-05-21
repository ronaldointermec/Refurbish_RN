import React from 'react'
import { NavigationContext } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import { getRespostaAPI } from './mockAPI'
import { Login } from '../services/api'

/*
//Exemplo de mock de modulo incompativel
jest.mock('react-native-fs', () => {
  return {
    readFile: jest.fn(),
  };
});
*/

//Mock do react-navigation​​​​​​​
const navContext = {
    isFocused: () => true,
    addListener: jest.fn(() => jest.fn()),
}

//Mock de chamada de API
const api = require('../services/api')
api.foo = jest.fn(() => {
    return {
        data: 'Resposta',
        status: 200,
    }
})
/*
//Mock do Scanner
jest.mock('../Helpers/Scanner/HoneywellScanner', () => {
  return jest.fn().mockImplementation(() => {
    return {
      stopReader: jest.fn(),
    };
  });
});
*/

describe('Teste de API', () => {
    it('Login', async () => {
        let usuario = 'USR'
        let rMock = getRespostaAPI('Usuario', usuario)
        let rAPI = await Login(usuario)

        expect(rAPI).toEqual(rMock)
    })
})

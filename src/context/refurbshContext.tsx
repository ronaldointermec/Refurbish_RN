import React, { useState, createContext } from 'react'
import { Usuario } from '../models/usuario'

export const RefurbshContext = createContext({
    usuario: new Usuario(),
    setUsuario: (a: Usuario) => {},
    ipImpressora: '',
    setIpImpressora: (a: string) => {},
})

export const RefurbshProvider = ({ children }) => {
    const [usuario, setUsuario] = useState<Usuario>(new Usuario())
    const [ipImpressora, setIpImpressora] = useState<string>('')

    const val = {
        usuario: usuario,
        setUsuario: (a: Usuario) => setUsuario(a),
        ipImpressora: ipImpressora,
        setIpImpressora: (a: string) => setIpImpressora(a),
    }
    return <RefurbshContext.Provider value={val}>{children}</RefurbshContext.Provider>
}

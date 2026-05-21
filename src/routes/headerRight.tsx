import React, { useContext } from 'react'
import { View, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import pkg from '../../package.json'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch } from 'react-redux'
import { ScannerContext } from '../context/scanner'
import Icon from 'react-native-vector-icons/FontAwesome'

/*
-- HeaderRight para ser usado nos routes

Para adicionar mais botões, basta adicionar mais condições
value=='NovoBotao' depois dos ':' e seguir adiante

Suportados no momento:
- Printer

*/
const HeaderRight = (props) => {
    const ctxLogin = useContext(ScannerContext)

    const dispatch = useDispatch()
    let buttons: string[] = props.buttons == null ? [] : props.buttons

    if (buttons.length < 1) buttons = ['x', 'x'].concat(buttons)
    else if (buttons.length < 2) buttons = ['x'].concat(buttons)

    return (
        <View style={{ width: buttons.length * 35, height: '100%', flexDirection: 'column' }}>
            <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 10, textAlign: 'center' }}>Versão</Text>
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
                {buttons.map((value, index) => (
                    <View style={{ flex: 1 }} key={index}>
                        {value == 'Scanner' && !ctxLogin.temScanner ? (
                            <RectButton
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                                hitSlop={{ top: 1, bottom: 1, left: 10, right: 10 }}
                                onPress={() => {
                                    dispatch({ type: 'SCANNERMOCK', scannerMock: true })
                                }}
                            >
                                <Icon
                                    name="crosshairs"
                                    size={20}
                                    style={{ flex: 1, color: '#FFF', alignItems: 'center', justifyContent: 'center' }}
                                />
                            </RectButton>
                        ) : (
                            <View></View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    )
}

export default HeaderRight

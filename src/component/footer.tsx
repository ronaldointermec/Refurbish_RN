import React from 'react'
import style from '../styles/styles'
import { View, Text, Image } from 'react-native'
import pkg from '../../package.json'

const Footer = () => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 2, justifyContent: 'center' }}>
                <Text style={style.versao}>Versão: {pkg.version}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={style.honeywellLogo} />
            </View>
        </View>
    )
}

export default Footer

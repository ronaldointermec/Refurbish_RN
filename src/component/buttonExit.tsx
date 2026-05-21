import React from 'react'
import { Alert, BackHandler, Pressable, Text, Touchable } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import style, { COLOR } from '../styles/styles'

const ButtonExit = (props) => {
    function sair() {
        Alert.alert('Confirma', 'Tem certeza que deseja sair?', [
            {
                text: 'Sim',
                onPress: () => {
                    BackHandler.exitApp()
                },
            },
            { text: 'Não' },
        ])
    }

    return (
        <Pressable
            disabled={props.disabled}
            onPress={() => sair()}
            hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
            android_ripple={{ color: COLOR.main }}
            style={[style.buttonExit, { flex: 1 }]}
        >
            <Icon name="close" size={20} style={{ color: COLOR.secondary }} />
        </Pressable>
    )
}

export default ButtonExit

/*
<RectButton style={{flex:1, alignItems: 'center', justifyContent:'center'}}
hitSlop={{ top: 1, bottom: 1, left: 10, right: 10 }} onPress={() => sair() } >
<Icon name="close" size={20} style={{color:COLOR.defaultBackground}} />
</RectButton> 

*/

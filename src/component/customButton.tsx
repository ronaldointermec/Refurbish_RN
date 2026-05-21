import React from 'react'
import { Pressable, Text, Touchable } from 'react-native'
import style, { COLOR } from '../styles/styles'

const CustomButton = (props) => {
    return (
        <Pressable
            disabled={props.disabled}
            onPress={props.onPressFunction}
            hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
            android_ripple={{ color: COLOR.main }}
            style={[props.disabled ? style.buttonDisabled : style.button, { flex: 1 }]}
        >
            <Text style={style.buttonText}>{props.title}</Text>
        </Pressable>
    )
}

export default CustomButton

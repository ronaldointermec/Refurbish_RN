import React, { useEffect, useRef } from 'react'
import { View, TextInput, Text } from 'react-native'
import style from '../styles/styles'

const CustomInput = (props) => {
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        if (props.focus == true)
            setTimeout(() => {
                console.log('SETANDO PRA CHAMAR O TECLADO!')
                inputRef.current?.blur()
                inputRef.current?.focus()
            }, 1000)
    }, [props.focus])

    return (
        <TextInput
            autoFocus={props.autoFocus}
            placeholder={props.placeholder}
            style={style.textInput}
            value={props.value}
            onChangeText={props.onChangeText}
            onEndEditing={props.onEndEditing}
            onSubmitEditing={props.onSubmitEditing}
            onTouchEnd={props.onTouchEnd}
            editable={props.editable}
            keyboardType={props.keyboardType}
            ref={inputRef}
        />
    )
}

export default CustomInput

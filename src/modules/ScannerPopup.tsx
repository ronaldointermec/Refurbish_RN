import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Modal from 'react-native-modal'
import styles from '../styles/styles'
import { useDispatch } from 'react-redux'

const ScannerPopup = (props) => {
    const dispatch = useDispatch()
    const [value, setValue] = useState<string>()

    return (
        <Modal isVisible={props.show} coverScreen={false} style={{ alignItems: 'center' }}>
            <View style={{ flex: 1 }}></View>
            <View style={[styles.modal, { flex: 3, alignItems: 'center', flexDirection: 'column', width: '95%' }]}>
                <View style={{ flex: 2 }}>
                    <Text style={styles.titulo}> SCANNER {props.title} </Text>
                </View>
                <View style={{ flex: 3, width: '95%', flexDirection: 'column' }}>
                    <Text>Informação:</Text>
                    <TextInput
                        enabled={true}
                        style={[styles.bigBox, { textAlign: 'center', borderColor: '#1274B7', backgroundColor: '#FFF' }]}
                        onChangeText={(v) => setValue(v)}
                        placeholder="Info."
                    />
                </View>
                <RectButton
                    style={[styles.btn, { width: '50%', flex: 1 }]}
                    onPress={() => {
                        props.setScan(value)
                        dispatch({ type: 'SCANNERMOCK', scannerMock: false })
                    }}
                >
                    <Text style={{ color: '#FFF' }}>OK</Text>
                </RectButton>
                <View style={{ flex: 1 }}></View>
            </View>
            <View style={{ flex: 1 }}></View>
        </Modal>
    )
}

export default ScannerPopup

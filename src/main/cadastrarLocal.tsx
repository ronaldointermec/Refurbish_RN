import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, Pressable, ToastAndroid, Alert } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import ScannerModule from '../modules/ScannerModule'
import { RefurbshContext } from '../context/refurbshContext'
import { cadastrarLocal } from '../services/api'
import LoadingScreen from '../component/loadingScreen'
import { addLog } from '../services/apiMicrosiga'

const CadastrarLocal = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [local, setLocal] = useState<string>('')

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function salvarLocal() {
        setLoading(true)
        if (local == '') {
            setLoading(false)
            ToastAndroid.showWithGravity('Insira o local a ser cadastrado!', 1000, ToastAndroid.BOTTOM)
            return
        }
        let body: any = {
            address: local,
            created_by: refurbshCtx.usuario.Username,
        }
        const resp: any = await cadastrarLocal(body)
        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível ralizar o cadastro. Erro: ${JSON.stringify(resp.data)} `, 'ERR')
            Alert.alert('ERRO', `Não foi possível ralizar o cadastro. Erro: ${JSON.stringify(resp.data)}`)
        } else {
            setLoading(false)
            addLog(`Local cadastrado!`, 'INFO')
            ToastAndroid.showWithGravity('Local cadastrado!', 1000, ToastAndroid.BOTTOM)
        }
        setLocal('')
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        setLocal(dadoEscaneado)
        addLog(`DADO ESCANEADO: ${dadoEscaneado}`, 'INFO')

        setDadoEscaneado('')
    }, [dadoEscaneado])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }
            addLog(`[TELA] Cadastrar Local`, 'INFO')
            Keyboard.addListener('keyboardDidShow', _kbShow)
            Keyboard.addListener('keyboardDidHide', _kbHide)
            ScannerModule.createScanner(setDadoEscaneado)
            setLoading(false)

            //Scanner(setDadoEscaneado, isFocused, isClaim, setIsClaim, subf, setSubF, subs, setSubS);
        }, [isFocused])
    )

    return (
        <KeyboardAvoidingView behavior="padding" style={style.container}>
            <LoadingScreen text={'Cadastrando'} show={loading} />
            <Background />
            <View style={style.mainContainer}>
                <View style={style.backBtn}>
                    <RectButton style={{ height: 35, width: 35 }} onPress={() => navigation.push('Home')}>
                        <Icon name="arrow-alt-circle-left" size={35} style={{ color: COLOR.secondary, lineHeight: 35 }} />
                    </RectButton>
                    <Text style={[style.menuTitle, { marginLeft: 10 }]}>Cadastrar - Local</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: COLOR.backgroundDarker, borderRadius: 10 }}>
                        <View
                            style={{
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Icon name="map-marker-alt" size={30} style={style.iconInput} />
                            <TextInput
                                placeholder="Local"
                                value={local}
                                onChangeText={setLocal}
                                onSubmitEditing={() => salvarLocal()}
                                style={style.textInput}
                            />
                        </View>
                        <RectButton style={[style.btn, { height: 40, margin: 10 }]} onPress={() => salvarLocal()}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>SALVAR</Text>
                        </RectButton>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default CadastrarLocal

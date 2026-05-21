import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, ToastAndroid, Alert } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import { RefurbshContext } from '../context/refurbshContext'
import LoadingScreen from '../component/loadingScreen'
import { cadastrarPN, getDescricaoPN } from '../services/api'
import ScannerModule from '../modules/ScannerModule'
import { addLog } from '../services/apiMicrosiga'

const CadastrarPN = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    const [pn, setPn] = useState<string>('')
    const [desc, setDesc] = useState<string>('')
    const [isFocused, setIsFocused] = useState<boolean>(false)

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function carregarDescricao() {
        setLoading(true)
        if (pn == '') {
            setLoading(false)
            ToastAndroid.showWithGravity('Insira o PN!', 1000, ToastAndroid.BOTTOM)
            return
        }
        const resp = await getDescricaoPN(pn)
        if (resp.status == 200) {
            setLoading(false)
            addLog(`Descrição carregada: ${JSON.stringify(resp.data.Description)}`, 'INFO')
            ToastAndroid.showWithGravity('Descrição carregada!', 1000, ToastAndroid.BOTTOM)
            setDesc(resp.data.Description)
        } else {
            setLoading(false)
            addLog(`Insira a descrição manualmente!`, 'INFO')
            ToastAndroid.showWithGravity('Insira a descrição manualmente!', 1000, ToastAndroid.BOTTOM)
        }
    }

    async function salvarPN() {
        if (pn == '' || desc == '') {
            setLoading(false)
            ToastAndroid.showWithGravity('Insira todos os dados para fazer o cadastro!', 1000, ToastAndroid.BOTTOM)
            return
        }
        let body: any = {
            pn: pn,
            description: desc,
            created_by: refurbshCtx.usuario.Username,
        }
        const resp = await cadastrarPN(body)
        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível salvar cadastrar o PN. Erro: ${JSON.stringify(resp.data)}`, 'ERR')
            Alert.alert('ERRO', `Não foi possível salvar cadastrar o PN. Erro: ${JSON.stringify(resp.data)}`)
        } else {
            setLoading(false)
            addLog(`PN cadastrado!`, 'INFO')
            ToastAndroid.showWithGravity('PN cadastrado!', 1000, ToastAndroid.BOTTOM)
        }
        setPn('')
        setDesc('')
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        if (!isFocused || pn == '' || dadoEscaneado == '') return

        setDadoEscaneado('')
        carregarDescricao()
    }, [pn])

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        // console.log(`DADO ESCANEADO: ${dadoEscaneado} `);
        addLog(`DADO ESCANEADO: ${dadoEscaneado} `, 'INFO')
        setPn(dadoEscaneado)
    }, [dadoEscaneado])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }

            addLog(`[TELA] Cadastrar PN`, 'INFO')
            Keyboard.addListener('keyboardDidShow', _kbShow)
            Keyboard.addListener('keyboardDidHide', _kbHide)

            ScannerModule.createScanner(setDadoEscaneado)
        }, [isFocused])
    )

    return (
        <KeyboardAvoidingView behavior="padding" style={style.container}>
            <LoadingScreen text={'Carregando'} show={loading} />
            <Background />
            <View style={style.mainContainer}>
                <View style={style.backBtn}>
                    <RectButton style={{ height: 35, width: 35 }} onPress={() => navigation.push('Home')}>
                        <Icon name="arrow-alt-circle-left" size={35} style={{ color: COLOR.secondary, lineHeight: 35 }} />
                    </RectButton>
                    <Text style={[style.menuTitle, { marginLeft: 10 }]}>Cadastrar - PN</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            backgroundColor: COLOR.backgroundDarker,
                            borderRadius: 10,
                            paddingBottom: 10,
                        }}
                    >
                        <View
                            style={{
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Icon name="qrcode" size={30} style={style.iconInput} />
                            <TextInput
                                placeholder="PN"
                                value={pn}
                                onChangeText={setPn}
                                onSubmitEditing={() => carregarDescricao()}
                                style={style.textInput}
                            />
                        </View>
                        <View
                            style={{
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Icon name="edit" size={30} style={style.iconInput} />
                            <TextInput
                                placeholder="Descrição"
                                value={desc}
                                onChangeText={setDesc}
                                numberOfLines={4}
                                multiline={true}
                                onSubmitEditing={() => salvarPN()}
                                style={[style.textInput, { height: 80 }]}
                            />
                        </View>

                        <RectButton style={[style.btn, { height: 40, margin: 10 }]} onPress={() => salvarPN()}>
                            <Text
                                style={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: 16,
                                }}
                            >
                                SALVAR
                            </Text>
                        </RectButton>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default CadastrarPN

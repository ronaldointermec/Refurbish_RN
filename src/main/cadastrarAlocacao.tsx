import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, Pressable, ToastAndroid, Alert } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import { RefurbshContext } from '../context/refurbshContext'
import LoadingScreen from '../component/loadingScreen'
import ScannerModule from '../modules/ScannerModule'
import CustomInput from '../component/customInput'
import { cadastrarAlocacao } from '../services/api'
import { addLog } from '../services/apiMicrosiga'

export enum FOCO {
    PN = 0,
    LOCAL = 1,
    QUANTIDADE = 2,
}

const CadastrarAlocacao = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [etapa, setEtapa] = useState<number>(0)
    const [itemFocus, setItemFocus] = useState<FOCO>(FOCO.PN)
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [pn, setPn] = useState<string>('')
    const [local, setLocal] = useState<string>('')
    const [quantidade, setQuantidade] = useState<string>('')

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function salvarAlocacao() {
        setLoading(true)
        if (pn == '' || local == '' || quantidade == '') {
            setLoading(false)
            ToastAndroid.showWithGravity('Insira todos os dados para fazer o cadastro!', 1000, ToastAndroid.BOTTOM)
            return
        }
        let body: any = {
            pn: pn,
            address: local,
            created_by: refurbshCtx.usuario.Username,
            quantity: quantidade,
        }
        const resp: any = await cadastrarAlocacao(body)
        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível realizar o cadastro. Erro: ${JSON.stringify(resp.data)}`, 'ERR')
            Alert.alert('ERRO', `Não foi possível realizar o cadastro. Erro: ${JSON.stringify(resp.data)}`)
        } else {
            setLoading(false)
            addLog(`Alocação cadastrada!`, 'INFO')
            ToastAndroid.showWithGravity('Alocação cadastrada!', 1000, ToastAndroid.BOTTOM)
        }
        setPn('')
        setLocal('')
        setQuantidade('')
        setEtapa(0)
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        if (!isFocused || pn == '' || dadoEscaneado == '') return

        setEtapa(1)
        setDadoEscaneado('')
    }, [pn])

    useEffect(() => {
        if (!isFocused || local == '' || dadoEscaneado == '') return

        setEtapa(2)
        setDadoEscaneado('')
    }, [local])

    useEffect(() => {
        if (!isFocused || pn == '') return

        switch (etapa) {
            case 0:
                setItemFocus(FOCO.PN)
                break
            case 1:
                setItemFocus(FOCO.LOCAL)
                break
            case 2:
                setItemFocus(FOCO.QUANTIDADE)
                break
            default:
                break
        }
    }, [etapa])

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        // console.log(`DADO ESCANEADO: ${dadoEscaneado} `);
        addLog(`DADO ESCANEADO: ${dadoEscaneado}`, 'INFO')

        switch (etapa) {
            case 0:
                console.log('case 0')
                setPn(dadoEscaneado)
                break
            case 1:
                console.log('case 1')
                setLocal(dadoEscaneado)
                break
            default:
                break
        }
    }, [dadoEscaneado])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }

            addLog('[TELA] Cadastrar Alocação', 'INFO')
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
                    <Text style={[style.menuTitle, { marginLeft: 10 }]}>Cadastrar - Alocação</Text>
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
                            <Icon name="qrcode" size={30} style={style.iconInput} />
                            <CustomInput
                                placeholder="PN"
                                value={pn}
                                focus={itemFocus == FOCO.PN}
                                onChangeText={setPn}
                                onSubmitEditing={() => {
                                    setEtapa(1)
                                }}
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
                            <Icon name="map-marker-alt" size={30} style={style.iconInput} />
                            <CustomInput
                                placeholder="Local"
                                value={local}
                                focus={itemFocus == FOCO.LOCAL}
                                onChangeText={setLocal}
                                onSubmitEditing={() => {
                                    setEtapa(2)
                                }}
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
                            <Icon name="sort-numeric-up-alt" size={30} style={style.iconInput} />
                            <CustomInput
                                placeholder="Quantidade"
                                value={quantidade}
                                keyboardType="numeric"
                                focus={itemFocus == FOCO.QUANTIDADE}
                                onChangeText={setQuantidade}
                                onSubmitEditing={() => {
                                    salvarAlocacao()
                                }}
                            />
                        </View>

                        <RectButton
                            style={[style.btn, { height: 40, margin: 10 }]}
                            onPress={() => {
                                salvarAlocacao()
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>SALVAR</Text>
                        </RectButton>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default CadastrarAlocacao

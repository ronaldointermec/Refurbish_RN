import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, Pressable, Alert, ToastAndroid } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import ScannerModule from '../modules/ScannerModule'
import { alocarOS, alterarLocalOS, alterarStatusOS, getOSLabPeloNumero, getOSPeloNumero } from '../services/api'
import LoadingScreen from '../component/loadingScreen'
import { RefurbshContext } from '../context/refurbshContext'
import { RespConsultaOS } from '../models/respConsultaOS'
import CustomInput from '../component/customInput'
import { addLog } from '../services/apiMicrosiga'

export enum FOCO {
    OS = 0,
    LOCAL = 1,
}

const AlocarOS = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [os, setOs] = useState<string>('')
    const [local, setLocal] = useState<string>('')
    const [etapa, setEtapa] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>()
    const [itemFocus, setItemFocus] = useState<FOCO>(FOCO.OS)

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function realizarAlocacao() {
        //console.log('REALIZANDO ALOCAÇÃO')
        setLoading(true)
        let isLab: boolean = false
        let localAux: string = ''
        if (local.includes('-')) {
            isLab = false
            localAux = local
        } else {
            isLab = true
            localAux = local.replace(/\r/g, ' :: ')
        }

        let body: any = {
            os: os,
            local: localAux,
            is_lab: isLab,
            status_id: 2,
            created_by: refurbshCtx.usuario.Username,
        }

        //console.log('BODY: ' + JSON.stringify(body))

        let respConsulta: any
        if (isLab) {
            respConsulta = await getOSLabPeloNumero(os)
        } else {
            respConsulta = await getOSPeloNumero(os)
        }
        //console.log('RESP CONSULTA: ' + JSON.stringify(respConsulta))

        if (respConsulta != null) {
            if (respConsulta.status != 200) {
                setLoading(false)
                addLog(`Não foi possível alocar a OS. Erro: ${JSON.stringify(respConsulta.data)}`, 'ERR')
                Alert.alert('ERRO', `Não foi possível alocar a OS. Erro: ${JSON.stringify(respConsulta.data)}`)
            } else {
                if (respConsulta.data.length == 0) {
                    const resp = await alocarOS(body)
                    if (resp.status != 200) {
                        setLoading(false)
                        addLog(`Não foi possível alocar a OS. Erro: ${JSON.stringify(resp.data)}`, 'ERR')
                        Alert.alert('ERRO', `Não foi possível alocar a OS. Erro: ${JSON.stringify(resp.data)}`)
                    } else {
                        setLoading(false)
                        addLog(`Os (${os}) alocada em ${localAux}.`, 'INFO')
                        ToastAndroid.showWithGravity('OS alocada', 1000, ToastAndroid.BOTTOM)
                    }
                } else {
                    if (respConsulta.data[0].status_id != 2) {
                        const resp = await alocarOS(body)
                        if (resp.status != 200) {
                            setLoading(false)
                            addLog(`Não foi possível alocar a OS. Erro: ${JSON.stringify(resp.data)}`, 'ERR')
                            Alert.alert('ERRO', `Não foi possível alocar a OS. Erro: ${JSON.stringify(resp.data)}`)
                        } else {
                            setLoading(false)
                            addLog(`Os Alocada.`, 'INFO')
                            ToastAndroid.showWithGravity('OS alocada', 1000, ToastAndroid.BOTTOM)
                        }
                    } else {
                        ToastAndroid.showWithGravity(
                            `Essa OS já foi alocada em ${respConsulta.data[0].local}, atualizando local...`,
                            1000,
                            ToastAndroid.BOTTOM
                        )
                        const respAtualizacao = await alterarLocalOS(respConsulta.data[0].id, body, refurbshCtx.usuario.Username)
                        if (respAtualizacao.status != 200) {
                            setLoading(false)
                            addLog(`Não foi possível alocar a OS. Erro: ${JSON.stringify(respAtualizacao.data)}`, 'ERR')
                            Alert.alert('ERRO', `Não foi possível alocar a OS. Erro: ${JSON.stringify(respAtualizacao.data)}`)
                        } else {
                            setLoading(false)
                            addLog(`Local da OS atualizado para ${localAux}`, 'INFO')
                            ToastAndroid.showWithGravity(`Local da OS atualizado para ${localAux}`, 1000, ToastAndroid.BOTTOM)
                        }
                    }
                }
            }
        }

        setOs('')
        setLocal('')
        setEtapa(0)

        //console.log(`ETAPA: ${etapa}`)
        // setTimeout(() => {
        //     setEtapa(0)
        // }, 1000)
        // //setTimeout(() => setEtapa(0), 1000)
    }

    useEffect(() => {
        if (!isFocused || os == '' || dadoEscaneado == '') return

        setEtapa(1)
        if (local != '') {
            realizarAlocacao()
        }
        setDadoEscaneado('')
    }, [os])

    useEffect(() => {
        if (!isFocused || os == '' || dadoEscaneado == '') return

        setEtapa(0)
        if (os != '') {
            realizarAlocacao()
        }
        setDadoEscaneado('')
    }, [local])

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        let etapaScanner: number
        // console.log(`DADO ESCANEADO: ${dadoEscaneado} `);
        addLog(`DADO ESCANEADO: ${dadoEscaneado}`, 'INFO')

        if (/^[0-9]+$/.test(dadoEscaneado)) {
            etapaScanner = 0
        } else {
            etapaScanner = 1
        }

        switch (etapaScanner) {
            case 0:
                console.log('case 0')
                setOs(dadoEscaneado)
                break
            case 1:
                console.log('case 1')
                setLocal(dadoEscaneado)
                break
            default:
                break
        }
    }, [dadoEscaneado])

    useEffect(() => {
        if (!isFocused) return

        switch (etapa) {
            case 0:
                setItemFocus(FOCO.OS)
                break
            case 1:
                setItemFocus(FOCO.LOCAL)
                break
            default:
                break
        }
    }, [etapa])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) return

            setLoading(false)
            setEtapa(0)
            addLog('[TELA] Alocar OS', 'INFO')
            ScannerModule.createScanner(setDadoEscaneado)
        }, [isFocused])
    )

    return (
        <KeyboardAvoidingView behavior="padding" style={style.container}>
            <LoadingScreen text={'Alocando'} show={loading} />
            <Background />
            <View style={style.mainContainer}>
                <View style={style.backBtn}>
                    <RectButton
                        style={{
                            height: 35,
                            width: 35,
                        }}
                        onPress={() => navigation.push('Home')}
                    >
                        <Icon
                            name="arrow-alt-circle-left"
                            size={35}
                            style={{
                                color: COLOR.secondary,
                                lineHeight: 35,
                            }}
                        />
                    </RectButton>
                    <Text
                        style={[
                            style.menuTitle,
                            {
                                marginLeft: 10,
                            },
                        ]}
                    >
                        Alocar OS
                    </Text>
                </View>
                <View
                    style={{
                        flex: 1,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: COLOR.backgroundDarker,
                            borderRadius: 10,
                            paddingBottom: 15,
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
                            <Icon name="file-alt" size={30} style={style.iconInput} />
                            <CustomInput
                                placeholder="OS"
                                focus={itemFocus == FOCO.OS}
                                value={os}
                                onChangeText={setOs}
                                keyboardType="numeric"
                                onSubmitEditing={() => {
                                    setEtapa(1)
                                    if (local != '') {
                                        realizarAlocacao()
                                    }
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
                                placeholder="LOCAL"
                                focus={itemFocus == FOCO.LOCAL}
                                value={local}
                                onChangeText={setLocal}
                                onSubmitEditing={() => {
                                    setEtapa(0)
                                    if (os != '') {
                                        realizarAlocacao()
                                    }
                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default AlocarOS

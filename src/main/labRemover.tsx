import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, Pressable, ToastAndroid, Alert } from 'react-native'
import { RectButton, TextInput } from 'react-native-gesture-handler'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import { alterarStatusOS, getOSLabPeloNumero, getOSPeloNumero } from '../services/api'
import { RefurbshContext } from '../context/refurbshContext'
import ScannerModule from '../modules/ScannerModule'
import CustomInput from '../component/customInput'
import LoadingScreen from '../component/loadingScreen'

export enum FOCO {
    OS = 0,
    OS_CONFIRM = 1,
}

const LabRemover = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [textoLoading, setTextoLoading] = useState<string>('Carregando')
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [os, setOs] = useState<string>('')
    const [local, setLocal] = useState<string>('')
    const [osConfirm, setOsConfirm] = useState<string>('')
    const [osCarregada, setOsCarregada] = useState({
        id: '',
        os: '',
        local: '',
        is_lab: '',
        status_id: '',
        created_by: '',
        updates_by: '',
        createdAt: '',
        updatedAt: '',
    })
    const [etapa, setEtapa] = useState(0)
    const [loading, setLoading] = useState<boolean>()
    const [itemFocus, setItemFocus] = useState<FOCO>(FOCO.OS)

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function removerOs() {
        setTextoLoading('Removendo OS')
        setLoading(true)
        let localArray: string[] = osCarregada.local.split(' ')
        let localStr: string = `${localArray[2]} :: ${localArray[0]}`
        if (localStr == local && osCarregada.os == osConfirm) {
            const resp: any = await alterarStatusOS(osCarregada.id, refurbshCtx.usuario.Username)
            if (resp.status != 200) {
                setLoading(false)
                setTextoLoading('Carregando')
                Alert.alert('ERRO', `Não foi possível realizar a remoção da OS. Erro: ${JSON.stringify(resp.data)}`)
            } else {
                setLoading(false)
                setTextoLoading('Carregando')
                ToastAndroid.showWithGravity('OS removida', 1000, ToastAndroid.BOTTOM)
            }
        } else {
            setLoading(false)
            setTextoLoading('Carregando')
            Alert.alert('ALERTA', `As informações inserdas não coincidem com a OS.`)
        }

        setOs('')
        setLocal('')
        setOsConfirm('')
        setEtapa(0)
    }

    async function carregarOs() {
        setTextoLoading('Carregando')
        setLoading(true)
        if (os == '') {
            setLoading(false)
            ToastAndroid.showWithGravity(`Digite a OS que deseja pesquisar`, 2000, ToastAndroid.BOTTOM)
            return
        }
        const resp = await getOSLabPeloNumero(os)
        if (resp.status != 200) {
            setLoading(false)
            Alert.alert('ERRO', `Erro ao buscar a OS. Erro: ${JSON.stringify(resp.data)}`)
            setOs('')
            setEtapa(1)
            setEtapa(0)
            return
        }
        if (resp.data.length == 0) {
            setLoading(false)
            ToastAndroid.showWithGravity('Não foi possível encontrar uma OS com esse número!', 2000, ToastAndroid.BOTTOM)
            setOs('')
            setEtapa(1)
            setEtapa(0)
            return
        }
        if (resp.data.length > 1) {
            setLoading(false)
            Alert.alert('ALERTA', `Existe mais de uma OS com esse número, não é possível fazer a remoção.`)
            setOs('')
            setEtapa(1)
            setEtapa(0)
            return
        }
        if (resp.data.length == 1) {
            if (resp.data[0].status_id == 3) {
                setLoading(false)
                ToastAndroid.showWithGravity(
                    `Essa OS já foi removida, sua última posição era ${resp.data[0].local}`,
                    2000,
                    ToastAndroid.BOTTOM
                )
                setOs('')
                setEtapa(1)
                setEtapa(0)
                return
            } else {
                setOsCarregada(resp.data[0])
                setLoading(false)
                ToastAndroid.showWithGravity('OS carregada', 1000, ToastAndroid.BOTTOM)
                let localArray = resp.data[0].local.split(' ')
                let localStr = `${localArray[2]} :: ${localArray[0]}`
                setLocal(localStr)
                setEtapa(1)
            }
        }
    }

    useEffect(() => {
        if (!isFocused || os == '' || dadoEscaneado == '') return

        carregarOs()
        setDadoEscaneado('')
    }, [os])

    useEffect(() => {
        if (!isFocused || osConfirm == '' || dadoEscaneado == '') return

        setDadoEscaneado('')
        removerOs()
    }, [osConfirm])

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        console.log(`DADO ESCANEADO: ${dadoEscaneado} `)
        console.log('ETAPA: ' + etapa)

        switch (etapa) {
            case 0:
                console.log('case 0')
                setOs(dadoEscaneado)
                break
            case 1:
                console.log('case 1')
                setOsConfirm(dadoEscaneado)
                break
            default:
                break
        }
        //setDadoEscaneado('');
    }, [dadoEscaneado])

    useEffect(() => {
        if (!isFocused) return

        switch (etapa) {
            case 0:
                setItemFocus(FOCO.OS)
                break
            case 1:
                setItemFocus(FOCO.OS_CONFIRM)
                break
        }
    }, [etapa])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                return
            }

            ScannerModule.createScanner(setDadoEscaneado)
        }, [isFocused])
    )

    return (
        <View style={{ height: '100%' }}>
            <LoadingScreen text={textoLoading} show={loading} />
            <KeyboardAvoidingView behavior="height">
                <Background />
                <View style={style.mainContainer}>
                    <View style={style.backBtn}>
                        <RectButton style={{ height: 35, width: 35 }} onPress={() => navigation.push('Home')}>
                            <Icon name="arrow-alt-circle-left" size={35} style={{ color: COLOR.secondary, lineHeight: 35 }} />
                        </RectButton>
                        <Text style={[style.menuTitle, { marginLeft: 10 }]}>Lab - Remover</Text>
                    </View>

                    <View style={{ backgroundColor: COLOR.backgroundDarker, borderRadius: 10, paddingBottom: 10 }}>
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
                                //autoFocus={true}
                                value={os}
                                focus={itemFocus == FOCO.OS}
                                onChangeText={setOs}
                                onSubmitEditing={() => {
                                    carregarOs()
                                }}
                                //onPress={() => setEtapa(0)}
                                keyboardType="numeric"
                                //onTouchEnd={() => setEtapa(0)}
                            />
                        </View>

                        <RectButton
                            style={[style.btn, { height: 40, margin: 10 }]}
                            onPress={() => {
                                carregarOs()
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>PESQUISAR</Text>
                        </RectButton>

                        <View
                            style={{
                                borderBottomColor: COLOR.secondary,
                                borderBottomWidth: 1,
                                marginTop: 10,
                                width: '90%',
                                marginLeft: '5%',
                            }}
                        />

                        <Text
                            style={{
                                fontSize: 16,
                                textAlign: 'center',
                                fontWeight: '900',
                                color: COLOR.secondary,
                                marginTop: 5,
                            }}
                        >
                            REMOÇÃO
                        </Text>

                        <View
                            style={{
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <Icon name="map-marker-alt" size={30} style={style.iconInput} />
                            <CustomInput placeholder="LOCAL" value={local} editable={false} />
                        </View>
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
                                focus={itemFocus == FOCO.OS_CONFIRM}
                                value={osConfirm}
                                onChangeText={setOsConfirm}
                                keyboardType="numeric"
                                onSubmitEditing={() => removerOs()}
                                //onTouchEnd={() => setEtapa(2)}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default LabRemover

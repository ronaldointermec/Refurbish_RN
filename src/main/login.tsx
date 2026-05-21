import React, { useCallback, useContext, useEffect, useState, useRef } from 'react'
import {
    View,
    KeyboardAvoidingView,
    Text,
    Alert,
    TextInput,
    Image,
    TouchableOpacity,
    BackHandler,
    Keyboard,
    ToastAndroid,
} from 'react-native'
import style, { COLOR } from '../styles/styles'
import { useSelector } from 'react-redux'
// import ScannerPopup from "../modules/ScannerPopup";
import ScannerModule from '../modules/ScannerModule'
import { useFocusEffect } from '@react-navigation/native'
import { ScannerContext } from '../context/scanner'
import { RectButton } from 'react-native-gesture-handler'
import { RefurbshContext } from '../context/refurbshContext'
import { Usuario } from '../models/usuario'
import { addLog, validateUser, oAuthAuthorize, getDeviceNameAPI, setUserAPI } from '../services/apiMicrosiga'
import md5 from 'md5'
// import { DownloadDirectoryPath, readDir, unlink } from 'react-native-fs';
import pkg from '../../package.json'
import Icon from 'react-native-vector-icons/FontAwesome'
import Background from '../component/background'
import { getUser, setUser } from '../services/storage'
import LoadingScreen from '../component/loadingScreen'

const Login = ({ navigation }) => {
    const { setTemScanner } = useContext(ScannerContext)
    const scannerPop = useSelector((state: any) => state.scanner)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [isFocused, setIsFocused] = useState(false)
    const { setUsuario } = useContext(RefurbshContext)
    const [refresh, setRefresh] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [apiDown, setApiDown] = useState<boolean>(false)
    const [nome, setNome] = useState<any>('')
    const [senha, setSenha] = useState<any>('')
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    const [textFocus, setTextFocus] = useState<any>({ 0: true, 1: false })
    const [hidePass, setHidePass] = useState<boolean>(true)
    //const [scan, setScan] = useState<boolean>(false);
    const nomeRef = useRef<any>(null)
    const senhaRef = useRef<any>(null)

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function initScanner() {
        ScannerModule.createScanner(setDadoEscaneado)
        let temScanner = await ScannerModule.readerAvailable()
        if (temScanner == false) {
            Alert.alert('ERRO', 'Não foi encontrado um barcode reader nesse dispositivo', [
                {
                    text: 'Tentar novamente',
                    onPress: () => {
                        initScanner()
                    },
                },
                {
                    text: 'Continuar',
                    onPress: () => {
                        setTemScanner(false)
                    },
                },
            ])
        } else setTemScanner(true)
    }

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

    async function loadExistUser() {
        const user: Usuario = (await getUser()) as Usuario

        if (user != null) {
            setUsuario(user)
            setLoading(false)
            setUserAPI(user.Username)
            addLog('Usuário já logado: ' + user.Username)
            ToastAndroid.showWithGravity('Usuário carregado', 1000, ToastAndroid.BOTTOM)
            setLoading(false)
            navigation.push('Home')
        } else {
            setLoading(false)
        }
    }

    async function login() {
        setLoading(true)

        if (nome == null || senha == null) {
            setLoading(false)
            return
        }

        let resp: any = await oAuthAuthorize()
        if (resp.status != 200) addLog('SSO não foi Autenticado')
        else addLog('SSO Autenticado')

        addLog('Carregando Usuario: ' + nome)

        let res = await validateUser(nome, md5(senha))
        if (res.status != 200) {
            alert('Falha ao autenticar:\n' + JSON.stringify(res.data.message))
            addLog('Falha ao autenticar:\n' + JSON.stringify(res.data.message))
            setApiDown(res.status == 503)
            limparState()
            setLoading(false)
            return
        }

        let usr: Usuario = res.data.message as Usuario
        if (!usr) {
            setLoading(false)
            alert('Usuario ' + nome + ' não encontrado')
            limparState()
        } else {
            console.log('USR LOGIN:' + usr)
            setUsuario(usr)
            addLog('Usuario autenticado ' + JSON.stringify(usr))
            setLoading(false)
            const resp = await setUser(usr)
            if (resp) {
                setUserAPI(usr.Username)
                navigation.push('Home')
            }
        }
    }

    async function limparState() {
        setNome(null)
        setSenha(null)
        setTextFocus([false, false])
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        setLoading(true)
        getDeviceNameAPI()
        loadExistUser()
    }, [])

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        if (textFocus[0]) {
            setNome(dadoEscaneado)
            setTextFocus([false, true])
        } else if (textFocus[1]) {
            setSenha(dadoEscaneado)
            if (nome == null) setTextFocus([true, false])
            else setTextFocus([false, false])
        }

        setDadoEscaneado('')

        return
    }, [dadoEscaneado])

    useEffect(() => {
        if (!isFocused) return

        if (nomeRef != null && textFocus[0]) nomeRef.current.focus()

        if (senhaRef != null && textFocus[1]) senhaRef.current.focus()

        if (!textFocus[0] && !textFocus[1]) {
            if (nome != '' && senha != '' && nome != null) login()
        }
    }, [textFocus])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }
            //gerenciarLogs();
            Keyboard.addListener('keyboardDidShow', _kbShow)
            Keyboard.addListener('keyboardDidHide', _kbHide)

            initScanner()
        }, [isFocused, refresh])
    )

    return (
        <View style={{ flex: 1 }}>
            <LoadingScreen text={'Carregando'} show={loading} />
            <KeyboardAvoidingView behavior="height" style={[style.container, { marginBottom: 0, alignItems: 'center' }]}>
                <Background />
                <RectButton style={[style.btn, { display: apiDown ? 'flex' : 'none' }]} onPress={() => setRefresh(refresh + 1)}>
                    <Text style={{ fontSize: 15, color: '#FFF' }}>Reconectar API</Text>
                </RectButton>

                <View style={{ width: 100, height: 15, position: 'absolute', right: 0, top: 20 }}>
                    <Image
                        style={{ width: '100%', height: 15, resizeMode: 'contain', display: 'flex' }}
                        source={require('./../assets/logo.png')}
                    />
                </View>

                <View style={{ width: '100%', height: '35%', alignItems: 'center', display: 'flex', top: '5%' }}>
                    <Icon name="refresh" size={80} style={{ color: COLOR.secondary }} />
                    <Text style={{ fontSize: 25, fontWeight: 'bold', color: COLOR.secondary }}>REFURBISH</Text>
                </View>

                <View style={{ width: '90%', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18 }}> Nome: </Text>
                    <TextInput
                        //enabled={textFocus[0]}
                        style={[
                            style.bigBox,
                            {
                                textAlign: 'center',
                                borderColor: textFocus[0] ? COLOR.hilight : '#0005',
                                backgroundColor: textFocus[0] ? '#FFF' : '#0001',
                            },
                        ]}
                        onChangeText={(v) => setNome(v)}
                        onFocus={() => setTextFocus([true, false])}
                        onBlur={() => setTextFocus(senha == null ? [false, true] : [false, false])}
                        value={nome}
                        placeholder="EID"
                        autoCapitalize="characters"
                        ref={nomeRef}
                    />
                    <Text style={{ fontSize: 18 }}> Senha: </Text>
                    <View
                        style={[
                            style.bigBox,
                            {
                                flexDirection: 'row',
                                width: '100%',
                                padding: 0,
                                borderColor: textFocus[1] ? COLOR.hilight : '#0005',
                                backgroundColor: textFocus[1] ? '#0000' : '#0001',
                            },
                        ]}
                    >
                        <TextInput
                            //enabled={textFocus[1]}
                            style={{ flex: 5, margin: 0, textAlign: 'center', fontSize: 17 }}
                            onChangeText={(v) => setSenha(v)}
                            onFocus={() => setTextFocus([false, true])}
                            onBlur={() => setTextFocus(nome == null ? [true, false] : [false, false])}
                            onPressIn={() => setTextFocus([true, false])}
                            value={senha}
                            placeholder="SENHA"
                            ref={senhaRef}
                            secureTextEntry={hidePass}
                        />

                        <TouchableOpacity
                            style={{ backgroundColor: textFocus[1] ? '#0000' : '#0001', flex: 1 }}
                            onPressIn={() => setHidePass(false)}
                            onPressOut={() => setHidePass(true)}
                        >
                            <Icon
                                name="eye"
                                size={22}
                                style={{ flex: 1, color: '#0008', marginRight: 0, marginTop: 12, textAlign: 'center' }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ width: '95%', flexDirection: 'row', flex: 1, display: keyboardPop ? 'none' : 'flex' }}>
                    <RectButton style={[style.btnDarker, { height: 40, margin: 5, flex: 1 }]} onPress={() => sair()}>
                        <Text style={{ color: '#FFF' }}>Sair</Text>
                    </RectButton>
                    <RectButton
                        style={[
                            style.btn,
                            {
                                height: 40,
                                margin: 5,
                                flex: 1,
                                backgroundColor: nome != null && senha != null ? COLOR.hilight : COLOR.disable,
                            },
                        ]}
                        enabled={nome != null && senha != null}
                        onPress={() => login()}
                    >
                        <Text style={{ color: '#FFF' }}>Login</Text>
                    </RectButton>
                </View>

                <View style={{ width: '95%', display: keyboardPop ? 'none' : 'flex' }}>
                    <Text style={{ textAlign: 'right', fontSize: 10 }}>{pkg.version}</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}
export default Login

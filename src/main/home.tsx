import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, KeyboardAvoidingView, Pressable, Text, TextInput, Keyboard } from 'react-native'
import Modal from 'react-native-modal'
import style, { COLOR } from '../styles/styles'
import { useSelector } from 'react-redux'
import ScannerPopup from '../modules/ScannerPopup'
import ScannerModule from '../modules/ScannerModule'
import { useFocusEffect } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { ScannerContext } from '../context/scanner'
import Background from '../component/background'
import Footer from '../component/footer'
import { RectButton } from 'react-native-gesture-handler'
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeUser } from '../services/storage'
import { RefurbshContext } from '../context/refurbshContext'
import { setIp, getIp } from '../services/storage'
import { addLog } from '../services/apiMicrosiga'

const Home = ({ navigation }) => {
    const ctx = useContext(ScannerContext)
    const refurbshCtx = useContext(RefurbshContext)
    const scannerPop = useSelector((state: any) => state.scanner)

    const [nomeMenor, setNomeMenor] = useState<string>('')
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [showConfig, setShowConfig] = useState<boolean>(false)
    const [showCadastro, setShowCadastro] = useState<boolean>(false)
    const [ipImpressora, setIpImpressora] = useState<string>('')
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    async function salvarConfig() {
        await setIp(ipImpressora)
        setShowConfig(false)
    }

    function sairConfig() {
        setShowConfig(false)
    }

    function sair() {
        removeUser(navigation)
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        if (!isFocused || dadoEscaneado == '') return

        console.log(`DADO ESCANEADO: ${dadoEscaneado}`)
        setDadoEscaneado('')
    }, [dadoEscaneado])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }

            Keyboard.addListener('keyboardDidShow', _kbShow)
            Keyboard.addListener('keyboardDidHide', _kbHide)

            ScannerModule.createScanner(setDadoEscaneado)
            let auxArray = refurbshCtx.usuario.Name.split(' ')
            let auxNome = `${auxArray[0]} ${auxArray[auxArray.length - 1]}`
            setNomeMenor(auxNome)
            console.log('auxNome: ' + auxNome)
            setShowConfig(false)
        }, [isFocused])
    )

    useEffect(() => {
        addLog('[TELA] Home')
        loadIP()
    }, [])

    async function loadIP() {
        const ip = await getIp()

        if (ip != null) setIpImpressora(ip)
    }

    return (
        <KeyboardAvoidingView style={style.container}>
            <Modal
                isVisible={showConfig}
                coverScreen={false}
                style={[
                    style.modalConfig,
                    {
                        marginTop: '35%',
                        minHeight: keyboardPop ? '50%' : '30%',
                        maxHeight: keyboardPop ? '50%' : '30%',
                    },
                ]}
                onBackButtonPress={() => sairConfig()}
                onBackdropPress={() => sairConfig()}
            >
                <View style={[style.containerModal]}>
                    <Text style={{ fontSize: 20, color: COLOR.text }}>Configurações</Text>
                    <Text style={{ fontSize: 16, color: COLOR.text }}>IP da impressora</Text>
                    <TextInput
                        placeholder="Ex. 192.168.0.1"
                        style={{
                            backgroundColor: COLOR.defaultBackground,
                            color: COLOR.text,
                            fontSize: 18,
                            height: 40,
                            width: '100%',
                            borderColor: '#858585',
                            borderRadius: 10,
                            borderWidth: 2,
                        }}
                        onChangeText={(text) => setIpImpressora(text)}
                        value={ipImpressora}
                    />

                    <View style={{ width: '100%', flexDirection: 'row' }}>
                        <RectButton
                            style={[style.btnDarker, { height: 40, marginRight: 5, flex: 1 }]}
                            onPress={() => sairConfig()}
                        >
                            <Text style={{ color: '#fff' }}>Sair</Text>
                        </RectButton>

                        <RectButton style={[style.btn, { height: 40, marginLeft: 5, flex: 1 }]} onPress={() => salvarConfig()}>
                            <Text style={{ color: '#fff' }}>Salvar</Text>
                        </RectButton>
                    </View>
                </View>
            </Modal>

            <Modal
                isVisible={showCadastro}
                coverScreen={false}
                style={[style.modalConfig, { marginTop: '45%', minHeight: '38%', maxHeight: '38%' }]}
                onBackButtonPress={() => setShowCadastro(false)}
                onBackdropPress={() => setShowCadastro(false)}
            >
                <View
                    style={{
                        alignContent: 'center',
                        flexDirection: 'column',
                        display: 'flex',
                        justifyContent: 'center',
                        height: '100%',
                        padding: 10,
                    }}
                >
                    <RectButton
                        style={[style.btnLight, { height: 50, justifyContent: 'flex-start' }]}
                        onPress={() => navigation.push('CadastrarPN')}
                    >
                        <Icon name="qrcode" size={25} style={{ color: '#FFF', lineHeight: 50, marginHorizontal: 10 }} />
                        <Text style={{ color: '#fff' }}>Cadastrar - PN</Text>
                    </RectButton>

                    <RectButton
                        style={[style.btn, { height: 50, justifyContent: 'flex-start' }]}
                        onPress={() => navigation.push('CadastrarAlocacao')}
                    >
                        <Icon name="sign-in-alt" size={25} style={{ color: '#FFF', lineHeight: 50, marginHorizontal: 10 }} />
                        <Text style={{ color: '#fff' }}>Cadastrar - Alocação</Text>
                    </RectButton>

                    <RectButton
                        style={[style.btnDarker, { height: 50, justifyContent: 'flex-start' }]}
                        onPress={() => navigation.push('CadastrarLocal')}
                    >
                        <Icon name="map-pin" size={25} style={{ color: '#FFF', lineHeight: 50, marginHorizontal: 10 }} />
                        <Text style={{ color: '#fff' }}>Cadastrar - Local</Text>
                    </RectButton>
                </View>
            </Modal>

            <ScannerPopup show={scannerPop.scannerMock} title="Scanner" setScan={setDadoEscaneado} />
            <Background />
            <View style={style.mainContainer}>
                <View>
                    <Pressable
                        onPress={() => setShowConfig(true)}
                        hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
                        android_ripple={{ color: COLOR.main }}
                        style={style.buttonExit}
                    >
                        <Icon name="cog" size={25} style={{ color: COLOR.secondary }} />
                    </Pressable>
                </View>

                <View style={{ flex: 3, top: 20 }}>
                    <Text style={style.menuTitle}>DashBoard</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: '600', fontSize: 16, color: COLOR.text }}>Usuáro:</Text>
                        <Text style={{ fontWeight: '400', fontSize: 16, color: COLOR.text, marginLeft: 10 }}>{nomeMenor}</Text>
                        <Text style={{ fontWeight: '600', fontSize: 16, color: COLOR.text, marginLeft: 20 }}>EID:</Text>
                        <Text style={{ fontWeight: '400', fontSize: 16, color: COLOR.text, marginLeft: 10 }}>
                            {refurbshCtx.usuario.Username}
                        </Text>
                    </View>
                    <RectButton style={style.btnMenu} onPress={() => navigation.push('AlocarOS')}>
                        <View style={style.iconMenu}>
                            <Icon name="cart-arrow-down" size={30} style={{ color: COLOR.defaultBackground }} />
                        </View>
                        <Text style={style.textMenu}>Alocar OS</Text>
                    </RectButton>
                    <RectButton style={style.btnMenu} onPress={() => navigation.push('ExpedicaoConsulta')}>
                        <View style={style.iconMenu}>
                            <Icon name="search-location" size={30} style={{ color: COLOR.defaultBackground }} />
                        </View>
                        <Text style={style.textMenu}>Expedição - Consulta</Text>
                    </RectButton>
                    <RectButton style={style.btnMenu} onPress={() => navigation.push('LabRemover')}>
                        <View style={style.iconMenu}>
                            <Icon name="eraser" size={30} style={{ color: COLOR.defaultBackground }} />
                        </View>
                        <Text style={style.textMenu}>Laboratório - Remover</Text>
                    </RectButton>
                    <RectButton style={style.btnMenu} onPress={() => setShowCadastro(true)}>
                        <View style={style.iconMenu}>
                            <Icon name="database" size={30} style={{ color: COLOR.defaultBackground }} />
                        </View>
                        <Text style={style.textMenu}>Cadastro</Text>
                    </RectButton>

                    <RectButton style={style.btnMenu} onPress={() => navigation.push('Inventory')}>
                        <View style={style.iconMenu}>
                            <Icon name="warehouse" size={30} style={{ color: COLOR.defaultBackground }} />
                        </View>
                        <Text style={style.textMenu}>Inventário</Text>
                    </RectButton>
                    <RectButton style={[style.btn, { height: 40, margin: 5 }]} onPress={() => sair()}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>Sair</Text>
                    </RectButton>
                </View>

                <View style={{ flex: 0.1 }}>
                    <Footer />
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

export default Home

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { KeyboardAvoidingView, View, Text, Keyboard, Pressable, Alert, ToastAndroid } from 'react-native'
import { RectButton, ScrollView, TextInput } from 'react-native-gesture-handler'
import Modal from 'react-native-modal'
import Background from '../component/background'
import style, { COLOR } from '../styles/styles'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect } from '@react-navigation/native'
import { ListItem } from '@rneui/themed'
import LoadingScreen from '../component/loadingScreen'
import { RefurbshContext } from '../context/refurbshContext'
import { alterarStatusOS, getOSInfo, getTodasOSExpedicao } from '../services/api'
import { Impressora } from '../helpers/impressora'
import { getIp } from '../services/storage'
import { addLog } from '../services/apiMicrosiga'

const ExpedicaoConsulta = ({ navigation }) => {
    const refurbshCtx = useContext(RefurbshContext)
    const [keyboardPop, setKeyboardPop] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [modalDetalhes, setModalDetalhes] = useState<boolean>(false)
    const [listCount, setContadorLista] = useState<number>(0)
    const [pesquisaOP, setPesquisaOP] = useState<string>('')
    const [opSelecionada, setOpSelecionada] = useState({
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
    const [listaDiplay, setListaDisplay] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [listaOS, setListaOS] = useState<[]>([])

    navigation.addListener('focus', () => setIsFocused(true))
    navigation.addListener('blur', () => setIsFocused(false))

    function openDetailsModal(reset, os) {
        setOpSelecionada(os)
        setModalDetalhes(true)
        reset()
    }

    function closeModalDetails() {
        setOpSelecionada({
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
        setModalDetalhes(false)
    }

    async function imprimirOS(reset, os) {
        reset()
        setLoading(true)
        console.log(`OS: ${os}`)
        const ip: any = await getIp()
        const resp: any = await getOSInfo(os.os)
        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível realizar a impressão: ${JSON.stringify(resp.data)} `, 'ERR')
            Alert.alert('ERRO', `Não foi possível realizar a impressão: ${JSON.stringify(resp.data)} `)
        } else {
            console.log(`CUSTOMER: ${resp.data[0].Name}`)
            console.log(`IP: ${ip}`)
            if (ip != null) {
                const impressora = new Impressora(ip)
                impressora.imprimir(resp.data[0].Name, os.os)
                setLoading(false)
            } else {
                setLoading(false)
            }
        }
    }

    async function arquivarOS(reset, os) {
        reset()
        setLoading(true)
        const resp = await alterarStatusOS(os.id, refurbshCtx.usuario.Username)
        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível realizar a alocação da OS. Erro: ${JSON.stringify(resp.data)} `, 'ERR')
            Alert.alert('ERRO', `Não foi possível realizar a alocação da OS. Erro: ${JSON.stringify(resp.data)} `)
        } else {
            addLog(`OS (${JSON.stringify(os)}) arquivada.`, 'INFO')
            ToastAndroid.showWithGravity('OS arquivada', 1000, ToastAndroid.BOTTOM)
            carregarTodasOS()
        }
    }

    function atualizarLista() {
        setLoading(true)
        carregarTodasOS()
    }

    async function carregarTodasOS() {
        //setLoading(true);
        const resp = await getTodasOSExpedicao()

        if (resp.status != 200) {
            setLoading(false)
            addLog(`Não foi possível carregar as OS. Erro: ${JSON.stringify(resp.data)} `, 'ERR')
            Alert.alert('Erro', `Não foi possível carregar as OS. Erro: ${JSON.stringify(resp.data)} `)
        } else {
            let data = resp.data
            setListaOS(data)
            let arrayAux: any[] = []
            let count = 0
            data.forEach((item) => {
                count++
                if (count < 20) {
                    arrayAux.push(item)
                } else {
                    return
                }
            })
            setListaDisplay(arrayAux)
            setContadorLista(data.length)
            addLog(`Lista de OS carregada.`, 'INFO')
            ToastAndroid.showWithGravity('Lista de OS carregada', 1000, ToastAndroid.BOTTOM)
            setLoading(false)
        }
    }

    const _kbShow = () => {
        if (isFocused) setKeyboardPop(true)
    }

    const _kbHide = () => {
        if (isFocused) setKeyboardPop(false)
    }

    useEffect(() => {
        if (!isFocused) return
        if (pesquisaOP != '') {
            let listaFiltrada: any[] = []
            let count = 0
            listaOS.forEach((item: any) => {
                if (item.os.includes(pesquisaOP)) {
                    count++
                    if (count < 20) {
                        listaFiltrada.push(item)
                    }
                }
            })
            setListaDisplay(listaFiltrada)
            setContadorLista(count)
        } else {
            let arrayAux = []
            listaOS.forEach((item, index) => {
                if (index < 20) {
                    arrayAux.push(item)
                } else {
                    return
                }
            })
            setListaDisplay(arrayAux)
            setContadorLista(listaOS.length)
        }
    }, [pesquisaOP])

    useFocusEffect(
        useCallback(() => {
            if (!isFocused) {
                Keyboard.removeAllListeners('keyboardDidShow')
                Keyboard.removeAllListeners('keyboardDidHide')
                return
            }
            Keyboard.addListener('keyboardDidShow', _kbShow)
            Keyboard.addListener('keyboardDidHide', _kbHide)
            setModalDetalhes(false)
            setLoading(true)
            addLog('[TELA] Expedição - Consulta', 'INFO')
            carregarTodasOS()
        }, [isFocused])
    )

    return (
        <KeyboardAvoidingView behavior="padding" style={style.container}>
            <Modal
                isVisible={modalDetalhes}
                style={{
                    maxHeight: '50%',
                    minHeight: '50%',
                    marginTop: '30%',
                    backgroundColor: COLOR.defaultBackground,
                    borderRadius: 10,
                }}
                onBackButtonPress={() => setModalDetalhes(false)}
                onBackdropPress={() => setModalDetalhes(false)}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
            >
                <View
                    style={{
                        alignContent: 'center',
                        flexDirection: 'column',
                        display: 'flex',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 30,
                            fontWeight: '900',
                            color: COLOR.hilight,
                            textAlign: 'center',
                            marginBottom: 20,
                        }}
                    >
                        Detalhes
                    </Text>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: COLOR.text,
                            opacity: 0.5,
                            textAlign: 'center',
                        }}
                    >
                        OS
                    </Text>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: COLOR.text, textAlign: 'center' }}>
                        {opSelecionada.os}
                    </Text>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: COLOR.text,
                            opacity: 0.5,
                            textAlign: 'center',
                        }}
                    >
                        Local
                    </Text>
                    <Text style={{ fontSize: 24, fontWeight: '800', color: COLOR.text, textAlign: 'center' }}>
                        {opSelecionada.local}
                    </Text>
                    <View
                        style={{
                            alignContent: 'center',
                            flexDirection: 'row',
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: 20,
                        }}
                    >
                        <Pressable
                            style={{
                                backgroundColor: COLOR.backgroundDarker,
                                height: 40,
                                width: 40,
                                borderRadius: 20,
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                            onPress={() => closeModalDetails()}
                        >
                            <Icon name="angle-double-down" size={30} style={{ color: COLOR.text, marginTop: 5 }} />
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <LoadingScreen text={'Carregando'} show={loading} />
            <Background />
            <View style={style.mainContainer}>
                <View style={{ height: 120 }}>
                    <View style={style.backBtn}>
                        <RectButton style={{ height: 35, width: 35 }} onPress={() => navigation.push('Home')}>
                            <Icon name="arrow-alt-circle-left" size={35} style={{ color: COLOR.secondary, lineHeight: 35 }} />
                        </RectButton>
                        <RectButton style={{ height: 35, width: 20, marginLeft: 10 }} onPress={() => atualizarLista()}>
                            <Icon name="sync-alt" size={20} style={{ color: COLOR.secondary, lineHeight: 35 }} />
                        </RectButton>
                        <Text style={[style.menuTitle, { marginLeft: 10 }]}>Consulta</Text>
                    </View>
                    <View style={{ backgroundColor: COLOR.secondary, height: 50, borderRadius: 10 }}>
                        <View
                            style={{
                                alignContent: 'center',
                                flexDirection: 'row',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <TextInput
                                placeholder="Pesquisar OS"
                                placeholderTextColor={'#FFFFFF90'}
                                onChangeText={(t) => setPesquisaOP(t)}
                                keyboardType="numeric"
                                //value={searchOP}
                                style={[style.textInputTransparent, { marginLeft: 10, bottom: 0, width: '72%' }]}
                            />
                            <View style={{ marginLeft: 10, marginTop: 12 }}>
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontSize: 16,
                                        lineHeight: 20,
                                        backgroundColor: COLOR.hilight,
                                        padding: 5,
                                        borderRadius: 10,
                                    }}
                                >
                                    {listCount}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <ScrollView style={{ height: '100%' }}>
                    {listaDiplay.length == 0 ? (
                        <Text style={{ fontSize: 20, color: COLOR.text, textAlign: 'center' }}>
                            Nenhum resultado encontrado...
                        </Text>
                    ) : (
                        [
                            listaDiplay.map((item) => (
                                <ListItem.Swipeable
                                    rightContent={(reset) => (
                                        <ListItem.ButtonGroup
                                            buttons={[
                                                <Pressable
                                                    style={{ backgroundColor: '#3B44F6', height: 50, width: 50 }}
                                                    onPress={() => openDetailsModal(reset, item)}
                                                >
                                                    <Icon
                                                        name="info-circle"
                                                        size={25}
                                                        style={{ color: '#fff', textAlign: 'center', lineHeight: 50 }}
                                                    />
                                                    {/* <Text style={{ color: '#fff', width: '100%', textAlign: 'center' }}> Detalhes </Text> */}
                                                </Pressable>,
                                                <Pressable
                                                    style={{ backgroundColor: COLOR.hilight, height: 50, width: 50 }}
                                                    onPress={() => imprimirOS(reset, item)}
                                                >
                                                    <Icon
                                                        name="print"
                                                        size={25}
                                                        style={{ color: '#fff', textAlign: 'center', lineHeight: 50 }}
                                                    />
                                                    {/* <Text style={{ color: '#fff', width: '100%', textAlign: 'center' }}> Imprimir </Text> */}
                                                </Pressable>,
                                                <Pressable
                                                    style={{ backgroundColor: '#F87474', height: 50, width: 50 }}
                                                    onPress={() => arquivarOS(reset, item)}
                                                >
                                                    <Icon
                                                        name="archive"
                                                        size={25}
                                                        style={{ color: '#fff', textAlign: 'center', lineHeight: 50 }}
                                                    />
                                                    {/* <Text style={{ color: '#fff', width: '100%', textAlign: 'center' }}> Arquivar </Text> */}
                                                </Pressable>,
                                                <Pressable
                                                    style={{
                                                        backgroundColor: COLOR.backgroundDarker,
                                                        height: 50,
                                                        width: 50,
                                                    }}
                                                    onPress={() => reset()}
                                                >
                                                    <Icon
                                                        name="chevron-circle-right"
                                                        size={25}
                                                        style={{ color: '#fff', textAlign: 'center', lineHeight: 50 }}
                                                    />
                                                    {/* <Text style={{ color: '#fff', width: '100%', textAlign: 'center' }}> Fechar </Text> */}
                                                </Pressable>,
                                            ]}
                                            innerBorderStyle={{ width: 0 }}
                                            containerStyle={{
                                                backgroundColor: 'transparent',
                                                borderWidth: 0,
                                                minWidth: 200,
                                                maxWidth: 200,
                                            }}
                                            buttonContainerStyle={{ height: 50, width: 60 }}
                                        />
                                    )}
                                    containerStyle={{
                                        height: 50,
                                        margin: 0,
                                        marginBottom: 10,
                                        paddingTop: 0,
                                        paddingLeft: 10,
                                        paddingBottom: 0,
                                        backgroundColor: COLOR.backgroundDarker,
                                    }}
                                    rightWidth={200}
                                    key={item.id}
                                >
                                    <ListItem.Content style={{}}>
                                        <ListItem.Title>{item.os}</ListItem.Title>
                                        <ListItem.Subtitle>{item.local}</ListItem.Subtitle>
                                    </ListItem.Content>
                                    <Icon
                                        name="arrow-left"
                                        size={20}
                                        style={{ color: COLOR.secondary, textAlign: 'center', opacity: 0.5 }}
                                    />
                                </ListItem.Swipeable>
                            )),
                        ]
                    )}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

export default ExpedicaoConsulta

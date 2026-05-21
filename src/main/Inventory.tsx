import React, { useCallback, useState, useEffect, useContext } from 'react'
import Modal from 'react-native-modal'
import { COLOR } from '../styles/styles'
import { View, Text, Keyboard, Pressable, Alert, ToastAndroid, StyleSheet, StatusBar, Platform } from 'react-native'
import { RectButton, ScrollView, TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { ListItem } from '@rneui/themed'
import LoadingScreen from '../component/loadingScreen'
import { getStockByAddress, atualizaStock } from '../services/api'
import { addLog } from '../services/apiMicrosiga' // Certifique-se que o caminho está correto
import { RefurbshContext } from '../context/refurbshContext'

import ScannerModule from '../modules/ScannerModule' // Importação do módulo de Scanner

const Inventory = () => {
    const refurbshCtx = useContext(RefurbshContext)
    const navigation = useNavigation()
    const [pesquisaLocal, setPesquisaLocal] = useState<string>('')
    const [listaDisplay, setListaDisplay] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [isFocused, setIsFocused] = useState<boolean>(false)
    const [dadoEscaneado, setDadoEscaneado] = useState<string>('')
    const [modalDetalhes, setModalDetalhes] = useState<boolean>(false)
    const [modalDelete, setModalDelete] = useState<boolean>(false)
    const [quantidadeDeletar, setQuantidadeDeletar] = useState<string>('')
    const [erroQuantidade, setErroQuantidade] = useState<string | null>(null)

    const [opSelecionada, setOpSelecionada] = useState({
        id: '',
        total: 0,
        pn: '',
        description: '',
        status: '',
        address: '',
    })

    const VERDE_PROJETO = '#005954'

    // 1. Monitora o foco da tela para habilitar/desabilitar processos
    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true))
        const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false))
        return () => {
            unsubscribeFocus()
            unsubscribeBlur()
        }
    }, [navigation])

    // 2. Função principal de busca (Memoizada para evitar re-renderizações desnecessárias)
    const handleSearch = useCallback(
        async (valorBusca?: string) => {
            const endereco = valorBusca || pesquisaLocal
            if (!endereco || endereco.trim() === '') return

            setLoading(true)
            Keyboard.dismiss()

            try {
                const response = await getStockByAddress(endereco.trim())
                if (response.status === 200) {
                    setListaDisplay(response.data)
                    if (response.data.length === 0) {
                        ToastAndroid.show('Nenhum item encontrado.', ToastAndroid.SHORT)
                        addLog('Consulta de estoque', `Nenhum item para: ${endereco.trim()}`)
                    }
                } else {
                    Alert.alert('Erro', response.data || 'Erro ao consultar estoque.')
                    setListaDisplay([])
                }
            } catch (error) {
                Alert.alert('Erro', 'Falha na conexão com o servidor.')
                setListaDisplay([])
            } finally {
                setLoading(false)
                // IMPORTANTE: Não limpamos o pesquisaLocal aqui para o usuário saber o que buscou
            }
        },
        [pesquisaLocal]
    )

    // 3. Inicializa e Destrói o Scanner corretamente (Evita travar os botões)
    useFocusEffect(
        useCallback(() => {
            if (!isFocused) return

            ScannerModule.createScanner(setDadoEscaneado)

            return () => {
                // Se o seu módulo tiver stopScanner, chame-o aqui para liberar a memória
                // ScannerModule.stopScanner();
            }
        }, [isFocused])
    )

    // 4. Efeito que reage ao dado escaneado (Com trava de segurança)
    useEffect(() => {
        if (!isFocused || dadoEscaneado === '') return

        const processarLeitura = async () => {
            const leitura = dadoEscaneado
            setDadoEscaneado('') // Limpa IMEDIATAMENTE para evitar loop
            setPesquisaLocal(leitura)
            addLog('Scanner', `Dado escaneado: ${leitura}`)
            await handleSearch(leitura)
        }

        processarLeitura()
    }, [dadoEscaneado, isFocused, handleSearch])

    // 5. Funções dos Modais
    function openDetailsModal(reset, stock) {
        setOpSelecionada(stock)
        setModalDetalhes(true)
        reset()
    }

    function closeModalDetails() {
        setModalDetalhes(false)
        setOpSelecionada({
            id: '',
            total: 0,
            pn: '',
            description: '',
            status: '',
            address: '',
        })
    }

    function closeModalDelete() {
        setModalDelete(false)
        setQuantidadeDeletar('')
        setErroQuantidade(null)
        // Opcional: não limpamos opSelecionada aqui se quiser manter os dados no fundo
    }

    // 6. Função de Atualização de Estoque (Payload e Refetch)
    const handleAtualizaStock = async () => {
        const qtdParaRemover = parseInt(quantidadeDeletar)
        const disponivel = opSelecionada?.total || 0

        // 1. Validação local: Campo vazio ou zero
        if (isNaN(qtdParaRemover) || qtdParaRemover <= 0) {
            setErroQuantidade('Insira uma quantidade válida.')
            return
        }

        // 2. Validação local: Quantidade maior que o estoque disponível
        if (qtdParaRemover > disponivel) {
            setErroQuantidade(`A quantidade não pode ser maior que ${disponivel}`)
            return
        }

        // Se passou nas validações locais, limpamos o estado de erro
        setErroQuantidade(null)

        const payload = {
            pn: opSelecionada.pn,
            address: opSelecionada.address,
            quantity: qtdParaRemover,
            user: refurbshCtx.usuario.Username ? refurbshCtx.usuario.Username : 'E000000',
        }

        try {
            setLoading(true)
            console.log('Enviando Payload:', payload)

            // Chamada da API
            const response = await atualizaStock(payload)

            // 3. Tratativa do retorno da API
            if (response.status === 200 || response.status === 201) {
                // SUCESSO:
                ToastAndroid.show('Estoque atualizado com sucesso!', ToastAndroid.SHORT)

                // Fecha o modal e limpa os campos
                closeModalDelete()

                // Atualiza a lista principal para refletir os novos dados do banco
                if (typeof handleSearch === 'function') {
                    await handleSearch()
                }
            } else {
                // ERRO DE NEGÓCIO OU SERVIDOR (Ex: 400, 404, 500):
                // Tenta pegar a mensagem vinda do banco ou usa uma padrão
                const mensagemErro = response.data?.message || response.data || 'Erro ao processar atualização.'
                setErroQuantidade(mensagemErro)
            }
        } catch (error) {
            // ERRO DE CONEXÃO OU CRÍTICO:
            console.error('Erro no handleAtualizaStock:', error)
            Alert.alert('Erro', 'Falha na comunicação com o servidor.')
        } finally {
            setLoading(false)
        }
    }

    const handleCleanSearch = () => {
        setPesquisaLocal('')
        setListaDisplay([])
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

            <Modal
                isVisible={modalDetalhes}
                onBackButtonPress={closeModalDetails} // Alterado para sua função de limpeza
                onBackdropPress={closeModalDetails} // Alterado para sua função de limpeza
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                style={{ margin: 20 }} // Pequena margem para não encostar nas bordas
            >
                <View style={inventoryStyle.modalContent}>
                    {/* Cabeçalho */}
                    <View style={inventoryStyle.modalHeader}>
                        <Text style={inventoryStyle.modalTitle}>Detalhes do Item</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                        {/* Bloco PN */}
                        <View style={inventoryStyle.infoBlock}>
                            <Text style={inventoryStyle.label}>PN</Text>
                            <Text style={inventoryStyle.value}>{opSelecionada.pn}</Text>
                        </View>

                        {/* Bloco Descrição */}
                        <View style={inventoryStyle.infoBlock}>
                            <Text style={inventoryStyle.label}>Descrição</Text>
                            <Text style={[inventoryStyle.value, inventoryStyle.descriptionValue]}>
                                {/* Fallback caso a descrição venha com o ponto final do log anterior */}
                                {opSelecionada.description}
                            </Text>
                        </View>

                        {/* Bloco Local */}
                        <View style={inventoryStyle.infoBlock}>
                            <Text style={inventoryStyle.label}>Localização</Text>
                            <Text style={inventoryStyle.value}>{opSelecionada.address}</Text>
                        </View>

                        {/* Bloco Total */}
                        <View style={inventoryStyle.infoBlock}>
                            <Text style={inventoryStyle.label}>Total em Estoque</Text>
                            <View style={inventoryStyle.totalBadge}>
                                <Text style={inventoryStyle.totalValueModal}>{opSelecionada.total}</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Botão de Fechar Fixo na Base */}
                    <Pressable
                        style={({ pressed }) => [
                            inventoryStyle.closeButton,
                            { opacity: pressed ? 0.7 : 1, width: '100%', marginTop: 20 },
                        ]}
                        onPress={closeModalDetails}
                    >
                        <Text style={inventoryStyle.closeButtonText}>FECHAR</Text>
                    </Pressable>
                </View>
            </Modal>

            <Modal isVisible={modalDelete} onBackdropPress={() => setModalDelete(false)}>
                <View style={inventoryStyle.modalContent}>
                    <Text style={inventoryStyle.modalTitle}>Remover do Estoque</Text>
                    <Text style={{ marginBottom: 10, color: '#666' }}>Disponível: {opSelecionada.total} unidades</Text>
                    <TextInput
                        style={[
                            inventoryStyle.inputQuantidade,
                            // Aplica borda vermelha apenas se existir um erro
                            erroQuantidade ? { borderColor: '#FF0000', borderWidth: 1.5 } : {},
                        ]}
                        placeholder="Qtd para remover"
                        keyboardType="numeric"
                        value={quantidadeDeletar}
                        onChangeText={(text) => {
                            setQuantidadeDeletar(text)
                            // Limpa o erro assim que o usuário começa a corrigir o valor
                            if (erroQuantidade) setErroQuantidade(null)
                        }}
                        selectionColor="#005954" // Cor do cursor combinando com seu app
                        autoFocus
                    />

                    {erroQuantidade && (
                        <View style={inventoryStyle.erroContainer}>
                            <Text style={{ marginRight: 8 }}>⚠️</Text>
                            <Text style={inventoryStyle.erroTexto}>{erroQuantidade}</Text>
                        </View>
                    )}

                    <View style={inventoryStyle.modalFooter}>
                        <Pressable style={[inventoryStyle.btnModal, inventoryStyle.btnCancel]} onPress={closeModalDelete}>
                            <Text style={inventoryStyle.btnTextCancel}>CANCELAR</Text>
                        </Pressable>

                        <Pressable style={[inventoryStyle.btnModal, inventoryStyle.btnConfirm]} onPress={handleAtualizaStock}>
                            <Text style={inventoryStyle.btnTextConfirm}>REMOVER</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {loading && <LoadingScreen show={loading} text="Carregando estoque..." />}

            <View style={inventoryStyle.topBar}>
                <Pressable onPress={() => navigation.canGoBack() && navigation.goBack()}>
                    <Icon name="arrow-circle-left" size={36} color={VERDE_PROJETO} />
                </Pressable>
                <Icon onPress={handleCleanSearch} name="sync-alt" size={24} color={VERDE_PROJETO} style={{ marginLeft: 15 }} />
                <Text style={[inventoryStyle.topBarTitle, { color: VERDE_PROJETO }]}> Consulta</Text>
            </View>

            <View style={inventoryStyle.searchArea}>
                <View style={[inventoryStyle.searchContainer, { backgroundColor: VERDE_PROJETO }]}>
                    <Icon name="barcode" size={20} color="rgba(255,255,255,0.7)" style={{ marginRight: 10 }} />

                    <TextInput
                        style={inventoryStyle.input}
                        placeholder="Pesquisar Local"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={pesquisaLocal}
                        onChangeText={setPesquisaLocal}
                        onSubmitEditing={() => handleSearch()}
                        autoCapitalize="characters"
                    />
                    <Pressable onPress={() => handleSearch()} style={inventoryStyle.searchInnerButton}>
                        <Icon name="search" size={16} color={VERDE_PROJETO} />
                    </Pressable>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }}>
                {listaDisplay.map((item, index) => (
                    <View key={index} style={inventoryStyle.itemWrapper}>
                        <ListItem.Swipeable
                            containerStyle={inventoryStyle.itemContainer}
                            rightWidth={180}
                            rightContent={(reset) => (
                                <View style={inventoryStyle.sliderShape}>
                                    <RectButton style={inventoryStyle.btnBlue} onPress={() => openDetailsModal(reset, item)}>
                                        <Icon name="info-circle" size={22} color="#fff" />
                                    </RectButton>
                                    <RectButton
                                        style={inventoryStyle.btnGreen}
                                        onPress={() => {
                                            setOpSelecionada(item) // 'item' é o objeto da lista (contém pn, address, etc)
                                            setModalDelete(true) // Abre o modal de quantidade
                                            reset() // Fecha o swipe (slider)
                                        }}
                                    >
                                        <Icon name="trash-alt" size={22} color="#fff" />
                                    </RectButton>
                                    <RectButton style={inventoryStyle.btnRed} onPress={() => reset()}>
                                        <Icon name="chevron-left" size={22} color="#fff" />
                                    </RectButton>
                                </View>
                            )}
                        >
                            <ListItem.Content>
                                <View style={inventoryStyle.rowContent}>
                                    <View>
                                        <Text style={inventoryStyle.pnText}>{item.pn}</Text>
                                        <Text style={inventoryStyle.addressText}>{item.address}</Text>
                                    </View>
                                    <View style={inventoryStyle.totalContainer}>
                                        <Text style={inventoryStyle.totalLabel}>QTD</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={inventoryStyle.totalValue}>{item.total}</Text>
                                            <Icon
                                                name="arrow-left"
                                                size={14}
                                                color="#999"
                                                style={{ marginLeft: 8, opacity: 0.5 }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </ListItem.Content>
                        </ListItem.Swipeable>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

const inventoryStyle = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    topBarTitle: { fontSize: 28, fontWeight: 'bold' },
    searchArea: { paddingHorizontal: 15, marginBottom: 10 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 60,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 18,
        borderBottomWidth: 1.5,
        borderBottomColor: 'rgba(255,255,255,0.6)',
        marginRight: 10,
        paddingBottom: 2,
    },
    searchInnerButton: {
        backgroundColor: '#fff',
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemWrapper: {
        marginHorizontal: 15,
        marginVertical: 4,
        borderRadius: 5, // Este valor deve ser o mesmo usado no btnRed
        elevation: 2,
        backgroundColor: '#D3D3D3',
        overflow: 'hidden', // Importante para o slider respeitar o arredondamento do pai
    },
    itemContainer: {
        backgroundColor: '#D3D3D3',
        paddingVertical: 10,
    },
    rowContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    pnText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    addressText: { fontSize: 14, color: '#666' },
    totalContainer: { alignItems: 'flex-end' },
    totalLabel: { fontSize: 10, color: '#999', fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#005954' },
    sliderShape: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-end',
    },
    btnBlue: {
        backgroundColor: '#2196F3',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnGreen: {
        backgroundColor: '#4CAF50',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnRed: {
        backgroundColor: '#F44336',
        width: 60,
        justifyContent: 'center',
        alignItems: 'center',
        // AJUSTE AQUI: Arredonda apenas o canto superior e inferior direito
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    modalHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLOR.hilight,
        textAlign: 'center',
    },
    infoBlock: {
        marginBottom: 18,
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#888', // Cinza médio para rótulos
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
        color: COLOR.text,
        textAlign: 'center',
    },
    descriptionValue: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22, // Melhor legibilidade para textos longos
        color: '#444',
    },
    totalBadge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 10,
    },
    totalValueModal: {
        fontSize: 28,
        fontWeight: '900',
        color: '#005954', // Sua cor principal
    },
    closeButton: {
        backgroundColor: '#005954', // Seu VERDE_PROJETO
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    btnModal: {
        flex: 1,
        height: 48,
        borderRadius: 8, // Arredondamento suave e igual para ambos
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2, // Sombra leve para Android
    },
    btnCancel: {
        backgroundColor: '#BDBDBD',
        marginRight: 8, // Espaçamento entre eles
    },
    btnConfirm: {
        backgroundColor: '#005954',
        marginLeft: 8, // Espaçamento entre eles
    },
    btnTextModal: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900', // Deixa o texto mais "forte" como na sua imagem
        textTransform: 'uppercase', // Garante que fique em caixa alta
    },
    inputQuantidade: {
        borderWidth: 1,
        borderColor: '#DDD',
        width: '100%',
        borderRadius: 10,
        height: 55,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
        color: '#333',
        marginTop: 15,
        // ADICIONE ESTA LINHA ABAIXO:
        paddingHorizontal: 20,
    },

    // Caso você queira cores diferentes para os textos dos botões (Opcional)
    // Se não usar, pode usar apenas o 'btnTextModal' que você já tem para ambos
    btnTextCancel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    btnTextConfirm: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        alignSelf: 'center', // Centraliza abaixo do input
    },
    modalContent: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        // Remova 'height' fixo se houver. Use 'minHeight' se quiser um tamanho padrão
        width: '90%',
        alignSelf: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20, // Espaço entre o erro/input e os botões
        gap: 10, // Se estiver usando uma versão recente do RN
    },
    erroContainer: {
        backgroundColor: '#FEE2E2',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        marginTop: 10,
    },
    erroTexto: {
        color: '#991B1B',
        fontSize: 12,
        flexShrink: 1, // Importante para o texto quebrar linha se for grande
    },
})

export default Inventory

import { Alert, ToastAndroid } from 'react-native'
import TcpSocket from 'react-native-tcp-socket'
import Socket from 'react-native-tcp-socket/lib/types/Socket'
import { addLog } from '../services/apiMicrosiga'
import { getIp } from '../services/storage'

export class Impressora {
    ip: string
    port: number
    tcpClient: Socket

    constructor(_ip: string) {
        this.ip = _ip
        this.port = 9100
    }

    async imprimir(customer: string, order: string) {
        try {
            addLog('IMPRIMINDO...')
            let tcpParams = {
                port: this.port,
                host: this.ip,
                timeout: 1,
                mode: 'IPL',
            }
            addLog(`Parâmetros da Impressora: ${JSON.stringify(tcpParams)}`)
            if (customer.length > 38) customer = customer.substring(0, 37)
            this.tcpClient = TcpSocket.createConnection(tcpParams, () => {
                let strImpressao = `<STX>R<ETX><STX><ESC>C<SI>W358<ETX><STX><ESC>P<ETX><STX>F*<ETX><STX>B1;`
                strImpressao += `f3;o55,74;c6,0,0,2;w2;h29;d3,`
                strImpressao += `${order}<ETX><STX>H2;f3;o25,151;c26;b0;h9;w9;d3,`
                strImpressao += `${order}<ETX><STX>H3;f3;o84,36;c26;b1;h7;w7;d3,`
                strImpressao += `${customer}<ETX><STX>D0<ETX><STX>R<ETX><STX><SI>l13<ETX><STX><ESC>E*,1<CAN><ETX><STX><RS>1<US>1<ETB><ETX>`
                this.impressaoTCP(strImpressao)
            })

            this.tcpClient.on('data', (data) => {
                addLog(`Mensagem recebida: ${JSON.stringify(data)}`)
            })
            this.tcpClient.on('error', (error) => {
                addLog(`Erro ao imprimir: ${JSON.stringify(error)}`)
                Alert.alert('ERRO', `Não foi possível realizar a impressão: ${JSON.stringify(error)}`)
            })
            this.tcpClient.on('close', () => {
                addLog(`Conexão encerrada`)
            })
        } catch (e) {
            addLog(`ERRO NA IMPRESSÃO: ${JSON.stringify(e)}`)
            Alert.alert('ERRO', `Não foi possível realizar a impressão: ${JSON.stringify(e)}`)
        }
    }

    async impressaoTCP(strImpressao) {
        addLog(`String a ser impressa: ${strImpressao}`)
        await this.tcpClient.write(strImpressao)
        setTimeout(() => {
            this.tcpClient.destroy()
        }, 2000)
        ToastAndroid.showWithGravity('Etiqueta impressa', 1000, ToastAndroid.BOTTOM)
        addLog('PRONTO')
        return
    }
}

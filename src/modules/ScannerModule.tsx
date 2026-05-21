import { NativeModules, DeviceEventEmitter } from 'react-native'

export default class ScannerModule {
    static instance = null
    static leituraState
    static listener

    static eventListener(event) {
        console.log('EVT: ' + JSON.stringify(event))
        this.leituraState(event.data)
    }

    static getInstance() {
        if (ScannerModule.instance == null) {
            console.log('Instanciando novo modulo')
            ScannerModule.instance = NativeModules.HoneywellScannerModule
        } else console.log('Pegando instancia singleton')

        if (this.instance == null) {
            console.log('Instancia nula')
            throw 'Instancia nula'
        }

        return this.instance
    }

    static async readerAvailable(): Promise<boolean> {
        console.log('Chamei o reader available SWIOD')
        let avail = await this.instance.readerAvailable()
        console.log('CHAMAI O ACAIL : ' + avail)
        if (this.instance.readerAvailable() == false) console.log('>>>>>>>> Sem reader')
        else console.log('>>>>>>>>> AQUI TEM reader')
        return avail
    }

    static createScanner(leitura) {
        if (ScannerModule.instance == null)
            this.listener = DeviceEventEmitter.addListener('barcodeReadSuccess', this.eventListener.bind(this))
        this.leituraState = leitura
        this.getInstance()
    }
}

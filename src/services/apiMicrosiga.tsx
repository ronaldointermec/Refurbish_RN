import pkg from '../../package.json'
import DeviceInfo from 'react-native-device-info'
import { ToastAndroid } from 'react-native'

let user: string = 'LOGGED OUT'
let device: string = 'NOT SPECIFIED'
let alerted: boolean = false
let serverAddr = ''

export async function post(url, body, headers) {
    let time = new Date()
    let id = time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
    let rota = url.split('/')[1].includes('?') ? url.split('/')[1].split('?')[0] : url.split('/')[1]

    let fullURL = serverAddr + '/api/' + url
    addLog(id + '; POST URL: ' + fullURL, 'INFO', rota)
    addLog(id + '; BODY: ' + JSON.stringify(body), 'INFO', rota)
    addLog(id + '; HEADERS: ' + JSON.stringify(headers), 'INFO', rota)

    let res = await fetch(fullURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    })
        .then((response) => {
            const statusCode = response.status
            const data = response.json().catch((error) => 'OK')
            return Promise.all([statusCode, data])
        })
        .then((response) => {
            let resp = {
                status: response[0],
                data: response[1].message ? response[1].message : response[1],
            }
            addLog(id + '; RESPOSTA: ' + JSON.stringify(resp), 'INFO', rota)
            return resp
        })
        .catch((error) => {
            addLog(id + '; ERRO: API DOWN! Falha ao conectar em ' + serverAddr + ' - ' + error, 'ERR', rota)
            return {
                status: 503,
                data: 'ERRO: API DOWN! Falha ao conectar em ' + serverAddr + ' - ' + error,
            }
        })
    return res as unknown
}

async function postAddLog(body) {
    //const url = 'http://hic032553.dc.honeywell.com/api/Log?topic=collector_refurbish'
    const url = 'http://hic041464.dc.honeywell.com/api/Log?topic=collector_refurbish'
    const headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Cache-Control': 'no-cache',
    }

    let res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    })
        .then((response) => {
            const statusCode = response.status
            const data = response.json().catch((error) => 'OK')
            return Promise.all([statusCode, data])
        })
        .then((response) => {
            let resp = {
                status: response[0],
                data: response[1].message ? response[1].message : response[1],
            }
            return resp
        })
        .catch((error) => {
            return {
                status: 503,
                data: 'ERRO: API DOWN! Falha ao conectar em ' + serverAddr + '. Erro: ' + error,
            }
        })
    return res as unknown
}

export function addLog(msg: string, sev = 'INFO', rota?) {
    console.log(`[ADD LOG] ${msg}`)
    let logJSON = {
        log_message: msg,
        user: user,
        app: 'REFURBISH',
        device: device,
        version: pkg.version,
        severity: sev,
        env: 'PROD',
        route: rota ? rota : null,
    }
    const body = {
        Stringfy: JSON.stringify(logJSON),
    }
    postAddLog(body).then((resp: any) => {
        if (resp.status != 200) {
            if (!alerted) {
                ToastAndroid.showWithGravity('ALERTA: Erro ao enviar os logs!', 1500, ToastAndroid.BOTTOM)
                alerted = true
            }
        }
    })
}

export function setUserAPI(_user: string) {
    user = _user
}

export async function getDeviceNameAPI() {
    let _device = DeviceInfo.getIpAddressSync()
    device = _device
}

export async function oAuthAuthorize() {
    try {
        let url =
            'https://authn.honeywell.com/as/authorization.oauth2?client_id=Client_336&response_type=code&redirect_uri=https://oauthapp.honeywell.com'
        addLog('OAUTH: ' + url)

        let res = await fetch(url, { method: 'GET' })
        addLog('RESP: ' + JSON.stringify(res))

        return res
    } catch (e) {
        return 'ERRO GET: ' + e
    }
}

export async function validateUser(id: string, senha) {
    id = id.toUpperCase()
    serverAddr = 'http://hic044635.dc.honeywell.com:8080'

    if (id == 'HOMOLOG') {
        return { data: { message: 'Usuário inválido' }, status: 503 }
    }
    var usr = {
        user: id,
        md5Pass: senha,
    }
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Cache-Control': 'no-cache',
    }
    var url = 'User/Validate'

    try {
        let res = await post(url, usr, headers)
        let resp = JSON.parse(JSON.stringify(res))
        if (resp.status != 200) {
            return { data: { message: 'ERRO: ' + resp.data }, status: resp.status }
        }
        return { data: { message: resp.data }, status: resp.status }
    } catch (error) {
        return { data: { message: JSON.stringify(error) }, status: 500 }
    }
}

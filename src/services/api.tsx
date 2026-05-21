import { addLog } from './apiMicrosiga'

let serverAddr = 'http://hic041474:8096' //endereço de prod Refurbish
// let serverAddr = 'http://10.80.171.246:3000' //endereço de dev Refurbish
let server1003 = 'http://hic044635.dc.honeywell.com/api' // endreço de prod Microssiga

async function get(url, headers) {
    let time = new Date()
    let id = time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
    let rota = url.split('/')[1].includes('?') ? url.split('/')[1].split('?')[0] : url.split('/')[1]

    addLog(id + '; GET URL: ' + url, 'INFO', rota)
    addLog(id + '; HEADERS: ' + JSON.stringify(headers), 'INFO', rota)

    let res = await fetch(url, {
        method: 'GET',
        headers: headers,
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
            if (JSON.stringify(resp).length > 10000) {
                addLog(id + '; RESPOSTA: A API RESPONDEU UMA LISTA DE TAMANHO MAIOR QUE 10000', 'INFO', rota)
            } else {
                addLog(id + '; RESPOSTA: ' + JSON.stringify(resp), 'INFO', rota)
            }
            return resp
        })
        .catch((error) => {
            addLog(id + '; ERRO: API DOWN! Falha ao conectar em ' + serverAddr + ' - ' + error, 'ERR', rota)
            return {
                status: 503,
                data: 'ERRO: API DOWN! Falha ao conectar em ' + serverAddr,
            }
        })
    return res
}

async function post(url, body, headers) {
    let time = new Date()
    let id = time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
    let rota = url.split('/')[1].includes('?') ? url.split('/')[1].split('?')[0] : url.split('/')[1]

    addLog(id + '; POST URL: ' + url, 'INFO', rota)
    addLog(id + '; BODY: ' + JSON.stringify(body), 'INFO', rota)
    addLog(id + '; HEADERS: ' + JSON.stringify(headers), 'INFO', rota)

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
            if (JSON.stringify(resp).length > 10000) {
                addLog(id + '; RESPOSTA: A API RESPONDEU UMA LISTA DE TAMANHO MAIOR QUE 10000', 'INFO', rota)
            } else {
                addLog(id + '; RESPOSTA: ' + JSON.stringify(resp), 'INFO', rota)
            }
            return resp
        })
        .catch((error) => {
            addLog(id + '; ERRO: API DOWN! Falha ao conectar em ' + serverAddr + ' - ' + error, 'ERR', rota)
            return {
                status: 503,
                data: 'ERRO: API DOWN! Falha ao conectar em ' + serverAddr,
            }
        })
    return res
}

export async function getTodasOSExpedicao() {
    let url = `${serverAddr}/refurbish/shipment`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        let resp = await get(url, headers)
        if (resp.status == 200) {
            return { status: resp.status, data: resp.data }
        } else {
            return { status: resp.status, data: 'Erro ao fazer a requisição.' }
        }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function alterarStatusOS(id, user) {
    let time = new Date()
    let idLog = time.setMinutes(time.getMinutes() - time.getTimezoneOffset())
    let url = `${serverAddr}/refurbish/shipment`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }
    let body = {
        id: id,
        status_id: 3,
        updated_by: user,
    }
    let rota = url.split('/')[1].includes('?') ? url.split('/')[1].split('?')[0] : url.split('/')[1]

    addLog(idLog + '; FETCH URL: ' + url, 'INFO', rota)
    addLog(idLog + '; HEADERS: ' + JSON.stringify(headers), 'INFO', rota)

    try {
        let resp = await fetch(url, {
            method: 'PATCH',
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
                    data: 'ERRO: API DOWN! Falha ao conectar em ' + serverAddr,
                }
            })

        return { status: resp.status, data: JSON.stringify(resp.data) }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function alterarLocalOS(id, body, user) {
    addLog('ALTERADO LOCAL DA OS COM ID: ' + id, 'INFO')
    try {
        let resp = await alterarStatusOS(id, user)
        if (resp.status != 200) {
            return { status: resp.status, data: resp.data }
        } else {
            let respAloc = await alocarOS(body)
            return { status: respAloc.status, data: respAloc.data }
        }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function getOSPeloNumero(os) {
    let url = `${serverAddr}/refurbish/shipment/${os}`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        let resp = await get(url, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function alocarOS(body) {
    let url = `${serverAddr}/refurbish/shipment`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        const resp = await post(url, body, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function getOSLabPeloNumero(os) {
    let url = `${serverAddr}/refurbish/shipmentConsultaOS/`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    let body = {
        os: os,
    }

    try {
        const resp = await post(url, body, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function cadastrarLocal(body) {
    let url = `${serverAddr}/refurbish/localizations`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        const resp = await post(url, body, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function getDescricaoPN(pn) {
    let rotaDesc = `${server1003}/refurbish/getPartnumberInfo?partnumber=${pn}`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        let resp = await get(rotaDesc, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function cadastrarPN(body) {
    let rota = `${serverAddr}/refurbish/parts`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        const resp = await post(rota, body, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function cadastrarAlocacao(body) {
    let rota = `${serverAddr}/refurbish/partlocalizations`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        const resp = await post(rota, body, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function getOSInfo(os) {
    let rota = `${server1003}/refurbish/getOsInfo?serviceOrder=${os}`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        let resp = await get(rota, headers)
        return { status: resp.status, data: resp.data }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

export async function getStockByAddress(address) {
    let url = `${serverAddr}/refurbish/report/posicaoEstoque/${address}`
    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        let resp = await get(url, headers)
        if (resp.status == 200) {
            return { status: resp.status, data: resp.data }
        } else {
            return { status: resp.status, data: 'Erro ao fazer a requisição.' }
        }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO: ' + JSON.stringify(e), 'ERR')
        return { status: 503, data: JSON.stringify(e) }
    }
}

// Importante: Verifique se você importou a função 'post' do seu arquivo de api

export async function atualizaStock(payload) {
    // 1. Ajuste na URL (se o endpoint exigir o caminho completo)
    let url = `${serverAddr}/refurbish/report/posicaoEstoque/update`

    console.log('Payload para atualização de estoque:', payload) // Log do payload para depuração

    let headers = {
        'Content-Type': 'application/json',
        Accept: '*/*',
    }

    try {
        // 2. Mudança para POST e inclusão do payload
        // Geralmente a ordem é: post(url, body, headers)
        let resp = await post(url, payload, headers)

        if (resp.status == 200 || resp.status == 201) {
            return {
                status: resp.status,
                data: resp.data,
            }
        } else {
            // 3. Melhoria na mensagem de erro (usa a resposta do servidor se disponível)
            return {
                status: resp.status,
                data: resp.data || 'Erro ao atualizar o estoque no servidor.',
            }
        }
    } catch (e) {
        addLog('ERRO NA REQUISIÇÃO POST: ' + JSON.stringify(e), 'ERR')
        return {
            status: 503,
            data: 'Falha na conexão com o servidor.',
        }
    }
}

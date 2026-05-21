export class mockResponse {
    URL: string
    data: any

    constructor(URL, data: any) {
        this.URL = URL
        this.data = data
    }

    catch() {
        return getRespostaAPI(this.URL, this.data)
    }
}

export function getRespostaAPI(url: string, data: any = null) {
    if (url.includes('Usuario')) {
        let access = false
        access = data == 'USR'

        return {
            message: {
                access: access,
            },
            status: access ? 200 : 404,
        }
    } else {
        return 'Metodo em ' + url + ' nao implementado'
    }
}

import AsyncStorage from '@react-native-async-storage/async-storage'
import { addLog } from '../services/apiMicrosiga'

export async function setUser(user: any) {
    try {
        await AsyncStorage.setItem('UserData', JSON.stringify(user))
        return true
    } catch (error) {
        addLog('Falha ao salvar usuário no storage\n' + error)
        return false
    }
}

//{"Code":3,"Name":"RONALDO SILVA","Username":"E841371","IdDepartment":13,"Email":"ronaldo.silva2@honeywell.com","Active":true,"Access":{"Transfer":false}}
export async function getUser() {
    try {
        const resp = await AsyncStorage.getItem('UserData')
        if (resp != null) {
            let user = JSON.parse(resp)
            addLog('GET USER: ' + JSON.stringify(user))
            return user
        } else {
            return null
        }
    } catch (error) {
        addLog('error ao recuperar usuário do  storage')
        return null
    }
}

export async function removeUser(navigation: any) {
    try {
        await AsyncStorage.removeItem('UserData')
        navigation.navigate('Login')
    } catch (error) {
        addLog(error)
    }
}

export async function setIp(ip: any) {
    try {
        AsyncStorage.setItem('IpAddress', ip)
        addLog('Sucesso ao salvar IP no storage')
        return true
    } catch (error) {
        addLog('Falha ao salvar IP no storage\n' + error)
        return false
    }
}

export async function getIp() {
    try {
        const ip = await AsyncStorage.getItem('IpAddress')

        if (ip != null) {
            addLog(`IP Address: ${ip}`)
            return ip
        } else return null
    } catch (error) {
        addLog('error ao recuperar IP do  storage')
        return null
    }
}

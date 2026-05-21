import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import Login from '../main/login'
import Home from '../main/home'
import HeaderRight from './headerRight'
import AlocarOS from '../main/alocarOS'
import ExpedicaoConsulta from '../main/expedicaoConsulta'
import LabRemover from '../main/labRemover'
import CadastrarPN from '../main/cadastrarPN'
import CadastrarAlocacao from '../main/cadastrarAlocacao'
import CadastrarLocal from '../main/cadastrarLocal'
import Inventory from '../main/Inventory'

export type RootStackParamList = {
    navigate: (value: string) => void
    addListener: (value: string, foo: any) => void
}

const AppStack = createStackNavigator()

const Routes = () => {
    return (
        <NavigationContainer>
            <AppStack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerMode: 'screen',
                    headerStyle: {
                        minHeight: 65,
                        maxHeight: 65,
                        backgroundColor: '#c8042c',
                    },
                    headerTintColor: '#FFFFFF',
                    cardStyle: {
                        backgroundColor: '#f0f0f5',
                    },
                }}
            >
                <AppStack.Screen
                    name="Login"
                    component={Login}
                    options={{
                        title: 'Login',
                        headerShown: false,
                        headerRight: () => <HeaderRight buttons={['Scanner']} />,
                        headerLeft: null,
                    }}
                />
                <AppStack.Screen
                    name="Home"
                    component={Home}
                    options={{
                        title: 'DashBoard',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="AlocarOS"
                    component={AlocarOS}
                    options={{
                        title: 'Alocar OS',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="ExpedicaoConsulta"
                    component={ExpedicaoConsulta}
                    options={{
                        title: 'Expedição - Consulta',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="Inventory"
                    component={Inventory}
                    options={{
                        title: 'Inventário - Consulta',
                        headerShown: false,
                    }}
                />

                <AppStack.Screen
                    name="LabRemover"
                    component={LabRemover}
                    options={{
                        title: 'Lab - Remover',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="CadastrarPN"
                    component={CadastrarPN}
                    options={{
                        title: 'Cadastrar PN',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="CadastrarLocal"
                    component={CadastrarLocal}
                    options={{
                        title: 'Cadastrar Local',
                        headerShown: false,
                    }}
                />
                <AppStack.Screen
                    name="CadastrarAlocacao"
                    component={CadastrarAlocacao}
                    options={{
                        title: 'Cadastrar Alocacao',
                        headerShown: false,
                    }}
                />
            </AppStack.Navigator>
        </NavigationContainer>
    )
}
export default Routes

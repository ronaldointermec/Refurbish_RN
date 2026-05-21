import React from 'react'
import Modal from 'react-native-modal'
import { View, Text, Image } from 'react-native'

const LoadingScreen = (props) => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <Modal
                isVisible={props.show}
                coverScreen={true}
                statusBarTranslucent={true}
                style={{ position: 'absolute', bottom: 0, top: 0, left: 0, right: 0 }}
            >
                <View
                    style={{
                        backgroundColor: '#00000005',
                        alignContent: 'center',
                        flexDirection: 'column',
                        display: 'flex',
                        justifyContent: 'center',
                        height: '100%',
                        width: '100%',
                    }}
                >
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
                        <Image
                            style={{ width: 40, height: 40, resizeMode: 'contain' }}
                            source={require('../assets/loading.gif')}
                        />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 }}>
                        {props.text}
                    </Text>
                </View>
            </Modal>
        </View>
    )
}

export default LoadingScreen

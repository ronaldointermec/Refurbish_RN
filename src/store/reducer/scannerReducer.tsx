const INITIAL_STATE = {
    read: '',
    buttonScanner: false,
    scannerMock: false,
}

const scannerReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'SCANNERREAD':
            return { ...state, read: action.read }
        case 'SCANNERBUTTON':
            return { ...state, buttonScanner: action.buttonScanner }
        case 'SCANNERMOCK':
            return { ...state, scannerMock: action.scannerMock }
        default:
            return state
    }
}
export default scannerReducer

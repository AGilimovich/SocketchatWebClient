/**
 * Created by Aleksandr on 23.01.2017.
 */
angular.module('socketChat.constants', [])

    .constant('CONNECTION_STATUS', {
        CONNECTED: {code: 0, message: "Connected"},
        NO_CONNECTION: {code: 1, message: "No connection"}
    })
    .constant('MESSAGE_TYPE', {
        AUTH: 0,
        CHAT: 1,
        CONTACTS: 2,
        REGISTRATION: 3
    })
    .constant('REG_STATUS', {
        REGISTERED: {code: 0, description: "Successfully registered"},
        ILLEGAL_PASSWORD: {code: 1, description: "Illegal password"},
        ILLEGAL_NAME: {code: 2, description: "Illegal name"},
        ILLEGAL_CREDENTIALS: {code: 3, description: "Illegal name and password"},
        NAME_EXISTS: {code: 4, description: "User with entered name already exists"}
    })
    .constant('AUTH_STATUS', {
        AUTHENTICATED: {code: 0, description: "Successfully authenticated"},
        INVALID_CREDENTIALS: {code: 1, description: "Invalid credentials"}
    })


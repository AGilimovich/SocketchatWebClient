// 'use strict';

angular.module('socketChat.services', [])
    .factory('ConnectionService', function (MessageParserService) {
        var socket;
        const CONNECTION_STATUS = {
            CONNECTED: {code: 0, message: "Connected"},
            NO_CONNECTION: {code: 1, message: "No connection"}
        }

        var connectionStatus = CONNECTION_STATUS.NO_CONNECTION;

        return {
            connect: function (server, onConnect, onMessage, onError) {
                socket = new WebSocket(server);
                socket.onopen = function () {
                    //console.log("opened");
                    connectionStatus = CONNECTION_STATUS.CONNECTED;
                    onConnect();
                }
                socket.onmessage = function (message) {
                    //console.log("received: " + message);
                    MessageParserService.parse(message, onMessage);

                }
                socket.onerror = function (e) {
                    console.log("error");
                    onError();
                }
                socket.onclose = function (e) {
                    console.log("closed" + e.code + e.reason);
                    connectionStatus = CONNECTION_STATUS.NO_CONNECTION;
                }

                return socket;
            },

            CONNECTION_STATUS: function () {
                return CONNECTION_STATUS;
            },
            send: function (message) {
                if (socket != undefined) {
                    console.log(JSON.stringify(message));
                    socket.send(JSON.stringify(message));
                }
            },
            getStatus: function () {
                return connectionStatus;
            }


        }
    })


    .factory('MessageFormatterService', function () {
        var MESSAGE_TYPE = {
            AUTH: 0,
            CHAT: 1,
            CONTACTS: 2,
            REGISTRATION: 3
        }

        function ChatMessage(receiver, content) {
            this.type = MESSAGE_TYPE.CHAT;
            this.receiver = receiver.id;
            this.content = content;
        }

        function AuthMessage(name, password) {
            this.type = MESSAGE_TYPE.AUTH;
            this.name = name;
            this.password = password;
        }

        function RegMessage(name, password) {
            this.type = MESSAGE_TYPE.REGISTRATION;
            this.name = name;
            this.password = password;
        }

        return {
            MESSAGE_TYPE: function () {
                return MESSAGE_TYPE;
            },
            newChatMessage: function (receiver, content) {
                return new ChatMessage(receiver, content);
            },
            newAuthMessage: function (name, password) {
                return new AuthMessage(name, password);
            },
            newRegMessage: function (name, password) {
                return new RegMessage(name, password);
            }
        }
    })
    .factory('ChatService', function () {
        return {
            chat: function (receiver, content) {
                if (AuthenticationService.getAuthStatus() === AuthenticationService.AUTH_STATUS().AUTHENTICATED)
                    ConnectionService.sendMessage(MessageFormatterService.newChatMessage(receiver, content));
            }
        }
    })

    .
    constant("REG_STATUS", {
        REGISTERED: {code: 0, description: "Successfully registered"},
        ILLEGAL_PASSWORD: {code: 1, description: "Illegal password"},
        ILLEGAL_NAME: {code: 2, description: "Illegal name"},
        ILLEGAL_CREDENTIALS: {code: 3, description: "Illegal name and password"},
        NAME_EXISTS: {code: 4, description: "User with entered name already exists"}

    })

    .factory('RegistrationService', function (MessageFormatterService) {
        //var REG_STATUS = {
        //    REGISTERED: {code: 0, description: "Successfully registered"},
        //    ILLEGAL_PASSWORD: {code: 1, description: "Illegal password"},
        //    ILLEGAL_NAME: {code: 2, description: "Illegal name"},
        //    ILLEGAL_CREDENTIALS: {code: 3, description: "Illegal name and password"},
        //    NAME_EXISTS: {code: 4, description: "User with entered name already exists"}
        //}




        var regStatus;
        return {
            REG_STATUS: function () {
                return REG_STATUS;
            },
            register: function (login, password, service) {
                service.send(MessageFormatterService.newRegMessage(login, password));

            },
            setRegStatus: function (status) {
                regStatus = status;
            },
            getRegStatus: function () {
                return regStatus;
            }
        }
    })
    .factory('AuthenticationService', function (MessageFormatterService) {
        var AUTH_STATUS = {
            AUTHENTICATED: {code: 0, description: "Successfully authenticated"},
            INVALID_CREDENTIALS: {code: 1, description: "Invalid credentials"}
        }

        var name;

        var authStatus;
        var onSuccess1;

        return {

            AUTH_STATUS: function () {
                return AUTH_STATUS;
            },
            authenticate: function (login, password, socket, onSuccess) {
                socket.send(JSON.stringify(MessageFormatterService.newAuthMessage(login, password)));
                onSuccess1 = onSuccess;
                name = login;
            },
            getAuthStatus: function () {
                return authStatus;
            },
            handleAuthResponse: function (status) {
                switch (status) {
                    case AUTH_STATUS.AUTHENTICATED.code:
                        authStatus = status;
                        onSuccess1();
                        break;
                    case AUTH_STATUS.INVALID_CREDENTIALS.code:
                        authStatus = status;
                        authStatus = status;
                        break;
                }
            },
            getName: function () {
                return name;
            }
        }
    })


    .factory('ChatWindowService', function () {
        var outputPaneContent = [];

        function ChatMessage(sender, receiver, content) {
            this.time = new Date();
            this.sender = sender;
            this.receiver = receiver;
            this.content = content;
        }

        function ChatMessage(sender, receiver, content, time) {
            this.time = new Date();
            this.sender = sender;

            this.content = content;
        }


        return {
            getOutputPaneContent: function () {
                return outputPaneContent;
            },
            addMessageToOutputPane: function (parsedMessage, callback) {
                var message = new ChatMessage(parsedMessage.sender, new Date(parsedMessage.time), parsedMessage.content)
                outputPaneContent.push(message);
                callback();
            },
            addOutgoingMessageToOutput: function (sender, receiver, content) {
                var message = new ChatMessage(sender, receiver, content, new Date());
                outputPaneContent.push(message);
            }
        }

    })


    .factory('MessageParserService', function (AuthenticationService, RegistrationService, MessageFormatterService, ContactService, ChatWindowService) {
        return {
            parse: function (message, callback) {
                var parsedMessage = JSON.parse(message.data);


                if (parsedMessage.type === MessageFormatterService.MESSAGE_TYPE().CHAT)
                    ChatWindowService.addMessageToOutputPane(parsedMessage, callback);
                else if (parsedMessage.type === MessageFormatterService.MESSAGE_TYPE().CONTACTS) {
                    ContactService.update(parsedMessage.user, callback)
                    //ContactService.emptyContacts(callback);
                    //if (parsedMessage.user.length !== 0)
                    //    for (var i = 0; i < parsedMessage.user.length; i++) {
                    //        ContactService.addContact(parsedMessage.user[i], callback);
                    //    }
                } else if (parsedMessage.type === MessageFormatterService.MESSAGE_TYPE().AUTH) {
                    AuthenticationService.handleAuthResponse(parsedMessage.status);


                } else if (parsedMessage.type === MessageFormatterService.MESSAGE_TYPE().REGISTRATION) {
                    switch (parsedMessage.status) {
                        case RegistrationService.REG_STATUS().REGISTERED.code:

                            RegistrationService.setRegStatus(RegistrationService.REG_STATUS().REGISTERED);
                            break;
                        case RegistrationService.REG_STATUS().ILLEGAL_PASSWORD.code:

                            RegistrationService.setRegStatus(RegistrationService.REG_STATUS().ILLEGAL_PASSWORD);
                            break;
                        case RegistrationService.REG_STATUS().ILLEGAL_NAME.code:

                            RegistrationService.setRegStatus(RegistrationService.REG_STATUS().ILLEGAL_NAME);
                            break;
                        case RegistrationService.REG_STATUS().ILLEGAL_CREDENTIALS.code:

                            RegistrationService.setRegStatus(RegistrationService.REG_STATUS().ILLEGAL_CREDENTIALS);
                            break;
                        case RegistrationService.REG_STATUS().NAME_EXISTS.code:

                            RegistrationService.setRegStatus(RegistrationService.REG_STATUS().NAME_EXISTS);
                            break;


                    }
                }

            }
        }
    })

    .
    factory('ContactService', function () {
        var contacts = [];
        var activeContact;


        return {
            getContacts: function () {
                return contacts;
            },
            addContact: function (contact) {
                contacts.push(contact);
            },
            deleteContact: function (contact) {
                index = contacts.indexOf(contact);
                if (index != -1)
                    contacts.splice(index, 1);
            },
            findContactByName: function (name) {
                for (var i = 1; i < contacts.length; i++) {
                    if (contacts[i] === name) {
                        return contacts[i];
                    }
                    else return null;
                }
            },
            setActiveContact: function (contact) {
                activeContact = contact;
            },
            getActiveContact: function () {
                return activeContact;
            },

            emptyContacts: function (callback) {
                contacts = [];
                callback();
            },
            update: function (users, callback) {
                if (users.length !== 0) {
                    contacts = [];
                    for (var i = 0; i < users.length; i++) {
                        this.addContact(users[i]);
                    }
                    callback();
                }
                else this.emptyContacts(callback);
            }


        }
    })





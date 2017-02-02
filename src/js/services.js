// 'use strict';

angular.module('socketChat.services', [])
    .factory('ConnectionService', function (MessageParserService, CONNECTION_STATUS) {
        var socket;


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


    .factory('MessageFormatterService', function (MESSAGE_TYPE, UserService) {


        function ChatMessage(receiver, content) {
            this.type = MESSAGE_TYPE.CHAT;
            this.receiver = receiver.id;
            this.sender = UserService.getOwner().id;
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
    //.factory('ChatService', function (AUTH_STATUS) {
    //    return {
    //        chat: function (receiver, content) {
    //            if (AuthenticationService.getAuthStatus() === AUTH_STATUS.AUTHENTICATED)
    //                ConnectionService.sendMessage(MessageFormatterService.newChatMessage(receiver, content));
    //        }
    //    }
    //})


    .factory('RegistrationService', function (MessageFormatterService) {

        var regStatus;
        return {
            register: function (login, password, service) {
                service.send(MessageFormatterService.newRegMessage(login, password));

            },
            setRegStatus: function (status) {
                regStatus = status;
            },
            getRegStatus: function () {
                return regStatus;
            },
            handleRegResponse: function (response) {

                switch (response.status) {
                    case REG_STATUS.REGISTERED.code:

                        regStatus = REG_STATUS.REGISTERED;
                        break;
                    case REG_STATUS.ILLEGAL_PASSWORD.code:

                        regStatus = REG_STATUS.ILLEGAL_PASSWORD;
                        break;
                    case REG_STATUS.ILLEGAL_NAME.code:

                        regStatus = REG_STATUS.ILLEGAL_NAME;
                        break;
                    case REG_STATUS.ILLEGAL_CREDENTIALS.code:

                        regStatus = REG_STATUS.ILLEGAL_CREDENTIALS;
                        break;
                    case REG_STATUS.NAME_EXISTS.code:

                        regStatus = REG_STATUS.NAME_EXISTS;
                        break;


                }

            }
        }
    })
    .factory('AuthenticationService', function (MessageFormatterService, AUTH_STATUS, UserService) {

        var authStatus;
        var onSuccess1;

        return {

            authenticate: function (login, password, socket, onSuccess) {
                socket.send(JSON.stringify(MessageFormatterService.newAuthMessage(login, password)));
                onSuccess1 = onSuccess;

            },
            getAuthStatus: function () {
                return authStatus;
            },
            handleAuthResponse: function (response) {
                console.log(response);
                switch (response.status) {
                    case AUTH_STATUS.AUTHENTICATED.code:
                        authStatus = response.status;
                        onSuccess1();
                        UserService.newOwner(response.id, response.login, response.name, response.email, response.friends);
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


    .factory('ChatWindowService', function (UserService) {
        var outputPaneContent = [];

        function IncomingChatMessage(sender, content, time) {
            this.time = time;
            this.sender = sender;
            this.receiver = UserService.getOwner().login;
            this.content = content;
        }

        function OutgoingChatMessage(receiver, content) {
            this.time = new Date();
            this.sender = UserService.getOwner().login;
            this.receiver = receiver;
            this.content = content;
        }


        return {
            getOutputPaneContent: function () {
                return outputPaneContent;
            },
            addMessageToOutputPane: function (parsedMessage, callback) {
                var message = new IncomingChatMessage(parsedMessage.sender, parsedMessage.content, parsedMessage.time)
                outputPaneContent.push(message);
                callback();
            },
            addOutgoingMessageToOutput: function (receiver, content) {
                var message = new OutgoingChatMessage(receiver, content);
                outputPaneContent.push(message);
            }
        }

    })


    .factory('MessageParserService', function (AuthenticationService, RegistrationService, MessageFormatterService, ContactService, ChatWindowService, MESSAGE_TYPE, REG_STATUS) {
        return {
            parse: function (message, callback) {
                var parsedMessage = JSON.parse(message.data);

                if (parsedMessage.type === MESSAGE_TYPE.CHAT)
                    ChatWindowService.addMessageToOutputPane(parsedMessage, callback);
                else if (parsedMessage.type === MESSAGE_TYPE.CONTACTS) {
                    ContactService.update(parsedMessage.user, callback)
                } else if (parsedMessage.type === MESSAGE_TYPE.AUTH) {
                    AuthenticationService.handleAuthResponse(parsedMessage);
                } else if (parsedMessage.type === MESSAGE_TYPE.REGISTRATION) {
                    RegistrationService.handleRegResponse(parsedMessage);
                }

            }
        }
    })

    .
    factory('ContactService', function (UserService) {
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
                        var user = UserService.createUser(users[i].id, users[i].login, users[i].name, null);//TODO email
                        this.addContact(user);
                    }
                    callback();
                }
                else this.emptyContacts(callback);
            }


        }
    })
    .factory('UserService', function () {
        var owner = {};

        function User(id, login, name, email) {
            this.id = id;
            this.login = login;
            this.name = name;
            this.email = email;

        }

        return {
            newOwner: function (id, login, name, email) {
                owner = new User(id, login, name, email);
            },
            getOwner: function () {
                return owner;
            },
            createUser: function (id, login, name, email) {
                return new User(id, login, name, email);
            }
        }
    })





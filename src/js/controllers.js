// 'use strict';

angular.module('socketChat.controllers', [])
    .controller('ConnectionController', function ($rootScope, $scope, ConnectionService, CONNECTION_STATUS, ContactService, $state, $timeout) {


        if (ConnectionService.getStatus() === CONNECTION_STATUS.NO_CONNECTION) {
            $timeout(function () {
                $scope.socket = ConnectionService.connect("ws://localhost:8080", function () {
                    $scope.$broadcast('connected', {
                        socketObj: $scope.socket
                    });
                    $state.go("login");
                }, function () {
                    $scope.$broadcast('incomingMessage');
                }, function () {
                    $scope.showError = true;
                    $scope.$apply();
                });
            }, 1000)
        }
    })

    .controller('LoginController', function ($scope, $rootScope, AuthenticationService, $state) {

        $scope.$on('incomingMessage', function (events, args) {
            console.log(events, args);
            $scope.$apply();
        })
        $scope.$on('connected', function (socket) {
            $scope.socket = socket;
        })

        $scope.login = function (name, password, doRemember) {
            AuthenticationService.authenticate(name, password, $scope.socket, function () {
                $state.go("main");
            });
            //TODO doRemember
        }

        $scope.registration = function () {
            $state.go("registration")
        };

    })

    .controller('MainController', function ($scope, ContactService, ChatWindowService, ConnectionService, MessageFormatterService, AuthenticationService, UserService) {
        $scope.$on('incomingMessage', function (events, args) {
            console.log(events, args);
            $scope.$apply();
        })
        $scope.$on('connected', function (socket) {
            $scope.socket = socket;
        })


        $scope.contacts = ContactService.getContacts;
        $scope.messages = ChatWindowService.getOutputPaneContent();
        $scope.sendMessage = function (content) {
            var receiver = ContactService.getActiveContact();
            ConnectionService.send(MessageFormatterService.newChatMessage(receiver, content));
            ChatWindowService.addOutgoingMessageToOutput(receiver, content);
        }


        $scope.isEmptyContactsList = function () {
            if (ContactService.getContacts().length == 0) {
                return true;
            } else return false;
        }

        $scope.activeButton = null;
        $scope.setActive = function (contact, index) {
            ContactService.setActiveContact(contact);
            $scope.activeButton = index;
        }

        $scope.name = UserService.getOwner().login;

    })


    .controller("RegistrationController", function ($scope, RegistrationService, ConnectionService, $state) {
        $scope.$on('incomingMessage', function () {
            $scope.$apply();
        })
        $scope.$on('connected', function (socket) {
            $scope.socket = socket;
        })

        $scope.regStatus = RegistrationService.getRegStatus;
        $scope.login = function () {
            $state.go("login");
        }
        $scope.register = function (name, password) {
            RegistrationService.register(name, password, ConnectionService)

        };
    })

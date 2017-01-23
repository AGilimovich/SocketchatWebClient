// 'use strict';

angular.module('socketChat.controllers', [])
    .controller('ConnectionController', function ($rootScope, $scope, ConnectionService, ContactService, $state) {

        if (ConnectionService.getStatus() === ConnectionService.CONNECTION_STATUS().NO_CONNECTION) {
            setTimeout(function () {
                $rootScope.socket = ConnectionService.connect("ws://localhost:8080", function () {
                    $state.go("login")
                }, function () {
                    $rootScope.$apply();
                    console.dir(ContactService.getContacts());
                }, function () {
                    $scope.showError = true;
                    $scope.$apply();
                });
            }, 1000)
        }
    })

    .controller('LoginController', function ($scope, $rootScope, AuthenticationService, $state) {


        $scope.login = function (name, password, doRemember) {
            AuthenticationService.authenticate(name, password, $rootScope.socket, function () {
                $state.go("main");
            });
            //TODO doRemember
        }

        $scope.registration = function () {
            $state.go("registration")
        };

    })

    .controller('MainController', function ($scope, ContactService, ChatWindowService, ConnectionService, MessageFormatterService, AuthenticationService) {
        $scope.contacts = ContactService.getContacts;
        $scope.messages = ChatWindowService.getOutputPaneContent();
        $scope.sendMessage = function (content) {
            var receiver = ContactService.getActiveContact();
            ConnectionService.send(MessageFormatterService.newChatMessage(receiver, content));
            ChatWindowService.addOutgoingMessageToOutput(AuthenticationService.getName(), receiver, content);
        }


        $scope.isEmptyContactsList = function () {
            if (ContactService.getContacts().length == 0) {
                return true;
            } else return false;
        }

        $scope.setActive = function (contact) {
            ContactService.setActiveContact(contact);
        }

        $scope.name = AuthenticationService.getName();

    })


    .controller("RegistrationController", function ($scope, RegistrationService, ConnectionService, $state) {

        $scope.regStatus = RegistrationService.getRegStatus;
        $scope.login = function () {
            $state.go("login");
        }
        $scope.register = function (name, password) {
            RegistrationService.register(name, password, ConnectionService)

        };
    })

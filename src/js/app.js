// 'use strict';

angular.module('socketChat', ['ui.router', 'socketChat.controllers', 'socketChat.services', 'socketChat.constants'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('connection', {
                url: '/connection',
                templateUrl: 'src/views/connectionView/connectionView.html'
            })
            .state('main', {
                    url: '/main',
                    templateUrl: 'src/views/mainView/mainView.html'
                }
            )

            .state('login', {
                url: '/login',
                templateUrl: 'src/views/loginView/loginView.html'
            })

            .state('registration', {
                url: '/registration',
                templateUrl: 'src/views/registrationView/registrationView.html'
            })


        $urlRouterProvider.otherwise('/connection');

    })

// 'use strict';

angular.module('socketChat', ['ui.router', 'socketChat.controllers', 'socketChat.services'])
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('connection', {
                url: '/connection',
                templateUrl: 'Views/connectionView.html'
            })
            .state('main', {
                    url: '/main',
                    templateUrl: 'Views/mainView.html'
                }
            )

            .state('login', {
                url: '/login',
                templateUrl: 'Views/loginView.html'
            })

            .state('registration', {
                url: '/registration',
                templateUrl: 'Views/registrationView.html'
            })


        $urlRouterProvider.otherwise('/connection');

    })

'use strict'

// confirmation of delete
// edit 
// solution for transaction
// message store / key / gui
var app = angular.module('requestAclsApp',[]);

app.controller("requestAclsCtrl", function($scope, $http, $location, $window) {
	
	// Set http service defaults
	// We force the "Accept" header to be only "application/json"
	// otherwise we risk the Accept header being set by default to:
	// "application/json; text/plain" and this can result in us
	// getting a "text/plain" response which is not able to be
	// parsed. 
	$http.defaults.headers.common['Accept'] = 'application/json';

	$scope.disable_ssl=true;
    $scope.disable_ip=false;
    $scope.disable_consumergrp=true;
	
    $scope.TopReqTypeList = [ { label: 'Producer', value: 'Producer' }, { label: 'Consumer', value: 'Consumer' }	];

    $scope.loadFromUrl = function() {
        var str = window.location.search;
        var envSelected, topicSelected;
        if(str){
            var envSelectedIndex = str.indexOf("envSelected");
            var topicNameIndex = str.indexOf("topicname");

            if(envSelectedIndex > 0 && topicNameIndex > 0)
            {
                $scope.envSelectedFromUrl = str.substring(13, topicNameIndex-1);
                $scope.topicSelectedFromUrl = str.substring(topicNameIndex+10);
            }
        }
    }

            $scope.getAuth = function() {

            $scope.loadFromUrl();

            	$http({
                    method: "GET",
                    url: "getAuth",
                    headers : { 'Content-Type' : 'application/json' }
                }).success(function(output) {
                    $scope.statusauth = output.status;
                    $scope.userlogged = output.username;
                    $scope.teamname = output.teamname;
                     $scope.notifications = output.notifications;
                    $scope.notificationsAcls = output.notificationsAcls;
                    $scope.statusauthexectopics = output.statusauthexectopics;
                    $scope.statusauthexectopics_su = output.statusauthexectopics_su;
                    $scope.alerttop = output.alertmessage;
                    if(output.companyinfo == null){
                        $scope.companyinfo = "Company not defined!!";
                    }
                    else
                        $scope.companyinfo = output.companyinfo;

                    if($scope.userlogged != null)
                        $scope.loggedinuser = "true";
                }).error(
                    function(error)
                    {
                        $scope.alert = error;
                    }
                );
        	}

        $scope.logout = function() {
            //alert("onload");
            $http({
                method: "GET",
                url: "logout"
            }).success(function(output) {

                $location.path('/');
                $window.location.reload();
            }).error(
                function(error)
                {
                    $scope.alert = error;
                }
            );
        }

   $scope.getEnvs = function() {

                $http({
                    method: "GET",
                    url: "getEnvs",
                    headers : { 'Content-Type' : 'application/json' }
                }).success(function(output) {
                    $scope.allenvs = output;

                }).error(
                    function(error)
                    {
                        $scope.alert = error;
                    }
                );
            }

            $scope.changeTopicType = function(){
                if($scope.addAcl.topicreqtype.value == "Consumer")
                    $scope.disable_consumergrp=false;
                else
                    $scope.disable_consumergrp=true;
            }

            $scope.onSelectAcl = function(selectedAclType){

                    if(selectedAclType=='SSL'){
                        $scope.disable_ssl=false;
                        $scope.disable_ip=true;
                    }else{
                        $scope.disable_ssl=true;
                        $scope.disable_ip=false;
                    }
                }

            $scope.getAllTopics = function() {

                    $scope.alltopics = null;
                            $http({
                                method: "GET",
                                url: "getTopicsOnly?env="+$scope.addAcl.envName.name,
                                headers : { 'Content-Type' : 'application/json' }
                            }).success(function(output) {
                                $scope.alltopics = output;
                            }).error(
                                function(error)
                                {
                                    $scope.alert = error;
                                }
                            );
                        }

    $scope.getExecAuth = function() {
    	//alert("onload");
        $http({
            method: "GET",
            url: "getExecAuth",
            headers : { 'Content-Type' : 'application/json' }
        }).success(function(output) {
            $scope.statusauth = output.status;
            if(output.status=="NotAuthorized")
                $scope.alerttop = output.status;
        }).error(
            function(error)
            {
                $scope.alert = error;
            }
        );
	}

        $scope.getTopicTeam = function(topicName) {

            if(topicName == null){
                this.addAcl.topicname.focus();
                alert("Please mention a topic name.");
                return false;
            }

            $http({
                method: "GET",
                url: "getTopicTeam",
                headers : { 'Content-Type' : 'application/json' },
                params: {'env' : $scope.addAcl.envName.name,
                    'topicName' : topicName }
            }).success(function(output) {
                $scope.topicDetails = output;
                //alert($scope.topicDetails.teamname + "---");
                if(!$scope.topicDetails.teamname){
                        alert("There is no team found for this topic : " +  topicName);
                        $scope.addAcl.team="";
                        addAcl.topicname.focus();
                            return;
                }
                $scope.addAcl.team = $scope.topicDetails.teamname;
                //alert("---"+$scope.topicDetails.teamname);
            }).error(
                function(error)
                {
                    $scope.alert = error;
                }
            );

        };

        $scope.cancelRequest = function() {
                    $window.location.href = $window.location.origin + "/kafkawize/browseTopics";
                }

        $scope.addAcl = function() {

            $scope.alert = null;
            $scope.alertnote = null;
            var serviceInput = {};

//            if($scope.addAcl.acl_ip_ssl == 'IP')
//                $scope.addAcl.acl_ssl = "";
//             else if($scope.addAcl.acl_ip_ssl == 'SSL')
//                $scope.addAcl.acl_ip = "";

            if($scope.addAcl.topicreqtype.value == 'Consumer' && !$scope.addAcl.consumergroup)
            {
                $scope.alertnote = "Consumer group is not filled."
                $scope.showAlertToast();
                return;
            }

            serviceInput['environment'] = $scope.addAcl.envName.name;
            serviceInput['topicname'] = $scope.addAcl.topicname;
            serviceInput['topictype'] = $scope.addAcl.topicreqtype.value;
            serviceInput['teamname'] = $scope.addAcl.team;
            serviceInput['appname'] = "App";//$scope.addAcl.app;
            serviceInput['remarks'] = $scope.addAcl.remarks;
            serviceInput['acl_ip'] = $scope.addAcl.acl_ip;
            serviceInput['acl_ssl'] = $scope.addAcl.acl_ssl;
            serviceInput['consumergroup'] = $scope.addAcl.consumergroup;

            if(!$scope.addAcl.team || !$scope.addAcl.topicname )
            {
                //alert("This topic is not owned by any team. Synchronize the metadata.");
                $scope.alertnote = "This topic is not owned by any team. Synchronize the metadata.";
                $scope.showAlertToast();
                return false;
            }

            if(($scope.addAcl.acl_ip !=null && $scope.addAcl.acl_ip.length>0) ||
                         ($scope.addAcl.acl_ssl !=null && $scope.addAcl.acl_ssl.length>0)){}
             else
             {
                $scope.alertnote = "Please fill in a valid IP address or SSL-CN Name of the Producer/Consumer client";
                $scope.showAlertToast();
                return;
             }


            $http({
                method: "POST",
                url: "createAcl",
                headers : { 'Content-Type' : 'application/json' },
                params: {'addAclRequest' : serviceInput },
                data: serviceInput
            }).success(function(output) {
                $scope.alert = "Acl Request : "+output.result;
                $scope.showSuccessToast();
            }).error(
                function(error)
                {
                    $scope.alert = error;
                    $scope.alertnote = error;
                    $scope.showAlertToast();
                    //alert("Error : "+error.value);
                }
            );

        };

        $scope.loadTeams = function() {
            $http({
                method: "GET",
                url: "getAllTeams",
                headers : { 'Content-Type' : 'application/json' }
            }).success(function(output) {
                $scope.allTeams = output;
            }).error(
                function(error)
                {
                    $scope.alert = error;
                    alert("Error : "+error.value);
                }
            );
        }

        $scope.showSuccessToast = function() {
                  var x = document.getElementById("successbar");
                  x.className = "show";
                  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
                }

        $scope.showAlertToast = function() {
                  var x = document.getElementById("alertbar");
                  x.className = "show";
                  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 4000);
                }



}
);
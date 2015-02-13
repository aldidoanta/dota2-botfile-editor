'use strict';

/* controllers.js */

var d2botfileControllers = angular.module('d2botfileControllers', []);

d2botfileControllers.controller('EditHeroController', ['$rootScope','$scope', '$routeParams', 'heroFactory', 'itemFactory', 'itemgroupFactory','abilityFactory', 'botfileFactory', function($rootScope, $scope, $routeParams, heroFactory, itemFactory, itemgroupFactory, abilityFactory, botfileFactory) {

  //other scope variables
  $scope.orderHero = 'localized_name';
  $scope.orderItem = 'value.dname';
  $scope.orderAbility = 'value.dname';
  $scope.heroIdx = $routeParams.heroIdx;

  $scope.invokerHeroIdx = 72; 
  $scope.abilityNumber = 4;
  $scope.levelNumber = 25;
  $scope.selected = false;

  $scope.item_consumables = [];
  $scope.item_core = [];
  $scope.item_extension = [];
  $scope.item_luxury = [];

  $scope.heroRole = [
    "DOTA_BOT_HARD_CARRY",
    "DOTA_BOT_SEMI_CARRY",
    "DOTA_BOT_NUKER",
    "DOTA_BOT_GANKER",
    "DOTA_BOT_TANK",
    "DOTA_BOT_PUSH_SUPPORT",
    "DOTA_BOT_STUN_SUPPORT",
    "DOTA_BOT_PURE_SUPPORT",
  ];
  $scope.laningInfo = [
    "SoloDesire",
    "RequiresBabysit",
    "ProvidesBabysit",
    "SurvivalRating",
    "RequiresFarm",
    "ProvidesSetup",
    "RequiresSetup"
  ];

  //config for ng-sortable item
  $scope.sortableItemConfig = {
    group:{
      name:'itemBuild',
      pull:true,
      put:true
    },
    animation:100,
  };

  //config for ng-sortable item list
  $scope.sortableItemListConfig = {
    group:{
      name:'itemBuild',
      pull:'clone',
      put:false
    },
    sort: false,
    animation:100
  };

  //scope functions
  $scope.init = function(){
    //get hero data
    heroFactory.get(function(data){
      $scope.heroes = data.heroes;
      if($routeParams.heroIdx !== undefined){
        $scope.hero = $scope.heroes[$routeParams.heroIdx];
        $scope.getBotfileConfigHero($scope.hero.name);
      }
    });
    //get item data
    itemFactory.get(function(data) {
      $scope.items = data.itemdata;
    });
    //get item_group data
    itemgroupFactory.get(function(data) {
      $scope.itemgroups = data.itemdata_group;
    });
    //get ability data
    abilityFactory.get(function(data) {
      $scope.abilities = data.abilitydata;
    });
  };

  //used in ng-repeat to repeat a defined number of times
  $scope.range = function(num){
    return new Array(num);
  };

  //convert string to Camel Case
  $scope.splitCamelCase = function(str){
    var newString = "";
    newString =  str.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){
                    return str.toUpperCase();
                  });
    return newString;
  };

  //remove item image
  $scope.removeItemImg = function(item,type){
    switch(type){
      case "ITEM_CONSUMABLES":
        var index = $scope.item_consumables.indexOf(item);
        $scope.item_consumables.splice(index, 1);
        break;
      case "ITEM_CORE":
        var index = $scope.item_core.indexOf(item);
        $scope.item_core.splice(index, 1);
        break;
      case "ITEM_EXTENSION":
        var index = $scope.item_extension.indexOf(item);
        $scope.item_extension.splice(index, 1);
        break;
      case "ITEM_LUXURY":
        var index = $scope.item_luxury.indexOf(item);
        $scope.item_luxury.splice(index, 1);
        break;
    }
  };

  //load last saved bot config
  $scope.getBotfileConfigHero = function(hero_name){

    //load "Loadout"
    var loadout = botfileFactory.getBotLoadout(hero_name);
    if(loadout.length > 0){
      $scope.item_consumables = loadout[0].items;
      $scope.item_core = loadout[1].items;
      $scope.item_extension = loadout[2].items;
      $scope.item_luxury = loadout[3].items;
    }

    //load "Build"
    var build = botfileFactory.getBotBuild(hero_name);
    for(var level in build){
      //iterate level
      if(build.hasOwnProperty(level)){
        switch(build[level]){
          case $scope.hero.abilities[0]:
            document.getElementById("a1"+"lv"+level).className += " selected";
            break;
          case $scope.hero.abilities[1]:
            document.getElementById("a2"+"lv"+level).className += " selected";
            break;
          case $scope.hero.abilities[2]:
            document.getElementById("a3"+"lv"+level).className += " selected";
            break;
          case $scope.hero.abilities[3]:
            document.getElementById("a4"+"lv"+level).className += " selected";
            break;
          case "attribute_bonus":
            document.getElementById("a5"+"lv"+level).className += " selected";
              break;
        }
      } 
    }

    //load "HeroType"
    var heroType = botfileFactory.getBotHeroType(hero_name);
    if(heroType != ""){
      var roles = heroType.split(" | ");
      roles.forEach(function(role){
        document.getElementById("role"+$scope.heroRole.indexOf(role)).checked = true;
      });
    }

    //load "LaningInfo"
    var laningInfo = botfileFactory.getBotLaningInfo(hero_name);
    for(var item in laningInfo){
      if(laningInfo.hasOwnProperty(item)){
          document.getElementById("laning_"+item).value = parseInt(laningInfo[item]);
      }
    }

  };

  //save current bot config
  $scope.setBotfileConfigHero = function(hero_name){

    //save "Loadout"
    var loadout = [
      {
        "name": "ITEM_CONSUMABLES",
        "items": []
      },
      {
        "name": "ITEM_CORE",
        "items": []
      },
      {
        "name": "ITEM_EXTENSION",
        "items": []
      },
      {
        "name": "ITEM_LUXURY",
        "items": []
      },
    ];
    for (var i = 0; i < loadout.length; i++) {
      var items = document.getElementById(loadout[i].name).childNodes;
      for (var j = 0; j < items.length; j++) {
        if(items[j].tagName != undefined){
          loadout[i].items.push(items[j].id);
        }
      }
    }
    botfileFactory.setBotLoadout(hero_name,loadout);


    //save "Build"
    var build = {};
    for(var i = 1; i <= $scope.abilityNumber; i++){
      for(var j = 1; j <= $scope.levelNumber; j++){
        //iterate ability id
        if(document.getElementById("a"+i+"lv"+j).className.indexOf("selected") > -1){
          //add to build
          build[String(j)] = $scope.hero.abilities[i-1];
        };
      } 
    }
    //same code for attribute bonus
    if($scope.heroIdx != $scope.invokerHeroIdx){
      for(var j = 1; j <= $scope.levelNumber; j++){
        if(document.getElementById("a5"+"lv"+j).className.indexOf("selected") > -1){
          //add to build
          build[String(j)] = "attribute_bonus";
        };
      } 
    }
    botfileFactory.setBotBuild(hero_name,build);

    //save "HeroType"
    var heroType = "";
    for(var i = 0; i < $scope.heroRole.length; i++){
      if(document.getElementById("role"+i).checked == true){
        if(heroType == ""){
          heroType += $scope.heroRole[i];
        }
        else{
          heroType += " | "+$scope.heroRole[i];
        }
      }
    }
    botfileFactory.setBotHeroType(hero_name,heroType);

    //save "LaningInfo"
    var laningInfo = {};
    for(var i = 0; i < $scope.laningInfo.length; i++){
      laningInfo[$scope.laningInfo[i]] = String(document.getElementById("laning_"+$scope.laningInfo[i]).value);
    }
    botfileFactory.setBotLaningInfo(hero_name,laningInfo);
  };

  //events
  $scope.$on('$routeChangeStart', function(){
    if($scope.heroIdx !== undefined){
      $scope.setBotfileConfigHero($scope.hero.name);
    }
  });

  //fire init function
  $scope.init();

}]);

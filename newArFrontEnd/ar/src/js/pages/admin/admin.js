define([
  'ojs/ojcore',
  'knockout',
  'jquery',
  'socket',
  'css!pages/admin/admin',
  'components/player-table/loader',
],
function(oj, ko, $, socketIOClient) {
  function AdminViewModel() {
    var self = this;
    // ojet serve --theme pingpongTheme

    // finish admin email and password

    let endpoint = "https://ocs-ar-experience.com/socket/";
    let socket = socketIOClient('https://ocs-ar-experience.com/');
    
    socket.on("connect_failed", data => {
      self.players([]);
    });
    socket.io.on("connect_error", data => {
      self.players([]);
    });
    socket.on("updateList", (data) => {
      self.players(data.data.sort( (p1, p2) => p2.score - p1.score ));
      self.players.valueHasMutated();

    });
    self.currentPlayerEmail = ko.observable("");

    ko.bindingHandlers.display = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      },
      update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
          if(valueAccessor()){
            element.style.display = 'block';
          }else{
            element.style.display = 'none';
          }
      }
    };

    ko.bindingHandlers.displayFlex = {
      init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {},
      update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
          if(valueAccessor()){
            element.style.display = 'flex';
          }else{
            element.style.display = 'none';
          }
      }
    };


    self.hideToken = function(){
      self.showAdminToken(false);
    }

    self.selectedIndex = ko.observable(-1);
    self.players = ko.observableArray([]);

    self.adminToken = ko.observable("");
    self.showAdminToken = ko.observable(true);

    self.deleteAccount = function(){

      $.ajax({
        type: "POST",
        url: endpoint+'deletePlayer',
        data: {
          email: self.players()[self.selectedIndex()].email,
          token: self.adminToken()
        },
        success: (response) => {
          self.players.splice(self.selectedIndex(),1);
          self.selectedIndex(-1);
        }
      });
    }

    self.registerDisplayName = ko.observable("");
    self.registerEmail = ko.observable("");
    self.registerError = ko.observable("");
    self.registerScore = ko.observable("");
    self.registerPhone = ko.observable("");
    self.registerOrg = ko.observable("");

    self.makepass = function(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
    self.adminEmail = ko.observable('');
    self.adminPassword = ko.observable('');

    self.register = function(){
      let data = {
        firstName: self.registerDisplayName(),
        lastName: '',
        name: self.registerDisplayName(),
        email: self.registerEmail(),
        score: Number(self.registerScore()),
        token: self.adminToken(),
        phone: self.registerPhone(),
        org: self.registerOrg(),
        
      };
      if(self.adminEmail() !== '' && self.adminPassword() !== ''){
        data.adminEmail = self.adminEmail();
        data.adminPassword = self.adminPassword();
      }else{
        data.adminEmail = "invalid";
        data.adminPassword = "invalid";
      }
      // console.log(data);
      $.ajax({
        type: "POST",
        url: endpoint+'addPlayer',
        data: JSON.stringify(data),
        dataType:"json",
        contentType: 'application/json; charset=utf-8',
        success: (response) => {
          console.log(response);
          if(typeof response.token === "undefined"){
            self.registerError(response);
          }else{
            self.registerDisplayName("");
            self.registerEmail("");
            self.registerError("");
            self.registerPhone("");
            self.registerOrg("");
            self.newScore("");
          }
        },
        error: (response) => {
          self.registerError(response.responseJSON.error);
        }
      });
    }
    self.newScore = ko.observable('');
    self.update = function(){
      var data = {
        email: self.players()[self.selectedIndex()].email,
        firstName: self.players()[self.selectedIndex()].name,
        score: Number(self.newScore()),
        token: self.adminToken(),
      };
      if(self.adminEmail() !== '' && self.adminPassword() !== ''){
        data.adminEmail = self.adminEmail();
        data.adminPassword = self.adminPassword();
      }else{
        data.adminEmail = "invalid";
        data.adminPassword = "invalid";
      }
      $.ajax({
        type: "POST",
        url: endpoint+'updatePlayer',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        success: (response) => {

        },
        error: (response) => {
          self.registerError(response.responseJSON.error);
        }
      });
    }
  }
  return AdminViewModel;
}
);
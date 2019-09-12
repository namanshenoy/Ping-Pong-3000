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

    let endpoint = "http://ocs-ar-experience.com/";
    let socket = socketIOClient('http://ocs-ar-experience.com/');
    
    socket.on("connect_failed", data => {
      self.players([]);
    });
    socket.io.on("connect_error", data => {
      self.players([]);
    });
    socket.on("updateList", (data) => {
      self.players(data.data.sort( (p1, p2) => p1.rank - p2.rank ));
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
        url: endpoint+'backend/deletePlayer',
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

    self.makepass = function(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
    self.adminEmail = ko.observable();
    self.adminPassword = ko.observable();

    self.register = function(){
      let data = {
        firstName: self.registerDisplayName(),
        lastName: '',
        email: self.registerEmail(),
        score: self.registerScore(),
        adminToken: self.adminToken()
      };
      if(self.adminEmail() !== '' && self.adminPassword() !== ''){
        data.adminEmail = self.adminEmail();
        data.adminPassword = self.adminPassword();
      }
      $.ajax({
        type: "POST",
        url: endpoint+'backend/addScore',
        data: data,
        contentType:"application/json; charset=utf-8",
        success: (response) => {
            self.registerDisplayName("");
            self.registerEmail("");
            self.registerError("");
        },
        error: (response) => {
          self.registerError(response.responseJSON.error);
        }
      });
    }
    self.newScore = ko.observable('');
    self.update = function(){
      let data = {
        email: self.players()[self.selectedIndex()].email,
        score: self.newScore(),
        token: self.adminToken()
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
        url: endpoint+'backend/updateScore',
        data: data,
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
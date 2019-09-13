define([
  'ojs/ojcore',
  'knockout',
  'jquery',
  'socket',
  'components/player-table/loader',
  'css!pages/home/home'
],
function(oj, ko, $, socketIOClient) {
  function HomeViewModel() {
    var self = this;

    let socket = socketIOClient('https://ocs-ar-experience.com/');

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

    self.players = ko.observableArray([]);

    self.selectedIndex = ko.observable(-1);
    
    self.currentPlayerEmail = ko.observable('');
    

    socket.on("connect_failed", data => {
      self.players([]);
    });
    socket.io.on("connect_error", data => {
      self.players([]);
    });
    socket.on("updateList", (data) => {
      self.players(data.data.sort( (p1, p2) => p2.score - p1.score ));

    });

  }
  return HomeViewModel;
}
);





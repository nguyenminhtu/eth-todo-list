App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContracts();
    await App.render();
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert('Please connect to Metamask');
    }

    if (window.ethereum) {
      window.web3 = new Web3(ethereum);

      try {
        await ethereum.enable();

        web3.eth.sendTransaction({});
      } catch (err) {}
    } else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      web3.eth.sendTransaction({});
    } else {
      console.log('Non-ethereum browser detected');
    }
  },

  loadAccount: async () => {
    App.account = web3.eth.accounts[0];
  },

  loadContracts: async () => {
    const todoList = await $.getJSON('TodoList.json');
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(App.web3Provider);

    App.todoList = await App.contracts.TodoList.deployed();
  },

  setLoading: val => {
    App.loading = val;
    const loader = $('#loader');
    const content = $('#content');
    if (val) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },

  renderTasks: async () => {
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $('.taskTemplate');

    for (let i = 1; i <= taskCount.toNumber(); i++) {
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find('.content').html(taskContent);
      $newTaskTemplate.css('display', 'block');
      $newTaskTemplate
        .find('input')
        .prop('name', taskId)
        .prop('checked', taskCompleted)
        .on('click', App.toggleCompleted);

      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate);
      } else {
        $('#taskList').append($newTaskTemplate);
      }
    }
  },

  createTask: async () => {
    App.setLoading(true);
    const content = $('#newTask').val();
    await App.todoList.createTask(content);
    window.location.reload();
  },

  toggleCompleted: async e => {
    App.setLoading(true);
    const id = e.target.name;
    await App.todoList.toggleCompleted(id);
    window.location.reload();
  },

  render: async () => {
    if (App.loading) {
      return;
    }

    App.setLoading(true);

    $('#account').html(App.account);

    await App.renderTasks();

    App.setLoading(false);
  },
};

$(() => {
  $(window).load(async () => {
    await App.load();
  });
});

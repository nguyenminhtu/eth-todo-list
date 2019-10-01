const TodoList = artifacts.require('./TodoList.sol');

contract('TodoList', accounts => {
  before(async () => {
    this.todoList = await TodoList.deployed();
  });

  it('deploy successfully', async () => {
    const address = await this.todoList.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
    assert.notEqual(address, '');
  });

  it('create task', async () => {
    const result = await this.todoList.createTask('test task');
    const taskCount = await this.todoList.taskCount();
    assert.equal(taskCount.toNumber(), 2);
    console.log('================== test', result.logs[0]);
    const event = result.logs[0].args;
    assert.equal(event.content, 'test task');
  });
});

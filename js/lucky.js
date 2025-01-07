define(function(require, exports, module) {
  // 引入依赖文件
  var $ = require('./jquery')
  require('./easing')
  //抽奖人员名单
  // Assuming data-apper.js exports an array of objects with `name` and `NT` properties
  const dataApper = require('./data/data-apper');

// Convert the data to the desired format with multiple spaces between name and NT
  const allPerson = dataApper.map(person => `${person.name} ${person.NT}`).join(';');

  //未中奖人员名单
  var remainPerson = allPerson.toString().split(";");
  //中奖人员名单
  var luckyMan = new Set();

  let timers = [];
  let isRunning = false;

  function stopScrollingSequentially() {
    const inputs = document.querySelectorAll('input[id^="showName"]');
    const displayedPeople = new Set(); // 使用 Set 保存当前显示的值
    let currentIndex = 0;

    function stopNextInput() {
      if (currentIndex >= inputs.length) {
        return; // 所有输入框停止后退出
      }

      const input = inputs[currentIndex];
      const timer = timers[currentIndex];

      // 检查当前值是否在 displayedPeople 中
      if (!displayedPeople.has(input.value)) {
        clearInterval(timer); // 停止当前定时器
        displayedPeople.add(input.value); // 添加到已显示值集合

        luckyMan.add(input.value); // 添加到中奖者集合
        const index = remainPerson.indexOf(input.value);
        if (index > -1) {
          remainPerson.splice(index, 1); // 从剩余人群中移除
        }

        currentIndex++; // 移动到下一个输入框
        stopNextInput(); // 递归停止下一个
      } else {
        // 延迟 500ms 再检查
        setTimeout(stopNextInput, 300);
      }
    }

    stopNextInput();
  }

  function move() {
    timers.forEach(timer => clearInterval(timer));
    timers = [];
    const inputs = document.querySelectorAll('input[id^="showName"]');
    if (inputs.length > remainPerson.length) {
      alert(`当前剩余${remainPerson.length}人，请重新设置奖项个数`);
      return;
    }
    var interTime = 30;//设置间隔时间
    inputs.forEach((input, index) => {
      timers[index] = setInterval(() => {
        if (remainPerson.length === 0) {
          clearInterval(timers[index]);
          return;
        }
        var i = GetRandomNum(0, remainPerson.length-1);
        input.value = remainPerson[i]; // Assign random value to input
      }, interTime);
    });
  }

  function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
  }

  function resetRemainPerson() {
    remainPerson = allPerson.split(';');
    luckyMan.clear();
    document.querySelectorAll('input[id^="showName"]').forEach(input => {
      input.value = "";
    });
  }

  module.exports = {

    lotteryCompleted: false,
    init: function(data) {
      this.data = data
      this.lotteryCompleted = false;
      this._bindUI()
    },

    _bindUI: function() {
      var that = this;

      // 监听抽奖人数变化
      document.querySelector("#num-lucky").addEventListener("input", function(e) {
        var value = parseInt(e.target.value);
        if (value < 1) {
          e.target.value = 1;
        }
      });
      // bind button
      var trigger = document.querySelector('#go');
      var tag = document.querySelector("#handle");
      trigger.innerHTML = trigger.getAttribute('data-text-start')
      tag.innerHTML = tag.getAttribute('data-text-start')
      trigger.addEventListener('click', toggleLottery, false)
      tag.addEventListener('click', toggleLottery, false)

      function toggleLottery() {
        const trigger = document.querySelector('#go');
        const tag = document.querySelector("#handle");

        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop');
          trigger.innerHTML = trigger.getAttribute('data-text-stop');
          tag.setAttribute('data-action', 'stop');
          tag.innerHTML = tag.getAttribute('data-text-stop');
          move();
          isRunning = true;
        } else {
          trigger.setAttribute('data-action', 'start');
          trigger.innerHTML = trigger.getAttribute('data-text-start');
          tag.setAttribute('data-action', 'start');
          tag.innerHTML = tag.getAttribute('data-text-start');
          stopScrollingSequentially();
          isRunning = false;
        }
      }

      // Bind reset button
      document.getElementById('reset').addEventListener('click', function() {
        if (confirm('是否确认重置？')) {
          resetRemainPerson();
          const inputs = document.querySelectorAll('input[id^="showName"]');
          inputs.forEach(input => input.value = '');
        }
      });

      // bind keydown
      document.addEventListener('keydown', function(ev) {
        if (ev.keyCode == '32') { // 空格键
          toggleLottery();
        }
      }, false)

    },
  }

})

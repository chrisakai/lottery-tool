define(function(require, exports, module) {
  // 引入依赖文件
  var $ = require('./jquery')
  require('./easing')
  var _util = require('./utils')
  var _lucky_list = require('./data/data-lucky')
  //抽奖人员名单
  var allPerson= ""
  //未中奖人员名单
  var remainPerson = allPerson.toString().split(";");
  //中奖人员名单
  var luckyMan = new Set();

  let timers = [];
  let isRunning = false;

  function move() {
    const inputs = document.querySelectorAll('input[id^="showName"]');
    var interTime = 30;//设置间隔时间
    inputs.forEach((input, index) => {
      timers[index] = setInterval(() => {
        if (remainPerson.length === 0) {
          clearInterval(timers[index]);
          return;
        }
        var i = GetRandomNum(0, remainPerson.length-1);
        input.value = remainPerson[i]; // Assign random value to input
        remainPerson.splice(i, 1); // Remove the value from remainPerson
      }, interTime);
    });
  }

  function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
  }

  function User(id,name,NT, options) {
    this.id = id
    this.name = name
    this.NT =  NT
    this.options = options || {}
    this.lucky = false
  }

  function stopScrollingAndAddToLuckyMan(displayedPeople) {
    displayedPeople.forEach(person => {
      luckyMan.add(person);
      const index = remainPerson.indexOf(person);
      if (index > -1) {
        remainPerson.splice(index, 1);
      }
    });
  }

  function resetRemainPerson() {
    remainPerson = allPerson.toString().split(";");
    luckyMan.clear();
  }

  module.exports = {

    lotteryCompleted: false,
    init: function(data) {
      this.data = data
      this.lotteryCompleted = false;

      this._bindUI()
      this.luckyCount = parseInt(document.querySelector("#num-lucky").value) || 1; // 默认抽取 1 人
      //_util.setStore("ALLLUCKYDATA", _lucky_list) // 把lucky名单存入localStorage去
      //var hasLuckyData = _util.getStore("HASLUCKYDATA")
      //if (hasLuckyData) {
      //  for (var i = 0; i < hasLuckyData.length; i++) {
      //    if (hasLuckyData[i]) {
      //      hasLuckyData[i].bang()
      //    }
      //  }
      //}
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
      trigger.addEventListener('click', go, false)
      tag.addEventListener('click', handle, false)

      function go() {
        if (trigger.getAttribute('data-action') === 'start') {
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = trigger.getAttribute('data-text-stop')
          tag.setAttribute('data-action', 'stop')
          tag.innerHTML = tag.getAttribute('data-text-stop')
          that.start()
        }
        else {
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = trigger.getAttribute('data-text-start')
          tag.setAttribute('data-action', 'start')
          tag.innerHTML = tag.getAttribute('data-text-start')
          that.stop()
        }
      }
      function handle() {
        if (tag.getAttribute('data-action') === 'start') {
          tag.setAttribute('data-action', 'stop')
          tag.innerHTML = tag.getAttribute('data-text-stop')
          trigger.setAttribute('data-action', 'stop')
          trigger.innerHTML = trigger.getAttribute('data-text-stop')
          move();
          isRunning = true;
        }
        else {
          tag.setAttribute('data-action', 'start')
          tag.innerHTML = tag.getAttribute('data-text-start')
          trigger.setAttribute('data-action', 'start')
          trigger.innerHTML = trigger.getAttribute('data-text-start')
          timers.forEach(timer => clearInterval(timer));
          isRunning = false;
          // Get displayed people and add to luckyMan
          const displayedPeople = Array.from(document.querySelectorAll('input[id^="showName"]')).map(input => input.value);
          stopScrollingAndAddToLuckyMan(displayedPeople);
        }
      }

      // Update the JavaScript in lucky.js
      document.getElementById('go').addEventListener('click', function() {
        var winners = Lucky.start();
        winners.forEach(function(winner) {
          $("#lucky-balls").append('<li><p class="NT">' + winner.NT + '</p><p class="name">' + winner.name + '</p></li>');
        });
      });

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
          if (isRunning) {
            timers.forEach(timer => clearInterval(timer));
            isRunning = false;
            // Get displayed people and add to luckyMan
            const displayedPeople = Array.from(document.querySelectorAll('input[id^="showName"]')).map(input => input.value);
            stopScrollingAndAddToLuckyMan(displayedPeople);
          } else {
            move();
            isRunning = true;
          }
        }
        else if (ev.keyCode == '27') { // ESC按键
          // that.moveLucky()
          $('#lucky-balls li').eq(0).click()
          $("#reference").hide()
        }
      }, false)

    },

    setHasLuckyData: function(item) {
      //var arr = $('#lucky-balls').find('li')
      var arr = []
      var hasLuckyData = _util.getStore("HASLUCKYDATA")
      if (hasLuckyData) {
        for(var i=0;i<hasLuckyData.length;i++) {
          arr.push(hasLuckyData[i])
        }
      }
      arr.push(item)
      _util.setStore("HASLUCKYDATA", arr) // 把开出来的名单存入localStorage
      //if(arr){
      // console.log(arr)
      //  var temp = []
      //  for(var i =0;i<arr.length;i++) {
      //    temp.push(arr[i])
      //    _util.setStore("HASLUCKYDATA", temp) // 把开出来的名单存入localStorage
      //  }
      //}
    },
  }


  // Helpers

  function r(from, to) {
    from = from || 0
    to = to || 1
    return Math.floor(Math.random() * (to - from + 1) + from)
  }

  function getOffset(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  function isOverlap(a, b) {
    return getOffset(a, b) <= (a.width + b.width) / 2
  }

  function hit(a, b) {
    var yOffset = b.y - a.y
    var xOffset = b.x - a.x

    var offset = getOffset(a, b)

    var power = Math.ceil(((a.width + b.width) / 2 - offset) / RIGIDITY)
    var yStep = yOffset > 0 ? Math.ceil(power * yOffset / offset) : Math.floor(power * yOffset / offset)
    var xStep = xOffset > 0 ? Math.ceil(power * xOffset / offset) : Math.floor(power * xOffset / offset)

    if (a.lucky) {
      b._xMove += xStep * 2
      b._yMove += yStep * 2
    }
    else if (b.lucky) {
      a._xMove += xStep * -2
      a._yMove += yStep * -2
    }
    else {
      a._yMove += -1 * yStep
      b._yMove += yStep

      a._xMove += -1 * xStep
      b._xMove += xStep
    }
  }

})

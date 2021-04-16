// 为原型添加日期格式化方法
Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
};
// 对象收编变量
//el父元素 回调函数返回日期
//render渲染
//handel处理事件
let calendar = {
  date: new Date(), //获取当前日期
  weeks: ["日", "一", "二", "三", "四", "五", "六"],
  // 存储日期
  showDate: {
    year: 0,
    month: 0,
    day: 0,
  },
  showPanel: false, //控制日期面板是否显示

  //初始化
  init: function(options) {
    this.initDate(options);
    this.render();
    this.handel();
  },
  // 初始化日期
  initDate: function(options) {
    this.el = options.el;
    this.getDate = options.getDate;
    // console.log(options);
    // 获取当前日期
    this.showDate = this.getYearMonthDay(this.date);
    // 根据当前天，获取需要展示的日期数组（展示日期）
    this.showDays = this.getShowDays();
    this.chooseDay = this.getChooseDay(this.showDate);
  },

  //获取当前年月日
  getYearMonthDay: function(date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    // let day = date.getDay() === 6 ? date.getDate() + 1 : date.getDate();//周六+1
    let day = date.getDate();
    return {
      year: year,
      month: month,
      day: day,
    }
  },

  // 获取每页的日期数组
  getShowDays: function() {
    let arr = [];
    //new Date()可以根据传进去的值返回相应的日期对象
    //第三个参数传入1保证面板当月以1号开始
    let firstDay = new Date(this.showDate.year, this.showDate.month, 1);
    //获取周几来让位显示上个月的日期
    let firstDayWeek = firstDay.getDay();
    let startDay = +firstDay - firstDayWeek * 24 * 60 * 60 * 1000;
    //new Date()还可以根据传进去的毫秒数得到一个新的日期对象
    for (let i = 0; i < 42; i++) {
      arr[i] = new Date(startDay + i * 24 * 60 * 60 * 1000);
    }
    return arr;
  },
  //判断选择的日期
  getChooseDay: function(date) {
    if (date instanceof Date) {
      return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }
    //判断是周六的话默认天数+2
    if (new Date(date.year + '-' + (date.month + 1) + '-' + (date.day + 1)).getDay() == 0) {
      return `${date.year}-${date.month + 1}-${date.day+2}`;
    } else {
      return `${date.year}-${date.month + 1}-${date.day+1}`;
    }
  },
  // 渲染函数
  render: function() {
    //添加需渲染的输入框和日历区域，渲染：即操作dom的过程
    this.el.innerHTML = this.renderInput() + this.renderCalenar();
  },
  //添加输入框
  renderInput: function() {
    return `
    <div class="picker-input">
      <span class="picker-prefix"></span>
      <input type="text" value="${this.chooseDay}">
    </div>
    `;
  },
  // 添加calendar
  renderCalenar: function() {
    return `
    <div class="calendar" style="display:${this.showPanel ? 'block':'none'}">
      ${this.renderHeader()}
      ${this.renderContent()}
    </div>
    `;
  },
  // 添加header
  renderHeader: function() {
    return `
    <div class="header">
      <span class="picker-btn picker-prev-year"></span>
      <span class="picker-btn picker-prev-month"></span>
      <span class="picker-date">${this.showDate.year}年${this.showDate.month+1}月</span>
      <span class="picker-btn picker-next-month"></span>
      <span class="picker-btn picker-next-year"></span>
    </div>
    `;
  },
  // 添加周几和日
  renderContent: function() {
    return `
    <div class="content">
      <div class="picker-weeks">
      ${this.renderWeeks()}
      </div>
      <div class="picker-days">
      ${this.renderDays()}
      </div>
    </div>
    `;
  },
  // 添加头部周几
  renderWeeks: function() {
    let template = '';
    for (let i = 0; i < 7; i++) {
      template += `<div>${this.weeks[i]}</div>`;
    }
    return template;
  },
  // 添加日
  renderDays: function() {
    let template = '';
    for (let i = 0; i < 42; i++) { //42是因为31天最多跨6周*7
      let date = this.showDays[i]; // 拿到当前循环里的日期对象
      let isCur = this.isCur(date); //判断当前日期对象的月份是否与当前展示的月相同
      // date<=this.date为小于当前日期不可选择，i%7===0为周日不可选择
      template += `<div class = "
      ${isCur.month ? '':'other-month'}
      ${isCur.day ? 'is-today':''}
      ${isCur.select ? 'is-select':''}
      ${date < this.date ? 'no-select':''}
      ${i % 7 === 0 ? 'no-select':''}
    "
    data-index=${i}
      >${date.getDate()}</div>`;
    }
    return template;
  },
  //判断日期
  isCur: function(date) {
    // 获取传入的日期的年月日，即this.showDays[i]
    let curDate = this.getYearMonthDay(date);
    let year = curDate.year;
    let month = curDate.month;
    let day = curDate.day;
    //获取展示日期来判断是否是当前展示月
    let showDate = this.showDate;
    let showYear = showDate.year;
    let showMthon = showDate.month;
    // 获取当前日期判断日期是否是今天
    let today = this.getYearMonthDay(this.date);
    let todayYear = today.year;
    let todayMonth = today.month;
    let todayDay = today.day;
    //选择的日期
    let chooseDate = this.getYearMonthDay(new Date(this.chooseDay));
    let chooseYear = chooseDate.year;
    let chooseMonth = chooseDate.month;
    let chooseDay = chooseDate.day;

    // console.log(this.getShowDays()[7], "666");
    return {
      month: year === showYear && month === showMthon,
      day: year === todayYear && month === todayMonth && day === todayDay,
      select: year === chooseYear && month === chooseMonth && day === chooseDay,
    }
  },
  // 处理事件的函数
  handel: function() {
    self = this; //捕获this方便下面操作
    document.onclick = function(e) { //cilicoffset
      let dom = e.target; //获取事件触发的是谁
      let isElson = self.el.contains(dom) && dom != self.el; //contains判断是否包含
      if (isElson && !self.showPanel) {
        self.changePanel(true);
      } else if (!isElson && self.showPanel) {
        self.changePanel(false);
      };
      if (isElson) {
        let isDay = dom.parentNode.classList.contains('picker-days');
        let isBtn = dom.classList.contains('picker-btn');
        let isYearBtn = isBtn && dom.getAttribute('class').includes('-year');
        let isMonhBtn = isBtn && dom.getAttribute('class').includes('-month');
        if (isDay) {
          self.handleDay(dom);
        } else if (isYearBtn) {
          self.handleYear(dom);
        } else if (isMonhBtn) {
          self.handleMonth(dom);

        }
      }
    };
  },
  //是否展示日期窗口
  changePanel: function(status) {
    this.showPanel = status;
    let oPanel = this.el.getElementsByClassName('calendar')[0];
    oPanel.style.display = status ? 'block' : 'none';
  },
  // 判断选择了哪一天
  handleDay: function(dom) {
    let index = dom.dataset.index;
    let date = this.showDays[index];
    let month = date.getMonth();
    this.chooseDay = this.getChooseDay(date); //得到新选择的日期
    if (month != this.showDate.month) {
      this.showDate.month = month;
      this.showDays = this.getShowDays();
    }
    this.showPanel = false; //关闭日期窗口
    this.getDate(this.chooseDay); //回调函数
    this.render(); //重新渲染
  },
  handleYear: function(dom) {
    let isPrev = dom.getAttribute('class').includes('prev');
    let moveYear = isPrev ? -1 : 1;
    this.showDate.year += moveYear;
    this.showDays = this.getShowDays();
    this.render(); //重新渲染
  },
  handleMonth: function(dom) {
    let isPrev = dom.getAttribute('class').includes('prev');
    let moveMonth = isPrev ? -1 : 1;
    let showDate = new Date(this.showDate.year, this.showDate.month, this.showDate.day);
    showDate.setMonth(this.showDate.month + moveMonth);
    this.showDate.year = showDate.getFullYear();
    this.showDate.month = showDate.getMonth();
    this.showDays = this.getShowDays();
    this.render(); //重新渲染

  }
};
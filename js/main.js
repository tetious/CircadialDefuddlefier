$(function () {

  var $cycleLength = $('#cycleLength');
  $cycleLength.val(25).change(function () {
    $cal.fullCalendar('refetchEvents');
  });

  var $wakeTime = $('#wakeTime').val('8:00 pm').change(function () {
    $cal.fullCalendar('refetchEvents');
  }).clockpicker({ autoclose: true, twelvehour: true });

  var getEvents = function (start, end, tz, cb) {
    var hourOffset = $cycleLength.val();
    var todayWakeTime = moment($wakeTime.val(), 'h:m a');
    var todaySleepTime = moment(todayWakeTime).add(-8, 'hours');
    var events = [];

    var baseDaysDiff = start.diff(todaySleepTime, 'days');
    var daysOffset = (baseDaysDiff / 24 + 1) * -1;

    for (var m = moment(start).add(daysOffset, 'd'); m.isSameOrBefore(end); m.add(1, 'd')) {
      var suntimes = SunCalc.getTimes(m, 34.236501, -84.490799);
      var daysDiff = m.diff(todaySleepTime, 'days');
      var sleepTime = moment(todaySleepTime).add(hourOffset * daysDiff, 'h');

      events.push({
        className: 'daylight',
        rendering: 'background',
        start: suntimes.sunrise,
        end: suntimes.sunset
      });

      if (m.isSameOrAfter(moment())) {
        events.push({
          title: 'Sleepy-time',
          className: 'sleeping',
          start: sleepTime,
          end: moment(sleepTime).add(8, 'h')
        });
      }
    }

    cb(events);
  };

  var $cal = $('#calendar').fullCalendar({
    customButtons: {
      pick: {
        text: moment().format('L'),
        click: function () {

          $(this).datepicker({ autoclose: true, startDate: moment().format('L') })
            .datepicker('setDate', $('.fc-pick-button').text())
            .datepicker('show').on('changeDate', function (e) {
            $(e.target).text(moment(e.date).format('L'));
            $cal.fullCalendar('gotoDate', e.date);
          });
        }
      }
    },
    header: {
      left: 'today,pick',
      center: 'title',
      right: 'prev,month,agendaWeek,next'
    },
    height: 660,
    timeFormat: 'h(:mm)t',
    defaultView: 'agendaWeek',
    viewRender: function (v) {
      $('.fc-pick-button').text(v.start.format('L'));
    },
    allDaySlot: false,
    slotDuration: '1:00:00',
    startDate: moment(),
    displayEventEnd: true,
    events: getEvents
  });

});



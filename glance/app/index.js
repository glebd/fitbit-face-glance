import clock from "clock";
import document from "document";
import {display} from "display";
import {me} from "appbit";
import {battery} from "power";
import {HeartRateSensor} from "heart-rate";

let weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
let months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

let myHours = $("hours");
let myMins = $("minutes");
let mySecs = $("seconds");
let minTicks = $("m_ticks");
let bg = $("bg");

let battery_percent = $("battery_percent");
let battery_gauge_bg = $("battery_arc_bg");
let battery_gauge_fg = $("battery_arc_fg");
let battery_gauge_width = battery_gauge_bg.sweepAngle;
let compl_battery = $("compl_battery");

let weekday_widget = $("weekday");
let date_widget = $("date");
let month_widget = $("month");

function $(s) {
  return document.getElementById(s);
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = "0";
    if (endAngle >= startAngle) {
      largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    } else {
      largeArcFlag = (endAngle + 360.0) - startAngle <= 180 ? "0" : "1";
    }

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

//let hr_arc = $("hr_arc").setAttribute("d", describeArc(150, 150, 100, 0, 270));

function onTick(now) {
  now = (now && now.date) || new Date();

  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();

  myHours.groupTransform.rotate.angle = (hours + mins/60)*30;
  myMins.groupTransform.rotate.angle = mins*6;
  mySecs.groupTransform.rotate.angle = secs*6;

  let weekday = weekdays[now.getDay()];
  let date = now.getDate();
  let month = now.getMonth();
  let month_name = months[month];
  weekday_widget.text = weekday;
  date_widget.text = pad(date);
  month_widget.text = month_name;

  battery_percent.text = battery.chargeLevel + "%";
  let battery_delta = Math.round(battery_gauge_width * battery.chargeLevel / 100.0);
  battery_gauge_fg.sweepAngle = battery_delta;
  if (battery.charging)
    compl_battery.style.display = "none";
  else if (battery.chargeLevel > 25) {
    battery_percent.style.fill = "green";
    battery_gauge_fg.style.fill = "green";
    compl_battery.style.display = "inline";
  } else if (battery.chargeLevel > 16) {
    battery_percent.style.fill = "orange";
    battery_gauge_fg.style.fill = "orange";
    compl_battery.style.display = "inline";
  } else {
    compl_battery.style.display = "none";
  }
}

function setAOD(on) {
  if(on) {
    clock.granularity = "minutes";
    mySecs.style.display = "none";
    minTicks.style.display = "none";
    bg.style.display = "none";
  } else {
    clock.granularity = "seconds";
    mySecs.style.display = "inline";
    minTicks.style.display = "inline";
    bg.style.display = "inline";
  }
}

if(display.aodAvailable && me.permissions.granted("access_aod")) {
  display.aodAllowed = true;
  display.onchange = () => {
    setAOD(display.aodActive);
    if(!display.aodActive) onTick();
  };
  setAOD(display.aodActive);
} else {
  clock.granularity = "seconds";
}

clock.ontick = onTick;
onTick();

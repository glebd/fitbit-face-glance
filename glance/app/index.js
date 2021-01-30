import clock from "clock";
import document from "document";
import {display} from "display";
import {me} from "appbit";
import {battery} from "power";

let myHours = $("hours");
let myMins = $("minutes");
let mySecs = $("seconds");
let minTicks = $("m_ticks");
let bg = $("bg");

let battery_percent = $("battery_percent");
let battery_gauge = $("battery_gauge");
let battery_gauge_bg = $("battery_gauge_bg");
let battery_gauge_width = battery_gauge_bg.x2 - battery_gauge_bg.x1;
let compl_battery = $("compl_battery");

function $(s) {
  return document.getElementById(s);
}

function onTick(now) {
  now = (now && now.date) || new Date();

  let hours = now.getHours() % 12;
  let mins = now.getMinutes();
  let secs = now.getSeconds();

  myHours.groupTransform.rotate.angle = (hours + mins/60)*30;
  myMins.groupTransform.rotate.angle = mins*6;
  mySecs.groupTransform.rotate.angle = secs*6;

  battery_percent.text = battery.chargeLevel + "%";
  let battery_delta = Math.round(battery_gauge_width * battery.chargeLevel / 100.0);
  battery_gauge.x2 = battery_gauge.x1 + battery_delta;
  if (battery.charging)
    compl_battery.style.display = "none";
  else if (battery.chargeLevel > 25) {
    battery_percent.style.fill = "green";
    battery_gauge.style.fill = "green";
    compl_battery.style.display = "inline";
  } else if (battery.chargeLevel > 16) {
    battery_percent.style.fill = "orange";
    battery_gauge.style.fill = "orange";
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

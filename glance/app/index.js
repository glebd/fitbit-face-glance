import clock from "clock";
import document from "document";

let myHours = $("hours");
let myMins = $("minutes");
let mySecs = $("seconds");

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
}

clock.granularity = "seconds";
clock.ontick = onTick;
onTick();

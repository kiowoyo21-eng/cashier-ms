"use client";

import {useMemo,useState} from "react";
import {ArrowLeft,ArrowRight,CalendarDays,Clock3,MapPin,UserRound} from "lucide-react";

export type RecruitmentCalendarEvent = {
  id:string;
  applicantId:string;
  applicantName:string;
  position:string;
  branch:string;
  round:string;
  at:string;
  interviewer:string;
  result:string;
};

const localDate=()=>{
  const now=new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};
const formatTime=(at:string)=>{
  const time=at.slice(11,16);
  if(!/^\d\d:\d\d$/.test(time))return "Time not set";
  const [hours,minutes]=time.split(":").map(Number);
  return `${hours%12||12}:${String(minutes).padStart(2,"0")} ${hours>=12?"PM":"AM"}`;
};
const formatDay=(day:string)=>new Date(`${day}T12:00:00`).toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric"});

export default function RecruitmentInterviewCalendar({events,onOpenApplicant,onGoToHiringCycle}:{
  events:RecruitmentCalendarEvent[];
  onOpenApplicant:(applicantId:string)=>void;
  onGoToHiringCycle:()=>void;
}){
  const [currentMonth,setCurrentMonth]=useState(()=>localDate().slice(0,7));
  const [selectedDay,setSelectedDay]=useState(()=>localDate());
  const [showAllUpcoming,setShowAllUpcoming]=useState(false);
  const [year,month]=currentMonth.split("-").map(Number);
  const firstWeekday=new Date(year,month-1,1).getDay();
  const daysInMonth=new Date(year,month,0).getDate();
  const monthTitle=new Date(year,month-1,1).toLocaleDateString("en-PH",{month:"long",year:"numeric"});
  const eventCounts=useMemo(()=>{
    const result:Record<string,number>={};
    for(const event of events){const key=event.at.slice(0,10);result[key]=(result[key]||0)+1;}
    return result;
  },[events]);
  const dailyEvents=events.filter(event=>event.at.slice(0,10)===selectedDay).sort((a,b)=>a.at.localeCompare(b.at));
  const upcoming=events.filter(event=>event.result==="Pending"&&event.at.slice(0,10)>=localDate()).sort((a,b)=>a.at.localeCompare(b.at));
  const visibleUpcoming=showAllUpcoming?upcoming:upcoming.slice(0,3);

  const moveMonth=(delta:number)=>{
    const next=new Date(year,month-1+delta,1);
    const value=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;
    setCurrentMonth(value);
    setSelectedDay(`${value}-01`);
  };
  const goToday=()=>{const date=localDate();setCurrentMonth(date.slice(0,7));setSelectedDay(date);};

  return <section className="uc-hire-calendar-panel" aria-label="Interview schedule calendar">
    <header className="uc-hire-calendar-header">
      <div><h3><CalendarDays size={18}/> Interview Calendar</h3><p>Interview schedules from the applicant records</p></div>
      <span className="uc-hire-calendar-count">{events.filter(event=>event.result==="Pending").length} scheduled</span>
    </header>
    <div className="uc-hire-calendar-navigation">
      <button type="button" className="uc-hire-calendar-iconbtn" onClick={()=>moveMonth(-1)} aria-label="Previous month"><ArrowLeft size={17}/></button>
      <strong>{monthTitle}</strong>
      <div className="uc-hire-calendar-navend">
        <button type="button" className="uc-hire-calendar-today" onClick={goToday}>Today</button>
        <button type="button" className="uc-hire-calendar-iconbtn" onClick={()=>moveMonth(1)} aria-label="Next month"><ArrowRight size={17}/></button>
      </div>
    </div>
    <div className="uc-hire-calendar-scroll"><div className="uc-hire-calendar-month" role="group" aria-label={monthTitle}>
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span className="uc-hire-calendar-weekday" key={day}>{day}</span>)}
      {Array.from({length:firstWeekday},(_,i)=><span key={`blank-${i}`} className="uc-hire-calendar-blank" aria-hidden="true"/>)}
      {Array.from({length:daysInMonth},(_,i)=>{
        const date=`${currentMonth}-${String(i+1).padStart(2,"0")}`;
        const count=eventCounts[date]||0;
        const isToday=date===localDate();
        const selected=date===selectedDay;
        return <button type="button" key={date} className={`uc-hire-calendar-day${selected?" is-selected":""}${count?" has-interviews":""}${isToday?" is-today":""}`} aria-pressed={selected} aria-label={`${formatDay(date)}: ${count} interview${count===1?"":"s"}`} onClick={()=>setSelectedDay(date)}><span>{i+1}</span>{count>0&&<small>{count} <span className="uc-hire-calendar-dot" aria-hidden="true"/></small>}</button>;
      })}
    </div>
    </div><div className="uc-hire-calendar-legend"><span><i/> Interview scheduled</span><span>Click a date to view appointments</span></div>
    <div className="uc-hire-calendar-agenda">
      <div className="uc-hire-calendar-agenda-head"><h4>{formatDay(selectedDay)} · Interviews</h4><span>{dailyEvents.length}</span></div>
      {dailyEvents.length?dailyEvents.map(event=><button key={`${event.applicantId}-${event.id}`} type="button" className="uc-hire-calendar-appointment" onClick={()=>onOpenApplicant(event.applicantId)}>
        <span className="uc-hire-calendar-appointment-time"><Clock3 size={13}/>{formatTime(event.at)}</span>
        <span className="uc-hire-calendar-appointment-info"><b>{event.applicantName}</b><small>{event.round} · {event.position}</small><small><MapPin size={12}/>{event.branch} · {event.interviewer}</small></span>
        <span className={`uc-hire-calendar-result${event.result==="Pending"?" is-pending":""}`}>{event.result}</span>
        <ArrowRight size={15}/>
      </button>):<p className="uc-hire-calendar-empty">No interviews on this date. Select a highlighted date or open Hiring Cycle to schedule one.</p>}
    </div>
    <div className="uc-hire-calendar-upcoming">
      <div className="uc-hire-calendar-agenda-head"><h4>Upcoming Interviews</h4><button type="button" onClick={onGoToHiringCycle}>Open Hiring Cycle <ArrowRight size={13}/></button></div>
      {visibleUpcoming.length?visibleUpcoming.map(event=><button key={`upcoming-${event.applicantId}-${event.id}`} type="button" className="uc-hire-calendar-upcoming-row" onClick={()=>{setCurrentMonth(event.at.slice(0,7));setSelectedDay(event.at.slice(0,10));}}><span><UserRound size={13}/><b>{event.applicantName}</b></span><small>{formatDay(event.at.slice(0,10))} · {formatTime(event.at)} · {event.round}</small></button>):<p className="uc-hire-calendar-empty">No upcoming interviews in the selected branch. Schedule one from Hiring Cycle.</p>}
      {upcoming.length>3&&<button type="button" className="uc-hire-calendar-more" onClick={()=>setShowAllUpcoming(value=>!value)}>{showAllUpcoming?"Show fewer interviews":`Show all ${upcoming.length} interviews`}</button>}
    </div>
  </section>;
}

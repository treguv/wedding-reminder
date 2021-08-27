require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const fetch = require("node-fetch");
const schedule = require("node-schedule");
const twilioNum = "";
const numone = "";
const numtwo = "";

console.log("Application Started!");

function getNumberOfDays(start, end) {
    const date1 = new Date(start);
    const date2 = new Date(end);

    // One day in milliseconds
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculating the time difference between two dates
    const diffInTime = date2.getTime() - date1.getTime();

    // Calculating the no. of days between two dates
    const diffInDays = Math.round(diffInTime / oneDay);

    return diffInDays;
}

function sendTheMessage(verse){
    let curTime = new Date();
    console.log(curTime);
    var dd = String(curTime.getDate());
    var mm = String(curTime.getMonth() + 1);
    var yy = curTime.getFullYear();
    console.log(mm + '/' + dd + '/' + yy);
    let date = mm + '/' + dd + '/' + yy;

    let daysLeft = getNumberOfDays(date, "6/12/22");

	let response = `Today is ${date}, this means there is only ${daysLeft} days left until our wedding! I love you <3\n\n` + 
    `${verse.details.text} \n ${verse.details.reference} `;
    console.log(response);
     //send to her
     client.messages
       .create({
          body: response,
          from: `${twilioNum}`,
          to: `${numone}`
        })
       .then(message => console.log(message.sid ))
       .catch(error => console.log(error));

    //send to me
    client.messages
    .create({
        body: response,
        from: `${twilioNum}`,
          to: `${numtwo}`
    })
    .then(message => console.log(message.sid));
}

//If this service ever goes back online it will select a random verse and send it along the message
const getVerse = async function (){
    fetch("http://www.ourmanna.com/verses/api/get?format=json")
    .then(response => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            console.log("NOT BROKEN");
        } else {
            console.log("BROKEN");
        }
    })
    .then(data => {
        if(data && data.vere){
            console.log(data.verse)
            sendTheMessage(data.verse);
        } else {
            let verse = {details:{
                text:"Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.",
                reference:"1 Corinthians 13:4-5"
            }}
            sendTheMessage(verse);
        }
    }
    ).catch(error => {
        console.log(error);
    });
}
//triggers every day at 9am
const job = schedule.scheduleJob('0 9 * * *', function(){
    getVerse();
  });


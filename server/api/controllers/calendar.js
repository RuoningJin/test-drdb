const asyncHandler = require("express-async-handler");
const model = require("../models/DRDB");

// Require google from googleapis package.
const { google } = require("googleapis");

// Create a new calender instance.

// {
//     "summary": "Meeting with David and Joe",
//     "location": "McMaster University",
//     "start": {
//         "dateTime": "2020-03-19T12:00:00.000",
//         "timeZone": "America/Toronto"
//     },
//     "end": {
//         "dateTime": "2020-03-19T15:30:00.000",
//         "timeZone": "America/Toronto"
//     },
//     "status": "confirmed",
//     "attendees": [
//         {
//             "email": "g.jaeger0226@gmail.com"

//         },
//         {
//             "email": "danmei@nuralogix.ai"
//         }
//     ],
//     "sendUpdates": "all"
// }

exports.create = asyncHandler(async (req, res) => {
  const event = req.body;
  const calendar = google.calendar({ version: "v3", auth: req.oAuth2Client });

  try {

    const calEvent = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
    });

    var updatedScheduleInfo = {};
    updatedScheduleInfo.calendarEventId = calEvent.data.id;
    updatedScheduleInfo.eventURL = calEvent.data.htmlLink;

    try {
      await model.schedule.update(updatedScheduleInfo, {
        where: { id: event.scheduleId },
      });
    } catch (error) {
      throw error;
    }

    res.status(200).send(calEvent.data);
    console.log("Calendar event successfully created: " + calEvent.data.id);
  } catch (error) {
    throw error;
  }
});

exports.update = asyncHandler(async (req, res) => {
  const event = req.body;
  const calendar = google.calendar({ version: "v3", auth: req.oAuth2Client });

  try {

    const calEvent = await calendar.events.patch({
      calendarId: "primary",
      eventId: req.query.eventId,
      resource: event,
      sendUpdates: "all",
    });
    res.status(200).send(calEvent.data);
    console.log("Calendar event successfully updated: " + calEvent.data.id);
  } catch (error) {
    throw error;
  }
});

exports.delete = asyncHandler(async (req, res) => {
  try {
    const calendar = google.calendar({ version: "v3", auth: req.oAuth2Client });

    const calEvent = await calendar.events.delete({
      calendarId: "primary",
      eventId: req.query.eventId,
      sendUpdates: "all",
    });
    res.status(200).send(calEvent.data);
    console.log("Calendar event successfully deleted: " + calEvent.data.id);
  } catch (error) {
    throw error;
  }
});
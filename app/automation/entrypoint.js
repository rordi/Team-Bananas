import axios from 'axios';
import { Client, logger } from "camunda-external-task-client-js";
import nodemailer from 'nodemailer';

// create reusable SMTP transporter
let transporter = nodemailer.createTransport({
  host: 'mail.digisailors.ch',
  port: 1025,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

// verify SMTP connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log(error); // eslint-disable-line no-console
  } else {
    console.log('✓ SMTP connection for sending emails is ready.'); // eslint-disable-line no-console
  }
});

// Camunda API config
const tenantId = 'bananas'
const processKey = 'employee_recruitment_to_be'
const baseUrl = 'https://digibp.herokuapp.com/engine-rest'
const commonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

// Camunda configuration for the Client and tenant
const config = {
    baseUrl,
    use: logger,
    asyncResponseTimeout: 10000,
    workerId: 'job_ad_worker',
    maxTasks: 1,
    lockDuration: 10000,
    headers: commonHeaders,
    tenantId:
    tenantId
};

// Mastodon API config
const matodonUrl = 'https://mstdn.social/api/v1/statuses'
const mastodonHeaders = {
  Authorization: `Bearer ${process.env.MASTODON_BEARER_TOKEN}`,
  'Content-Type': 'application/json',
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  Connection: 'keep-alive'
}

// create a Client instance with custom configuration
const client = new Client(config);

// connect to the post_social_media external task topic
client.subscribe('post_social_media', async function({ task, taskService }) {
    // Get a process variable
    const title = task.variables.get('title');
    const tweet = task.variables.get('tweet');

    // leave log traces
    console.log(`===================================`);
    
    // log current date time in format 2022-12-31 22:05
    console.log(`[${new Date().toLocaleString('en-GB')}]`);
    console.log(`Business key: ${task.businessKey}`);
    console.log(`Posting job ad for ${title} on Mastodon...`);
    console.log('Tweet:', tweet);

    // lock task
    await taskService.lock(task, 30);

    // post to Mastodon
    let success = true
    try {
      // post to Mastodon - comment out this line if something gets stuck to avoid publishing many times
      const response = await axios.post(matodonUrl, { status: tweet }, { headers: mastodonHeaders })
    } catch (error) {
      success = false
      console.log(error) // eslint-disable-line no-console
    }
    
    // Complete the task
    if (success) {
      await taskService.complete(task);
    } else {
      await taskService.handleFailure(task, {
        errorMessage: 'Error posting to Mastodon',
        errorDetails: 'Error posting to Mastodon',
        retries: 0,
        retryTimeout: 1000
      });
    }
});

client.subscribe('invite_for_interview', async function({ task, taskService }) {
    // Get a applicant details
    const name = task.variables.get('name');
    const email = task.variables.get('email');

    // leave log traces
    console.log(`===================================`);
    
    // log current date time in format 2022-12-31 22:05
    console.log(`[${new Date().toLocaleString('en-GB')}]`);
    console.log(`Applicant name: ${name}`);
    console.log(`Inviting ${email} to book slot for second interview...`);

    // lock task
    await taskService.lock(task, 30);

    // send email with booking link
    let success = true
    try {
      console.log('Sending email to', email)

      let mailOptions = {
        from: '"🤖 Digisailors Bot" <bot@digisailors.ch>"',
        to: email,
        subject: 'Digisailors - Invitation for second interview',
        text: `Dear ${name},\n\nYou passed the first screening interview! We would like to invite you for a second interview.\n\nPlease book a slot here: https://calendly.com/digisailors/second-interview\n\nBest regards,\nDigisailors`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          success = false
          console.log(error); // eslint-disable-line no-console
        } else {
          console.log('✓ Message sent: %s', info.messageId); // eslint-disable-line no-console
        }
      });
    } catch (error) {
      success = false
      console.log(error) // eslint-disable-line no-console
    }
    
    // Complete the task
    await taskService.complete(task);
});

client.start();

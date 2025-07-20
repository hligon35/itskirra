# 📱 SMS Notification Setup Guide

## Free SMS Setup for Appointment Notifications

### Step 1: Choose Your Method

#### Option A: Email-to-SMS Gateway (Completely Free)
Update the SMS_CONFIG in `script.js`:

```javascript
const SMS_CONFIG = {
    phoneNumber: '4632457230', // Kirra's phone number
    carrier: 'YOUR_CARRIER_GATEWAY', // See list below
    getSMSEmail: function() {
        return `${this.phoneNumber}@${this.carrier}`;
    }
};
```

#### Carrier SMS Gateways:
- **AT&T**: `txt.att.net`
- **Verizon**: `vtext.com`
- **T-Mobile**: `tmomail.net`
- **Sprint**: `messaging.sprintpcs.com`
- **US Cellular**: `email.uscc.net`
- **Boost Mobile**: `sms.myboostmobile.com`
- **Cricket**: `sms.cricketwireless.net`

### Step 2: Update Email Address
In `script.js`, line ~301, change:
```javascript
form.action = 'https://formsubmit.co/YOUR_EMAIL@gmail.com';
```

### Step 3: Test the Setup
1. Submit a test appointment
2. Check your email and phone for notifications
3. If SMS doesn't work, verify your carrier gateway

---

## Alternative: Twilio Setup (Paid but Reliable)

### Step 1: Sign up for Twilio
1. Go to [twilio.com](https://twilio.com)
2. Sign up for free account ($15 credit)
3. Get your Account SID, Auth Token, and phone number

### Step 2: Replace SMS Function
Replace the `sendSMSNotification` function with Twilio integration.

---

## Troubleshooting

### SMS Not Working?
1. **Verify carrier gateway** - Different carriers use different gateways
2. **Check message length** - Some carriers limit message size
3. **Test with email first** - Make sure FormSubmit is working
4. **Try different format** - Some carriers are picky about formatting

### Email Not Working?
1. **Verify email address** in FormSubmit URL
2. **Check spam folder**
3. **Use a verified email address**

---

## Message Format

**Email**: Full detailed appointment information
**SMS**: Short format for quick notifications

Example SMS: "NEW BOOKING: John Doe, 555-1234, Gel Nails, 12/25/2025, 2:00 PM"

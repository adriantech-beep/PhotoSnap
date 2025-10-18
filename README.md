Touchless Photo Booth – MVP Progress Documentation
Overview

The Touchless Photo Booth MVP enables users to take and edit photos without physically touching the booth hardware.
Users can scan a QR code to make a payment via phone, and after a successful payment, choose where to control the photo-taking and editing — either from the main booth screen or directly on their mobile device.

Phase 1 – Core MVP Features (✅ Completed)
1. QR Payment Generation

The booth dynamically creates a unique QR code for every new session.

When scanned, it directs users to a payment page accessible on their phones.

Enables contactless payment for a completely touch-free experience.

2. Payment Session Handling

Each QR corresponds to a unique payment session ID.

After successful payment, the backend verifies the session and triggers a redirect to the app.

Handles both success and failure states for reliable session tracking.

3. Current Redirect Flow

The system currently redirects users to the home screen after payment success.

The main booth remains ready for manual or remote control, but editing flow options aren’t yet provided.

Phase 2 – Improved Post-Payment Experience (🧱 In Progress)
Objective

Provide users with the choice of where they want to continue the experience after a successful payment:

Option 1: Use the main booth screen for photo-taking and editing.

Option 2: Use their phone to take and edit photos remotely.

Updated Flow Logic

User scans QR and completes payment on their phone.

After payment, the gateway redirects to:

https://boothapp.com/payment-success?sessionId={id}


The /payment-success page displays:

Payment Successful!
How would you like to continue?

[ Use Booth Screen ]
[ Use My Phone ]


User chooses an option:

Use Booth Screen → Sends a WebSocket/API signal to the booth app to switch to Photo + Edit Mode.

Use My Phone → Redirects to
/edit/:sessionId, allowing users to take and edit photos directly from their phones.

🛠️ Technical Implementation Notes
Component	Description
PaymentSuccess.jsx	New route/page that appears after payment success.
Session Validation	Verify the payment session (sessionId) with the backend before showing the success options.
WebSocket / API Integration	Enables booth and phone communication for real-time mode switching.
/edit/:sessionId	Route that opens the photo editing page on the phone.
Backend Endpoint	Validates session status, broadcasts booth update, and handles sync logic.
Tech Stack

Frontend: React, Vite, TailwindCSS, ShadCN UI

Backend: Node.js (Express), WebSocket / Socket.io for real-time booth communication

Payment Gateway: Integrated API for session handling and redirect flow

Database: MongoDB (for session and user data)

Example Success Flow
sequenceDiagram
    participant UserPhone
    participant BoothApp
    participant PaymentGateway
    participant Server

    UserPhone->>BoothApp: Scan QR Code (session link)
    BoothApp->>Server: Create Payment Session
    UserPhone->>PaymentGateway: Complete Payment
    PaymentGateway-->>Server: Payment Success (sessionId)
    Server-->>UserPhone: Redirect to /payment-success
    UserPhone->>UserPhone: Choose "Use Booth" or "Use My Phone"
    alt Use Booth
        UserPhone->>Server: Signal booth control
        Server-->>BoothApp: Switch to Edit Mode
    else Use My Phone
        UserPhone->>UserPhone: Redirect to /edit/:sessionId
    end

📅 Next Implementation Tasks
Priority	Task	Description
⭐	Create /payment-success page	New page after successful payment
⭐	Add UI with two options	“Use Booth Screen” and “Use My Phone”
🔄	Validate payment session	Ensure payment is confirmed before allowing continuation
⚡	Integrate booth communication	Send WebSocket signal to trigger booth edit mode
🧭	Implement redirect to /edit/:sessionId	Allow mobile photo editing session
🎯 Goal After This Phase

Once completed, the MVP will fully support:

✅ Secure contactless payment

✅ Smooth transition to photo-taking/editing

✅ Flexible control: booth or mobile

✅ Real-time booth and phone synchronization

# Setting Up Test Data for Campus Connect

## Creating an Organizer Account

To test the create-event functionality, you need an organizer account. Follow these steps:

### Step 1: Create an Organizer Account
1. Navigate to: http://localhost:9002/signup
2. Fill out the form with:
   - **Name**: Test Organizer
   - **Email**: organizer@test.com
   - **Password**: password123
   - **Confirm Password**: password123
   - **Role**: Select "Organizer" (NOT Student)
   - **Student ID**: Leave empty (only required for students)

### Step 2: Login with Organizer Account
1. Navigate to: http://localhost:9002/login
2. Use the credentials:
   - **Email**: organizer@test.com
   - **Password**: password123

### Step 3: Test Create Event
1. After logging in, navigate to: http://localhost:9002/create-event
2. You should now see the event creation form
3. Fill out the form to test event creation

## Test Student Account (Optional)
If you want to test the student experience:

1. Create a student account at http://localhost:9002/signup with:
   - **Role**: Student
   - **Student ID**: Any value like "STU001"

## Current Status
- ✅ Authentication system working
- ✅ Role-based access control implemented
- ✅ Create event page shows proper messages for unauthorized users
- ✅ Firebase integration working
- ✅ All dependencies installed and security issues resolved

## Features Available After Login as Organizer
- Create events with AI-generated banners
- Edit existing events
- View all events
- Access to AI description generator
- Event banner management

## Troubleshooting
If you encounter issues:
1. Make sure the development server is running: `npm run dev`
2. Check the browser console for any JavaScript errors
3. Verify Firebase configuration in `.env.local`
4. Ensure you're using the correct role (organizer) for event creation

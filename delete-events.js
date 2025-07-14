// Script to delete all events from Firebase Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAkFiv9paZF7-D1erlN8wjHhNbzZg9YSM8",
  authDomain: "campusconnect-dbb08.firebaseapp.com",
  projectId: "campusconnect-dbb08",
  storageBucket: "campusconnect-dbb08.firebasestorage.app",
  messagingSenderId: "183998920886",
  appId: "1:183998920886:web:9e81c9f44c04f8daad8e17",
  measurementId: "G-X98EX8YEJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllEvents() {
  try {
    console.log('🔍 Fetching all events...');
    
    // Get all events
    const eventsCollection = collection(db, 'events');
    const querySnapshot = await getDocs(eventsCollection);
    
    console.log(`📋 Found ${querySnapshot.size} events to delete`);
    
    if (querySnapshot.size === 0) {
      console.log('✅ No events found to delete');
      return;
    }
    
    // Delete each event
    const deletePromises = [];
    querySnapshot.forEach((eventDoc) => {
      console.log(`🗑️ Deleting event: ${eventDoc.data().title} (ID: ${eventDoc.id})`);
      deletePromises.push(deleteDoc(doc(db, 'events', eventDoc.id)));
    });
    
    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    
    console.log('✅ All events deleted successfully!');
    
    // Also delete all registrations since events are gone
    console.log('🔍 Fetching all registrations...');
    const registrationsCollection = collection(db, 'registrations');
    const registrationsSnapshot = await getDocs(registrationsCollection);
    
    console.log(`📋 Found ${registrationsSnapshot.size} registrations to delete`);
    
    if (registrationsSnapshot.size > 0) {
      const deleteRegistrationPromises = [];
      registrationsSnapshot.forEach((regDoc) => {
        console.log(`🗑️ Deleting registration: ${regDoc.id}`);
        deleteRegistrationPromises.push(deleteDoc(doc(db, 'registrations', regDoc.id)));
      });
      
      await Promise.all(deleteRegistrationPromises);
      console.log('✅ All registrations deleted successfully!');
    }
    
    console.log('🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error deleting events:', error);
  }
}

// Run the deletion
deleteAllEvents();

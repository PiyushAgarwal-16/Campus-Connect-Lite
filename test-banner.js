// Test script for banner generation API
const testBannerGeneration = async () => {
  const testData = {
    eventTitle: "Test Event",
    eventType: "Academic", 
    description: "This is a test event description for banner generation testing.",
    location: "Test Hall",
    date: "2025-07-15",
    colorScheme: "professional"
  };

  try {
    console.log('Testing banner generation with data:', testData);
    
    const response = await fetch('http://localhost:9002/api/generate-banner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
    if (response.ok) {
      console.log('✅ Banner generation successful!');
    } else {
      console.log('❌ Banner generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testBannerGeneration();

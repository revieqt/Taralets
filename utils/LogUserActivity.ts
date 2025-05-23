// utils/logUserActivity.ts
export const logUserActivity = async (userId: string, action: string) => {
  try {
    await fetch('https://yourserver.com/api/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Error logging user activity', error);
  }
};

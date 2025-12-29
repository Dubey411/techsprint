/**
 * Firestore Schema: users/{uid}
 * 
 * {
 *   name: "Shubham",
 *   email: "test@gmail.com",
 *   role: "volunteer",                  // restaurant | ngo | volunteer | admin
 * 
 *   location: {
 *     lat: 19.07,
 *     lng: 72.87
 *   },
 * 
 *   address: "Mumbai",
 *   phone: "9999999999",
 *   verified: false,
 * 
 *   isActive: true,
 *   currentTask: "donationId",
 * 
 *   completedTasks: 0,
 *   failedTasks: 0,
 *   rating: 5,
 * 
 *   stats: {
 *     totalDonated: 0,
 *     totalClaimed: 0,
 *     reliabilityScore: 100
 *   },
 * 
 *   capacity: {
 *     refrigerationMax: 100,
 *     refrigerationUsed: 0,
 *     storageMax: 500,
 *     storageUsed: 0,
 *     volunteerLimit: 10
 *   },
 * 
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

